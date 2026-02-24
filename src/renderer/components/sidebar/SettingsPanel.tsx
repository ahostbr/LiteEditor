import React, { useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'

type SettingScope = 'global' | 'workspace'
type IntegrationId = 'codex' | 'claude'
type IntegrationState =
  | 'not_installed'
  | 'installed_managed'
  | 'installed_external'
  | 'update_available'
  | 'broken'
  | 'verifying'
  | 'downloading'
  | 'installing'
  | 'failed'

type IntegrationStatus = {
  id: IntegrationId
  state: IntegrationState
  installedVersion: string | null
  latestVersion: string | null
  source: 'managed' | 'external' | null
  verified: boolean
  lastVerifiedAt: number | null
  message?: string
}

type IntegrationProgress = {
  id: IntegrationId
  stage: 'checking' | 'downloading' | 'verifying' | 'extracting' | 'installing' | 'finalizing' | 'done' | 'error'
  percent?: number
  message?: string
}

export function SettingsPanel() {
  const settings = useSettingsStore()
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const [integrationStatus, setIntegrationStatus] = React.useState<Record<IntegrationId, IntegrationStatus | null>>({
    codex: null,
    claude: null
  })
  const [integrationBusy, setIntegrationBusy] = React.useState<Record<IntegrationId, boolean>>({
    codex: false,
    claude: false
  })
  const [integrationProgress, setIntegrationProgress] = React.useState<Record<IntegrationId, IntegrationProgress | null>>({
    codex: null,
    claude: null
  })
  const [integrationError, setIntegrationError] = React.useState<string | null>(null)
  const [integrationLoading, setIntegrationLoading] = React.useState(false)

  const refreshIntegrations = React.useCallback(async () => {
    setIntegrationLoading(true)
    try {
      const statuses = await window.api.integrations.listStatus()
      const next: Record<IntegrationId, IntegrationStatus | null> = { codex: null, claude: null }
      for (const status of statuses) {
        if (status.id === 'codex' || status.id === 'claude') {
          next[status.id] = status
        }
      }
      setIntegrationStatus(next)
      setIntegrationError(null)
    } catch (err) {
      setIntegrationError(err instanceof Error ? err.message : String(err))
    } finally {
      setIntegrationLoading(false)
    }
  }, [])

  const setBusy = (id: IntegrationId, busy: boolean) => {
    setIntegrationBusy((prev) => ({ ...prev, [id]: busy }))
  }

  const runIntegrationAction = async (id: IntegrationId, action: () => Promise<unknown>) => {
    setBusy(id, true)
    setIntegrationError(null)
    try {
      await action()
      await refreshIntegrations()
    } catch (err) {
      setIntegrationError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(id, false)
    }
  }

  const handleCheckUpdates = async (id?: IntegrationId) => {
    try {
      if (id) {
        setBusy(id, true)
        await window.api.integrations.checkUpdates(id)
      } else {
        setIntegrationLoading(true)
        await window.api.integrations.checkUpdates()
      }
      await refreshIntegrations()
    } catch (err) {
      setIntegrationError(err instanceof Error ? err.message : String(err))
    } finally {
      if (id) setBusy(id, false)
      setIntegrationLoading(false)
    }
  }

  useEffect(() => {
    if (!settings.isLoaded) {
      settings.loadSettings()
    }
  }, [])

  useEffect(() => {
    void refreshIntegrations()
    const unsubscribe = window.api.integrations.onProgress((progress) => {
      if (progress.id !== 'codex' && progress.id !== 'claude') return
      setIntegrationProgress((prev) => ({ ...prev, [progress.id]: progress }))

      if (progress.stage === 'error' || progress.stage === 'done') {
        setBusy(progress.id, false)
        void refreshIntegrations()
        return
      }

      setBusy(progress.id, true)
    })
    return () => unsubscribe()
  }, [refreshIntegrations])

  const handleChange = (key: string, value: unknown, scope: SettingScope) => {
    if (scope === 'workspace' && projectRoot) {
      settings.setWorkspaceSetting(key, value)
    } else {
      settings.setSetting(key as any, value as any)
    }
  }

  const handleResetToGlobal = (key: string) => {
    settings.removeWorkspaceSetting(key)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Settings
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Editor Settings */}
        <SettingsSection title="Editor">
          <NumberSetting
            label="Font Size"
            settingKey="fontSize"
            value={settings.fontSize}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            min={8}
            max={32}
            hasOverride={settings.hasWorkspaceOverride('fontSize')}
            hasProject={!!projectRoot}
          />
          <TextSetting
            label="Font Family"
            settingKey="fontFamily"
            value={settings.fontFamily}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('fontFamily')}
            hasProject={!!projectRoot}
          />
          <NumberSetting
            label="Tab Size"
            settingKey="tabSize"
            value={settings.tabSize}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            min={1}
            max={8}
            hasOverride={settings.hasWorkspaceOverride('tabSize')}
            hasProject={!!projectRoot}
          />
          <SelectSetting
            label="Word Wrap"
            settingKey="wordWrap"
            value={settings.wordWrap}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'on', label: 'On' }
            ]}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('wordWrap')}
            hasProject={!!projectRoot}
          />
          <ToggleSetting
            label="Minimap"
            settingKey="minimap"
            value={settings.minimap}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('minimap')}
            hasProject={!!projectRoot}
          />
          <SelectSetting
            label="Line Numbers"
            settingKey="lineNumbers"
            value={settings.lineNumbers}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
              { value: 'relative', label: 'Relative' }
            ]}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('lineNumbers')}
            hasProject={!!projectRoot}
          />
          <SelectSetting
            label="Auto Save"
            settingKey="autoSave"
            value={settings.autoSave}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'afterDelay', label: 'After Delay' },
              { value: 'onFocusChange', label: 'On Focus Change' }
            ]}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('autoSave')}
            hasProject={!!projectRoot}
          />
          {settings.autoSave === 'afterDelay' && (
            <NumberSetting
              label="Auto Save Delay (ms)"
              settingKey="autoSaveDelay"
              value={settings.autoSaveDelay}
              onChange={handleChange}
              onReset={handleResetToGlobal}
              min={100}
              max={10000}
              step={100}
              hasOverride={settings.hasWorkspaceOverride('autoSaveDelay')}
              hasProject={!!projectRoot}
            />
          )}
        </SettingsSection>

        {/* Terminal Settings */}
        <SettingsSection title="Terminal">
          <NumberSetting
            label="Font Size"
            settingKey="terminalFontSize"
            value={settings.terminalFontSize}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            min={8}
            max={24}
            hasOverride={settings.hasWorkspaceOverride('terminalFontSize')}
            hasProject={!!projectRoot}
          />
          <TextSetting
            label="Shell Path"
            settingKey="terminalShell"
            value={settings.terminalShell}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            placeholder="System default"
            hasOverride={settings.hasWorkspaceOverride('terminalShell')}
            hasProject={!!projectRoot}
          />
        </SettingsSection>

        {/* Zen Mode */}
        <SettingsSection title="Zen Mode">
          <SelectSetting
            label="Editor Mode"
            settingKey="zenEditorMode"
            value={settings.zenEditorMode}
            options={[
              { value: 'separate', label: 'Separate Panels' },
              { value: 'unified', label: 'Unified Editor' }
            ]}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('zenEditorMode')}
            hasProject={!!projectRoot}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <ColorSetting
            label="Accent Color"
            settingKey="accentColor"
            value={settings.accentColor}
            onChange={handleChange}
            onReset={handleResetToGlobal}
            hasOverride={settings.hasWorkspaceOverride('accentColor')}
            hasProject={!!projectRoot}
          />
        </SettingsSection>

        <SettingsSection title="Integrations">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Install and update Codex and Claude without VS Code preinstall.
            </span>
            <button
              onClick={() => void handleCheckUpdates()}
              disabled={integrationLoading}
              className="px-2 py-1 text-[10px] rounded disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              Check Updates
            </button>
          </div>

          {integrationError && (
            <div
              className="px-2 py-1 rounded text-[10px]"
              style={{
                backgroundColor: 'rgba(255,0,0,0.08)',
                border: '1px solid rgba(255,0,0,0.25)',
                color: 'var(--text-secondary)'
              }}
            >
              {integrationError}
            </div>
          )}

          <IntegrationCard
            title="Codex"
            status={integrationStatus.codex}
            progress={integrationProgress.codex}
            busy={integrationBusy.codex}
            onInstall={() => void runIntegrationAction('codex', () => window.api.integrations.install('codex'))}
            onUpdate={() => void runIntegrationAction('codex', () => window.api.integrations.update('codex'))}
            onVerify={() => void runIntegrationAction('codex', () => window.api.integrations.verify('codex'))}
            onReinstall={() => void runIntegrationAction('codex', () => window.api.integrations.install('codex', { reinstall: true }))}
            onRevealPath={() => void window.api.integrations.revealPath('codex')}
            onRevealLog={() => void window.api.integrations.revealLog('codex')}
            onCheckUpdates={() => void handleCheckUpdates('codex')}
          />

          <IntegrationCard
            title="Claude Code"
            status={integrationStatus.claude}
            progress={integrationProgress.claude}
            busy={integrationBusy.claude}
            onInstall={() => void runIntegrationAction('claude', () => window.api.integrations.install('claude'))}
            onUpdate={() => void runIntegrationAction('claude', () => window.api.integrations.update('claude'))}
            onVerify={() => void runIntegrationAction('claude', () => window.api.integrations.verify('claude'))}
            onReinstall={() => void runIntegrationAction('claude', () => window.api.integrations.install('claude', { reinstall: true }))}
            onRevealPath={() => void window.api.integrations.revealPath('claude')}
            onRevealLog={() => void window.api.integrations.revealLog('claude')}
            onCheckUpdates={() => void handleCheckUpdates('claude')}
          />
        </SettingsSection>
      </div>
    </div>
  )
}

function IntegrationCard({
  title,
  status,
  progress,
  busy,
  onInstall,
  onUpdate,
  onVerify,
  onReinstall,
  onRevealPath,
  onRevealLog,
  onCheckUpdates
}: {
  title: string
  status: IntegrationStatus | null
  progress: IntegrationProgress | null
  busy: boolean
  onInstall: () => void
  onUpdate: () => void
  onVerify: () => void
  onReinstall: () => void
  onRevealPath: () => void
  onRevealLog: () => void
  onCheckUpdates: () => void
}) {
  const state = status?.state ?? 'not_installed'
  const showInstall = state === 'not_installed' || state === 'broken'
  const showUpdate = state === 'update_available'
  const showVerify = state !== 'not_installed'
  const showReinstall = state === 'installed_managed' || state === 'update_available' || state === 'broken'

  return (
    <div
      className="rounded px-2 py-2 space-y-2"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-overlay)'
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: stateColor(state).background,
              color: stateColor(state).text,
              border: `1px solid ${stateColor(state).border}`
            }}
          >
            {state.replaceAll('_', ' ')}
          </span>
        </div>
        <button
          onClick={onCheckUpdates}
          disabled={busy}
          className="text-[10px] px-2 py-0.5 rounded disabled:opacity-50"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)'
          }}
        >
          Check
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        <InfoLine label="Installed" value={status?.installedVersion ?? '-'} />
        <InfoLine label="Latest" value={status?.latestVersion ?? '-'} />
        <InfoLine label="Source" value={status?.source ?? '-'} />
        <InfoLine label="Verified" value={status?.verified ? 'yes' : 'no'} />
        <InfoLine label="Last Verify" value={formatTime(status?.lastVerifiedAt ?? null)} />
        <InfoLine label="Message" value={status?.message ?? '-'} />
      </div>

      {progress && (
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {progress.stage}
          {typeof progress.percent === 'number' ? ` (${progress.percent}%)` : ''}
          {progress.message ? ` - ${progress.message}` : ''}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {showInstall && (
          <ActionButton label="Install" onClick={onInstall} disabled={busy} />
        )}
        {showUpdate && (
          <ActionButton label="Update" onClick={onUpdate} disabled={busy} />
        )}
        {showVerify && (
          <ActionButton label="Verify" onClick={onVerify} disabled={busy} />
        )}
        {showReinstall && (
          <ActionButton label="Reinstall" onClick={onReinstall} disabled={busy} />
        )}
        <ActionButton label="Open Logs" onClick={onRevealLog} disabled={busy} />
        <ActionButton label="Show Folder" onClick={onRevealPath} disabled={busy} />
      </div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="truncate" style={{ color: 'var(--text-primary)' }} title={value}>{value}</span>
    </div>
  )
}

function ActionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[10px] px-2 py-1 rounded disabled:opacity-50"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }}
    >
      {label}
    </button>
  )
}

function formatTime(value: number | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function stateColor(state: IntegrationState): { background: string; border: string; text: string } {
  switch (state) {
    case 'installed_managed':
      return { background: 'rgba(52,199,89,0.1)', border: 'rgba(52,199,89,0.35)', text: '#9de7b1' }
    case 'installed_external':
      return { background: 'rgba(79,163,255,0.1)', border: 'rgba(79,163,255,0.35)', text: '#9ccaff' }
    case 'update_available':
      return { background: 'rgba(255,174,66,0.1)', border: 'rgba(255,174,66,0.35)', text: '#f7cb88' }
    case 'broken':
    case 'failed':
      return { background: 'rgba(255,69,58,0.1)', border: 'rgba(255,69,58,0.35)', text: '#ffb2ad' }
    case 'downloading':
    case 'installing':
    case 'verifying':
      return { background: 'rgba(130,127,255,0.1)', border: 'rgba(130,127,255,0.35)', text: '#c7c6ff' }
    default:
      return { background: 'rgba(128,128,128,0.1)', border: 'rgba(128,128,128,0.3)', text: '#bdbdbd' }
  }
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

interface ScopeProps {
  settingKey: string
  hasOverride: boolean
  hasProject: boolean
  onChange: (key: string, value: unknown, scope: SettingScope) => void
  onReset: (key: string) => void
}

function ScopeSelector({ settingKey, hasOverride, hasProject, onChange, onReset, currentScope, setScope }: ScopeProps & { currentScope: SettingScope; setScope: (s: SettingScope) => void }) {
  if (!hasProject) return null

  return (
    <div className="flex items-center gap-1 ml-1">
      {hasOverride && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
          title="Workspace override active"
        />
      )}
      <select
        value={currentScope}
        onChange={(e) => setScope(e.target.value as SettingScope)}
        className="text-[9px] px-0.5 py-0 rounded outline-none cursor-pointer"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          border: 'none'
        }}
        title="Setting scope"
      >
        <option value="global">Global</option>
        <option value="workspace">Project</option>
      </select>
      {hasOverride && (
        <button
          onClick={() => onReset(settingKey)}
          className="text-[9px] px-1 rounded hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
          title="Reset to global value"
        >
          ×
        </button>
      )}
    </div>
  )
}

function NumberSetting({
  label, settingKey, value, onChange, onReset, min, max, step = 1, hasOverride, hasProject
}: {
  label: string; settingKey: string; value: number; min?: number; max?: number; step?: number
} & ScopeProps) {
  const [scope, setScope] = React.useState<SettingScope>(hasOverride ? 'workspace' : 'global')

  React.useEffect(() => {
    if (hasOverride) setScope('workspace')
  }, [hasOverride])

  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-1">
        <ScopeSelector
          settingKey={settingKey}
          hasOverride={hasOverride}
          hasProject={hasProject}
          onChange={onChange}
          onReset={onReset}
          currentScope={scope}
          setScope={setScope}
        />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(settingKey, Number(e.target.value), scope)}
          min={min}
          max={max}
          step={step}
          className="w-20 px-2 py-0.5 text-xs rounded outline-none"
          style={{
            backgroundColor: 'var(--bg-overlay)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)'
          }}
        />
      </div>
    </SettingRow>
  )
}

function TextSetting({
  label, settingKey, value, onChange, onReset, placeholder, hasOverride, hasProject
}: {
  label: string; settingKey: string; value: string; placeholder?: string
} & ScopeProps) {
  const [scope, setScope] = React.useState<SettingScope>(hasOverride ? 'workspace' : 'global')

  React.useEffect(() => {
    if (hasOverride) setScope('workspace')
  }, [hasOverride])

  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-1 flex-1">
        <ScopeSelector
          settingKey={settingKey}
          hasOverride={hasOverride}
          hasProject={hasProject}
          onChange={onChange}
          onReset={onReset}
          currentScope={scope}
          setScope={setScope}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value, scope)}
          placeholder={placeholder}
          className="w-full px-2 py-0.5 text-xs rounded outline-none"
          style={{
            backgroundColor: 'var(--bg-overlay)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)'
          }}
        />
      </div>
    </SettingRow>
  )
}

function SelectSetting({
  label, settingKey, value, options, onChange, onReset, hasOverride, hasProject
}: {
  label: string; settingKey: string; value: string; options: { value: string; label: string }[]
} & ScopeProps) {
  const [scope, setScope] = React.useState<SettingScope>(hasOverride ? 'workspace' : 'global')

  React.useEffect(() => {
    if (hasOverride) setScope('workspace')
  }, [hasOverride])

  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-1">
        <ScopeSelector
          settingKey={settingKey}
          hasOverride={hasOverride}
          hasProject={hasProject}
          onChange={onChange}
          onReset={onReset}
          currentScope={scope}
          setScope={setScope}
        />
        <select
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value, scope)}
          className="px-2 py-0.5 text-xs rounded outline-none"
          style={{
            backgroundColor: 'var(--bg-overlay)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)'
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </SettingRow>
  )
}

function ToggleSetting({
  label, settingKey, value, onChange, onReset, hasOverride, hasProject
}: {
  label: string; settingKey: string; value: boolean
} & ScopeProps) {
  const [scope, setScope] = React.useState<SettingScope>(hasOverride ? 'workspace' : 'global')

  React.useEffect(() => {
    if (hasOverride) setScope('workspace')
  }, [hasOverride])

  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-1">
        <ScopeSelector
          settingKey={settingKey}
          hasOverride={hasOverride}
          hasProject={hasProject}
          onChange={onChange}
          onReset={onReset}
          currentScope={scope}
          setScope={setScope}
        />
        <button
          onClick={() => onChange(settingKey, !value, scope)}
          className="w-8 h-4 rounded-full transition-colors relative"
          style={{ backgroundColor: value ? 'var(--accent)' : 'var(--bg-muted)' }}
        >
          <div
            className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
            style={{
              backgroundColor: 'var(--text-primary)',
              transform: value ? 'translateX(16px)' : 'translateX(2px)'
            }}
          />
        </button>
      </div>
    </SettingRow>
  )
}

function ColorSetting({
  label, settingKey, value, onChange, onReset, hasOverride, hasProject
}: {
  label: string; settingKey: string; value: string
} & ScopeProps) {
  const [scope, setScope] = React.useState<SettingScope>(hasOverride ? 'workspace' : 'global')

  React.useEffect(() => {
    if (hasOverride) setScope('workspace')
  }, [hasOverride])

  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-1">
        <ScopeSelector
          settingKey={settingKey}
          hasOverride={hasOverride}
          hasProject={hasProject}
          onChange={onChange}
          onReset={onReset}
          currentScope={scope}
          setScope={setScope}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value, scope)}
          className="w-8 h-6 rounded cursor-pointer"
          style={{ border: '1px solid var(--border)' }}
        />
      </div>
    </SettingRow>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}
