import React, { useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'

type SettingScope = 'global' | 'workspace'

export function SettingsPanel() {
  const settings = useSettingsStore()
  const projectRoot = useEditorStore((s) => s.projectRoot)

  useEffect(() => {
    if (!settings.isLoaded) {
      settings.loadSettings()
    }
  }, [])

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
      </div>
    </div>
  )
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
