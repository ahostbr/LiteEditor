export type IntegrationId = 'codex' | 'claude'

export type IntegrationSource = 'managed' | 'external' | null

export type IntegrationState =
  | 'not_installed'
  | 'installed_managed'
  | 'installed_external'
  | 'update_available'
  | 'broken'
  | 'verifying'
  | 'downloading'
  | 'installing'
  | 'failed'

export type IntegrationProgressStage =
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'extracting'
  | 'installing'
  | 'finalizing'
  | 'done'
  | 'error'

export interface IntegrationProgress {
  id: IntegrationId
  stage: IntegrationProgressStage
  percent?: number
  message?: string
}

export interface IntegrationStatus {
  id: IntegrationId
  state: IntegrationState
  installedVersion: string | null
  latestVersion: string | null
  source: IntegrationSource
  verified: boolean
  lastVerifiedAt: number | null
  message?: string
}

export interface IntegrationManifest {
  extensionId: string
  publisher: string
  name: string
  version: string
  targetPlatform?: string | null
  downloadUrl: string
  sha256: string | null
  publishedAt: number | null
}

export interface IntegrationSpec {
  id: IntegrationId
  displayName: string
  extensionId: string
  publisher: string
  name: string
  requiredFiles: string[]
}

export const INTEGRATION_SPECS: Record<IntegrationId, IntegrationSpec> = {
  codex: {
    id: 'codex',
    displayName: 'Codex',
    extensionId: 'openai.chatgpt',
    publisher: 'openai',
    name: 'chatgpt',
    requiredFiles: ['webview/index.html', 'bin/windows-x86_64/codex.exe']
  },
  claude: {
    id: 'claude',
    displayName: 'Claude Code',
    extensionId: 'anthropic.claude-code',
    publisher: 'anthropic',
    name: 'claude-code',
    requiredFiles: ['webview/index.js', 'resources/native-binary/claude.exe']
  }
}
