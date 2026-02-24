import { createHash } from 'crypto'
import { EventEmitter } from 'events'
import {
  appendFileSync,
  cpSync,
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs'
import { homedir, tmpdir } from 'os'
import { join } from 'path'
import { spawn } from 'child_process'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { MarketplaceProvider } from './marketplace-provider'
import {
  INTEGRATION_SPECS,
  type IntegrationId,
  type IntegrationManifest,
  type IntegrationProgress,
  type IntegrationState,
  type IntegrationStatus
} from './integrations-types'

interface ResolvedIntegration {
  id: IntegrationId
  path: string
  source: 'managed' | 'external'
  version: string | null
}

interface DiscoveryResult {
  valid: ResolvedIntegration | null
  broken: { path: string; version: string | null; message: string } | null
}

interface InstallRecord {
  extensionId: string
  publisher: string
  name: string
  version: string
  installedAt: number
  vsixSha256: string
  requiredFileHashes: Record<string, string>
}

interface IntegrationCacheEntry {
  lastVerifiedAt: number | null
  verifiedVersion: string | null
  lastVerifiedHash: string | null
  latestVersion: string | null
  lastCheckedAt: number | null
  lastError?: string
}

type IntegrationCache = Record<IntegrationId, IntegrationCacheEntry>

const DEFAULT_CACHE_ENTRY: IntegrationCacheEntry = {
  lastVerifiedAt: null,
  verifiedVersion: null,
  lastVerifiedHash: null,
  latestVersion: null,
  lastCheckedAt: null
}
const OPERATION_LOCK_STALE_MS = 30 * 60 * 1000

export class IntegrationsManager extends EventEmitter {
  private readonly provider = new MarketplaceProvider()
  private readonly activeOperations = new Set<IntegrationId>()
  private readonly lastLoggedStage = new Map<IntegrationId, string>()
  private readonly runtimeStates = new Map<IntegrationId, { state: IntegrationState; message?: string }>()
  private cache: IntegrationCache = this.loadCache()

  resolve(id: IntegrationId): ResolvedIntegration | null {
    const managed = this.discoverManaged(id).valid
    if (managed) return managed
    return this.discoverExternal(id).valid
  }

  listStatus(): IntegrationStatus[] {
    return (Object.keys(INTEGRATION_SPECS) as IntegrationId[]).map((id) => this.getStatus(id))
  }

  getStatus(id: IntegrationId): IntegrationStatus {
    const spec = INTEGRATION_SPECS[id]
    const cacheEntry = this.ensureCacheEntry(id)
    const managed = this.discoverManaged(id)
    const external = this.discoverExternal(id)
    const resolved = managed.valid ?? external.valid
    const broken = managed.broken ?? external.broken

    let state: IntegrationState = 'not_installed'
    let source: 'managed' | 'external' | null = null
    let installedVersion: string | null = null
    let message: string | undefined

    if (resolved) {
      source = resolved.source
      installedVersion = resolved.version
      state = resolved.source === 'managed' ? 'installed_managed' : 'installed_external'
    } else if (broken) {
      state = 'broken'
      installedVersion = broken.version
      message = broken.message
    }

    const latestVersion = cacheEntry.latestVersion
    if (latestVersion && installedVersion && this.compareVersions(latestVersion, installedVersion) > 0 && state !== 'broken') {
      state = 'update_available'
    }

    const verified = !!(
      source === 'managed'
      && installedVersion
      && cacheEntry.verifiedVersion === installedVersion
      && cacheEntry.lastVerifiedAt
    )

    if (!message && cacheEntry.lastError) {
      message = cacheEntry.lastError
    }

    const override = this.runtimeStates.get(id)
    if (override) {
      state = override.state
      message = override.message ?? message
    }

    return {
      id,
      state,
      installedVersion,
      latestVersion,
      source,
      verified,
      lastVerifiedAt: cacheEntry.lastVerifiedAt,
      message: message ?? (resolved ? `${spec.displayName} detected from ${source}` : undefined)
    }
  }

  async checkUpdates(targetId?: IntegrationId): Promise<IntegrationStatus[]> {
    const ids = targetId ? [targetId] : (Object.keys(INTEGRATION_SPECS) as IntegrationId[])
    for (const id of ids) {
      this.emitProgress({ id, stage: 'checking', message: 'Checking Marketplace for updates...' })
      try {
        const manifest = await this.provider.fetchLatestManifest(id)
        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.latestVersion = manifest.version
        cacheEntry.lastCheckedAt = Date.now()
        delete cacheEntry.lastError
        this.runtimeStates.delete(id)
        this.appendIntegrationLog(id, `Update check succeeded. Latest Marketplace version: ${manifest.version}.`)
      } catch (err) {
        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.lastCheckedAt = Date.now()
        cacheEntry.lastError = err instanceof Error ? err.message : String(err)
        this.runtimeStates.delete(id)
        this.appendIntegrationLog(id, `Update check failed: ${cacheEntry.lastError}`)
      }
    }

    this.saveCache()
    return this.listStatus()
  }

  async install(id: IntegrationId, options: { reinstall?: boolean } = {}): Promise<IntegrationStatus> {
    return this.runExclusive(id, async () => {
      const reinstall = options.reinstall ?? false
      const tempDir = join(tmpdir(), `liteeditor-${id}-${Date.now()}`)
      const vsixPath = join(tempDir, `${id}.vsix`)
      const extractPath = join(tempDir, 'extract')

      mkdirSync(tempDir, { recursive: true })
      this.emitProgress({ id, stage: 'checking', message: 'Fetching release metadata...' })

      try {
        const manifest = await this.provider.fetchLatestManifest(id)
        this.updateCacheFromManifest(id, manifest)

        const existingManaged = this.discoverManaged(id).valid
        if (existingManaged && !reinstall && existingManaged.version === manifest.version) {
          this.emitProgress({ id, stage: 'done', message: 'Already up to date.' })
          this.runtimeStates.delete(id)
          return this.getStatus(id)
        }

        this.emitProgress({ id, stage: 'downloading', message: `Downloading ${manifest.extensionId}@${manifest.version}...`, percent: 0 })
        await this.downloadVsix(manifest.downloadUrl, vsixPath, id)

        this.emitProgress({ id, stage: 'verifying', message: 'Verifying download integrity...' })
        const { hex: archiveHashHex, base64: archiveHashBase64 } = await this.sha256File(vsixPath)
        if (manifest.sha256) {
          if (!this.matchesHash(manifest.sha256, archiveHashHex, archiveHashBase64)) {
            throw new Error('SHA256 mismatch: downloaded archive hash does not match Marketplace metadata.')
          }
        } else {
          this.emitProgress({
            id,
            stage: 'verifying',
            message: 'Marketplace did not provide SHA256; validating extension identity and runtime files instead.'
          })
        }

        this.emitProgress({ id, stage: 'extracting', message: 'Extracting VSIX package...' })
        mkdirSync(extractPath, { recursive: true })
        await this.extractArchive(vsixPath, extractPath)

        const payloadRoot = this.findPayloadRoot(extractPath)
        const identity = this.readAndValidateIdentity(payloadRoot, id)

        this.emitProgress({ id, stage: 'installing', message: 'Installing managed extension files...' })
        const finalPath = this.installManagedPayload(id, identity.version ?? manifest.version, payloadRoot)

        this.emitProgress({ id, stage: 'finalizing', message: 'Finalizing install metadata...' })
        const requiredFileHashes: Record<string, string> = {}
        for (const requiredFile of INTEGRATION_SPECS[id].requiredFiles) {
          const fullPath = this.resolveRelative(finalPath, requiredFile)
          const hash = await this.sha256File(fullPath)
          requiredFileHashes[requiredFile] = hash.hex
        }

        this.writeInstallRecord(finalPath, {
          extensionId: INTEGRATION_SPECS[id].extensionId,
          publisher: INTEGRATION_SPECS[id].publisher,
          name: INTEGRATION_SPECS[id].name,
          version: identity.version ?? manifest.version,
          installedAt: Date.now(),
          vsixSha256: archiveHashHex,
          requiredFileHashes
        })

        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.lastVerifiedAt = Date.now()
        cacheEntry.verifiedVersion = identity.version ?? manifest.version
        cacheEntry.lastVerifiedHash = archiveHashHex
        delete cacheEntry.lastError
        this.saveCache()

        this.emitProgress({ id, stage: 'done', message: 'Install completed successfully. Reopen the panel to load the new version.' })
        this.runtimeStates.delete(id)
        return this.getStatus(id)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.lastError = message
        this.saveCache()
        this.emitProgress({ id, stage: 'error', message })
        return this.getStatus(id)
      } finally {
        try { rmSync(tempDir, { recursive: true, force: true }) } catch { /* ignore */ }
      }
    })
  }

  async update(id: IntegrationId): Promise<IntegrationStatus> {
    return this.install(id, { reinstall: false })
  }

  async verify(id: IntegrationId): Promise<IntegrationStatus> {
    return this.runExclusive(id, async () => {
      this.emitProgress({ id, stage: 'verifying', message: 'Verifying integration files...' })
      try {
        const resolved = this.resolve(id)
        if (!resolved) {
          throw new Error('Integration is not installed.')
        }

        this.validateRequiredFiles(id, resolved.path)
        this.readAndValidateIdentity(resolved.path, id)

        if (resolved.source === 'managed') {
          const record = this.readInstallRecord(resolved.path)
          if (!record) {
            throw new Error('Managed install record is missing.')
          }
          if (!record.requiredFileHashes || typeof record.requiredFileHashes !== 'object') {
            throw new Error('Managed install record is invalid.')
          }
          for (const requiredFile of INTEGRATION_SPECS[id].requiredFiles) {
            const fullPath = this.resolveRelative(resolved.path, requiredFile)
            const actual = await this.sha256File(fullPath)
            const expected = record.requiredFileHashes[requiredFile]
            if (!expected || actual.hex.toLowerCase() !== expected.toLowerCase()) {
              throw new Error(`Integrity check failed for ${requiredFile}.`)
            }
          }
        }

        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.lastVerifiedAt = Date.now()
        cacheEntry.verifiedVersion = resolved.version
        delete cacheEntry.lastError
        this.saveCache()

        this.emitProgress({ id, stage: 'done', message: 'Verification completed.' })
        this.runtimeStates.delete(id)
        return this.getStatus(id)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const cacheEntry = this.ensureCacheEntry(id)
        cacheEntry.lastError = message
        this.saveCache()
        this.emitProgress({ id, stage: 'error', message })
        return this.getStatus(id)
      }
    })
  }

  revealPath(id: IntegrationId): string | null {
    const resolved = this.resolve(id)
    if (resolved) return resolved.path

    const managedRoot = join(this.getManagedRoot(), id)
    if (existsSync(managedRoot)) return managedRoot
    return null
  }

  revealLog(id: IntegrationId): string {
    const logPath = this.getLogPath(id)
    if (!existsSync(logPath)) {
      this.appendIntegrationLog(id, `Log created for ${INTEGRATION_SPECS[id].displayName}.`)
    }
    return logPath
  }

  private discoverManaged(id: IntegrationId): DiscoveryResult {
    const baseDir = join(this.getManagedRoot(), id)
    if (!existsSync(baseDir)) {
      return { valid: null, broken: null }
    }

    const versions = this.getVersionDirectories(baseDir)
    let broken: DiscoveryResult['broken'] = null
    for (const version of versions) {
      const fullPath = join(baseDir, version)
      const validation = this.validateCandidate(fullPath, id, 'managed')
      if (validation.ok) {
        return {
          valid: { id, path: fullPath, source: 'managed', version: validation.version ?? version },
          broken: null
        }
      }
      broken ??= { path: fullPath, version: validation.version ?? version, message: validation.message }
    }

    return { valid: null, broken }
  }

  private discoverExternal(id: IntegrationId): DiscoveryResult {
    const externalRoot = this.getExternalExtensionsRoot()
    if (!externalRoot || !existsSync(externalRoot)) {
      return { valid: null, broken: null }
    }

    const spec = INTEGRATION_SPECS[id]
    const prefix = `${spec.extensionId}-`
    let broken: DiscoveryResult['broken'] = null
    let candidates: string[] = []

    try {
      candidates = readdirSync(externalRoot)
        .filter((name) => name.startsWith(prefix))
        .sort((a, b) => this.compareVersions(a.slice(prefix.length), b.slice(prefix.length)))
        .reverse()
    } catch {
      return { valid: null, broken: null }
    }

    for (const folderName of candidates) {
      const fullPath = join(externalRoot, folderName)
      const validation = this.validateCandidate(fullPath, id, 'external')
      if (validation.ok) {
        return {
          valid: { id, path: fullPath, source: 'external', version: validation.version ?? folderName.slice(prefix.length) },
          broken: null
        }
      }
      broken ??= { path: fullPath, version: validation.version, message: validation.message }
    }

    return { valid: null, broken }
  }

  private validateCandidate(path: string, id: IntegrationId, source: 'managed' | 'external'): { ok: boolean; version: string | null; message: string } {
    try {
      if (!statSync(path).isDirectory()) {
        return { ok: false, version: null, message: 'Candidate is not a directory.' }
      }
    } catch {
      return { ok: false, version: null, message: 'Candidate path is not readable.' }
    }

    const identity = this.readIdentity(path)
    if (!identity) {
      return { ok: false, version: null, message: 'Missing package.json metadata.' }
    }

    const spec = INTEGRATION_SPECS[id]
    if (identity.publisher !== spec.publisher || identity.name !== spec.name) {
      return {
        ok: false,
        version: identity.version,
        message: `Identity mismatch: expected ${spec.extensionId}, got ${identity.publisher}.${identity.name}`
      }
    }

    const required = this.checkRequiredFiles(path, id)
    if (!required.ok) {
      return { ok: false, version: identity.version, message: required.message }
    }

    if (source === 'managed') {
      const managedRecordValidation = this.validateManagedInstallRecord(id, path)
      if (!managedRecordValidation.ok) {
        return { ok: false, version: identity.version, message: managedRecordValidation.message }
      }
    }

    return { ok: true, version: identity.version, message: 'ok' }
  }

  private validateManagedInstallRecord(id: IntegrationId, rootPath: string): { ok: boolean; message: string } {
    const record = this.readInstallRecord(rootPath)
    if (!record) {
      return { ok: false, message: 'Managed install record is missing.' }
    }

    const spec = INTEGRATION_SPECS[id]
    if (
      record.extensionId !== spec.extensionId
      || record.publisher?.toLowerCase() !== spec.publisher
      || record.name?.toLowerCase() !== spec.name
    ) {
      return {
        ok: false,
        message: `Managed install record identity mismatch: expected ${spec.extensionId}.`
      }
    }

    if (!record.requiredFileHashes || typeof record.requiredFileHashes !== 'object') {
      return { ok: false, message: 'Managed install record is missing required file hashes.' }
    }

    for (const requiredFile of spec.requiredFiles) {
      const expectedHash = record.requiredFileHashes[requiredFile]
      if (!expectedHash) {
        return { ok: false, message: `Managed install record is missing hash for ${requiredFile}.` }
      }
      const fullPath = this.resolveRelative(rootPath, requiredFile)
      const actualHash = this.sha256FileSync(fullPath)
      if (!actualHash || actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
        return { ok: false, message: `Managed install integrity check failed for ${requiredFile}.` }
      }
    }

    return { ok: true, message: 'ok' }
  }

  private validateRequiredFiles(id: IntegrationId, rootPath: string): void {
    const required = this.checkRequiredFiles(rootPath, id)
    if (!required.ok) {
      throw new Error(required.message)
    }
  }

  private checkRequiredFiles(rootPath: string, id: IntegrationId): { ok: boolean; message: string } {
    for (const relative of INTEGRATION_SPECS[id].requiredFiles) {
      if (!existsSync(this.resolveRelative(rootPath, relative))) {
        return {
          ok: false,
          message: `Missing required runtime file: ${relative}`
        }
      }
    }
    return { ok: true, message: 'ok' }
  }

  private readIdentity(rootPath: string): { publisher: string; name: string; version: string | null } | null {
    const packagePath = join(rootPath, 'package.json')
    if (!existsSync(packagePath)) return null

    try {
      const parsed = JSON.parse(readFileSync(packagePath, 'utf-8')) as { publisher?: unknown; name?: unknown; version?: unknown }
      const publisher = typeof parsed.publisher === 'string' ? parsed.publisher.trim().toLowerCase() : ''
      const name = typeof parsed.name === 'string' ? parsed.name.trim().toLowerCase() : ''
      const version = typeof parsed.version === 'string' ? parsed.version.trim() : null
      if (!publisher || !name) return null
      return { publisher, name, version }
    } catch {
      return null
    }
  }

  private readAndValidateIdentity(rootPath: string, id: IntegrationId): { version: string | null } {
    const identity = this.readIdentity(rootPath)
    const spec = INTEGRATION_SPECS[id]
    if (!identity) {
      throw new Error('Could not read package.json from extension payload.')
    }
    if (identity.publisher !== spec.publisher || identity.name !== spec.name) {
      throw new Error(`Identity mismatch. Expected ${spec.extensionId}, got ${identity.publisher}.${identity.name}`)
    }
    return { version: identity.version }
  }

  private getManagedRoot(): string {
    const appDataDir = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
    const managedRoot = join(appDataDir, 'LiteEditor', 'extensions')
    mkdirSync(managedRoot, { recursive: true })
    return managedRoot
  }

  private getExternalExtensionsRoot(): string | null {
    const homeDir = process.env.USERPROFILE || process.env.HOME || homedir()
    if (!homeDir) return null
    return join(homeDir, '.vscode', 'extensions')
  }

  private getCachePath(): string {
    return join(this.getManagedRoot(), 'manifest-cache.json')
  }

  private getLocksRoot(): string {
    const lockRoot = join(this.getManagedRoot(), '.locks')
    mkdirSync(lockRoot, { recursive: true })
    return lockRoot
  }

  private getLockPath(id: IntegrationId): string {
    return join(this.getLocksRoot(), `${id}.lock`)
  }

  private getLogsRoot(): string {
    const logsRoot = join(this.getManagedRoot(), 'logs')
    mkdirSync(logsRoot, { recursive: true })
    return logsRoot
  }

  private getLogPath(id: IntegrationId): string {
    return join(this.getLogsRoot(), `${id}.log`)
  }

  private loadCache(): IntegrationCache {
    const base: IntegrationCache = {
      codex: { ...DEFAULT_CACHE_ENTRY },
      claude: { ...DEFAULT_CACHE_ENTRY }
    }

    const cachePath = this.getCachePath()
    if (!existsSync(cachePath)) return base

    try {
      const parsed = JSON.parse(readFileSync(cachePath, 'utf-8')) as Partial<IntegrationCache>
      for (const id of Object.keys(INTEGRATION_SPECS) as IntegrationId[]) {
        base[id] = { ...DEFAULT_CACHE_ENTRY, ...(parsed[id] ?? {}) }
      }
    } catch {
      return base
    }

    return base
  }

  private ensureCacheEntry(id: IntegrationId): IntegrationCacheEntry {
    if (!this.cache[id]) {
      this.cache[id] = { ...DEFAULT_CACHE_ENTRY }
    }
    return this.cache[id]
  }

  private saveCache(): void {
    try {
      writeFileSync(this.getCachePath(), JSON.stringify(this.cache, null, 2), 'utf-8')
    } catch {
      // Cache failures should not break runtime behavior.
    }
  }

  private emitProgress(progress: IntegrationProgress): void {
    this.emit('progress', progress)
    this.logProgress(progress)

    if (progress.stage === 'error') {
      this.runtimeStates.set(progress.id, { state: 'failed', message: progress.message })
      return
    }
    if (progress.stage === 'done') {
      this.runtimeStates.delete(progress.id)
      return
    }

    const map: Record<string, IntegrationState> = {
      checking: 'verifying',
      downloading: 'downloading',
      verifying: 'verifying',
      extracting: 'installing',
      installing: 'installing',
      finalizing: 'installing'
    }

    this.runtimeStates.set(progress.id, {
      state: map[progress.stage] ?? 'installing',
      message: progress.message
    })
  }

  private logProgress(progress: IntegrationProgress): void {
    const previousStage = this.lastLoggedStage.get(progress.id)
    if (progress.stage !== previousStage || progress.stage === 'done' || progress.stage === 'error') {
      const percent = typeof progress.percent === 'number' ? ` (${progress.percent}%)` : ''
      const suffix = progress.message ? ` ${progress.message}` : ''
      this.appendIntegrationLog(progress.id, `[${progress.stage}]${percent}${suffix}`)
    }

    if (progress.stage === 'done' || progress.stage === 'error') {
      this.lastLoggedStage.delete(progress.id)
    } else {
      this.lastLoggedStage.set(progress.id, progress.stage)
    }
  }

  private appendIntegrationLog(id: IntegrationId, message: string): void {
    try {
      const line = `${new Date().toISOString()} ${message}\n`
      appendFileSync(this.getLogPath(id), line, 'utf-8')
    } catch {
      // Logging failures should not affect install/update flow.
    }
  }

  private async runExclusive<T>(id: IntegrationId, work: () => Promise<T>): Promise<T> {
    if (this.activeOperations.has(id)) {
      throw new Error(`${INTEGRATION_SPECS[id].displayName} already has an active operation.`)
    }

    this.activeOperations.add(id)
    let lockPath: string | null = null
    try {
      lockPath = this.acquireOperationLock(id)
      return await work()
    } finally {
      if (lockPath) {
        this.releaseOperationLock(lockPath)
      }
      this.activeOperations.delete(id)
    }
  }

  private acquireOperationLock(id: IntegrationId): string {
    const lockPath = this.getLockPath(id)
    const payload = JSON.stringify({ id, pid: process.pid, startedAt: Date.now() })

    try {
      writeFileSync(lockPath, payload, { encoding: 'utf-8', flag: 'wx' })
      return lockPath
    } catch {
      if (this.isLockStale(lockPath)) {
        try { rmSync(lockPath, { force: true }) } catch { /* ignore */ }
        try {
          writeFileSync(lockPath, payload, { encoding: 'utf-8', flag: 'wx' })
          return lockPath
        } catch {
          // Fall through to shared error below.
        }
      }
    }

    throw new Error(`${INTEGRATION_SPECS[id].displayName} already has an active operation.`)
  }

  private releaseOperationLock(lockPath: string): void {
    try { rmSync(lockPath, { force: true }) } catch { /* ignore */ }
  }

  private isLockStale(lockPath: string): boolean {
    try {
      const ageMs = Date.now() - statSync(lockPath).mtimeMs
      return ageMs > OPERATION_LOCK_STALE_MS
    } catch {
      return false
    }
  }

  private updateCacheFromManifest(id: IntegrationId, manifest: IntegrationManifest): void {
    const cacheEntry = this.ensureCacheEntry(id)
    cacheEntry.latestVersion = manifest.version
    cacheEntry.lastCheckedAt = Date.now()
    delete cacheEntry.lastError
    this.saveCache()
  }

  private async downloadVsix(url: string, destinationPath: string, id: IntegrationId): Promise<void> {
    const response = await fetch(url)
    if (!response.ok || !response.body) {
      throw new Error(`VSIX download failed (${response.status})`)
    }

    const total = Number(response.headers.get('content-length') ?? 0)
    let downloaded = 0
    const webReadable = response.body as unknown as globalThis.ReadableStream<Uint8Array>
    const nodeReadable = Readable.fromWeb(webReadable)
    const fileWriter = createWriteStream(destinationPath)

    nodeReadable.on('data', (chunk: Buffer | string) => {
      const chunkSize = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length
      downloaded += chunkSize
      if (total > 0) {
        const percent = Math.min(95, Math.round((downloaded / total) * 100))
        this.emitProgress({ id, stage: 'downloading', percent, message: 'Downloading VSIX package...' })
      }
    })

    await pipeline(nodeReadable, fileWriter)
  }

  private async sha256File(filePath: string): Promise<{ hex: string; base64: string }> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256')
      const stream = createReadStream(filePath)
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('error', reject)
      stream.on('end', () => {
        const digestHex = hash.digest('hex')
        const digestBase64 = Buffer.from(digestHex, 'hex').toString('base64')
        resolve({ hex: digestHex, base64: digestBase64 })
      })
    })
  }

  private sha256FileSync(filePath: string): string | null {
    if (!existsSync(filePath)) return null
    try {
      const hash = createHash('sha256')
      hash.update(readFileSync(filePath))
      return hash.digest('hex')
    } catch {
      return null
    }
  }

  private matchesHash(expected: string, actualHex: string, actualBase64: string): boolean {
    const normalized = expected.trim().replace(/^sha256:/i, '')
    const normalizedLower = normalized.toLowerCase()

    if (/^[a-f0-9]{64}$/i.test(normalized)) {
      return normalizedLower === actualHex.toLowerCase()
    }

    return normalized === actualBase64 || normalizedLower === actualHex.toLowerCase()
  }

  private async extractArchive(vsixPath: string, destination: string): Promise<void> {
    const command = (archivePath: string): string =>
      `Expand-Archive -LiteralPath '${this.escapePowerShell(archivePath)}' -DestinationPath '${this.escapePowerShell(destination)}' -Force`

    try {
      await this.runPowerShell(command(vsixPath))
      return
    } catch {
      const zipPath = `${vsixPath}.zip`
      cpSync(vsixPath, zipPath, { force: true })
      await this.runPowerShell(command(zipPath))
      try { rmSync(zipPath, { force: true }) } catch { /* ignore */ }
    }
  }

  private findPayloadRoot(extractPath: string): string {
    const extensionRoot = join(extractPath, 'extension')
    if (existsSync(join(extensionRoot, 'package.json'))) {
      return extensionRoot
    }
    if (existsSync(join(extractPath, 'package.json'))) {
      return extractPath
    }

    const children = readdirSync(extractPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(extractPath, entry.name))
    for (const child of children) {
      if (existsSync(join(child, 'package.json'))) {
        return child
      }
    }

    throw new Error('Extracted package does not contain a valid extension payload.')
  }

  private installManagedPayload(id: IntegrationId, version: string, sourcePath: string): string {
    const managedRoot = this.getManagedRoot()
    const integrationRoot = join(managedRoot, id)
    mkdirSync(integrationRoot, { recursive: true })

    const normalizedVersion = version || `unknown-${Date.now()}`
    const finalPath = join(integrationRoot, normalizedVersion)
    const tempInstallPath = join(integrationRoot, `.tmp-${normalizedVersion}-${Date.now()}`)

    try { rmSync(tempInstallPath, { recursive: true, force: true }) } catch { /* ignore */ }
    cpSync(sourcePath, tempInstallPath, { recursive: true, force: true })

    try { rmSync(finalPath, { recursive: true, force: true }) } catch { /* ignore */ }
    renameSync(tempInstallPath, finalPath)

    const keepVersion = normalizedVersion
    for (const existing of this.getVersionDirectories(integrationRoot)) {
      if (existing === keepVersion) continue
      try { rmSync(join(integrationRoot, existing), { recursive: true, force: true }) } catch { /* ignore */ }
    }

    this.validateRequiredFiles(id, finalPath)
    return finalPath
  }

  private writeInstallRecord(rootPath: string, record: InstallRecord): void {
    writeFileSync(join(rootPath, '.liteeditor-install.json'), JSON.stringify(record, null, 2), 'utf-8')
  }

  private readInstallRecord(rootPath: string): InstallRecord | null {
    const recordPath = join(rootPath, '.liteeditor-install.json')
    if (!existsSync(recordPath)) return null
    try {
      return JSON.parse(readFileSync(recordPath, 'utf-8')) as InstallRecord
    } catch {
      return null
    }
  }

  private getVersionDirectories(rootPath: string): string[] {
    try {
      return readdirSync(rootPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) => !entry.name.startsWith('.tmp-'))
        .map((entry) => entry.name)
        .sort((a, b) => this.compareVersions(a, b))
        .reverse()
    } catch {
      return []
    }
  }

  private compareVersions(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  }

  private resolveRelative(rootPath: string, relativePath: string): string {
    const segments = relativePath.split('/').filter(Boolean)
    return join(rootPath, ...segments)
  }

  private escapePowerShell(input: string): string {
    return input.replace(/'/g, "''")
  }

  private runPowerShell(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command], {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let stderr = ''
      proc.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString()
      })

      proc.on('error', reject)
      proc.on('exit', (code) => {
        if (code === 0) {
          resolve()
          return
        }
        reject(new Error(stderr.trim() || `PowerShell exited with code ${code ?? 'unknown'}`))
      })
    })
  }
}

export const integrationsManager = new IntegrationsManager()
