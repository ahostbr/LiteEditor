import React, { useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings-store'

export function SettingsPanel() {
  const settings = useSettingsStore()

  useEffect(() => {
    if (!settings.isLoaded) {
      settings.loadSettings()
    }
  }, [])

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
            value={settings.fontSize}
            onChange={(v) => settings.setSetting('fontSize', v)}
            min={8}
            max={32}
          />
          <TextSetting
            label="Font Family"
            value={settings.fontFamily}
            onChange={(v) => settings.setSetting('fontFamily', v)}
          />
          <NumberSetting
            label="Tab Size"
            value={settings.tabSize}
            onChange={(v) => settings.setSetting('tabSize', v)}
            min={1}
            max={8}
          />
          <SelectSetting
            label="Word Wrap"
            value={settings.wordWrap}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'on', label: 'On' }
            ]}
            onChange={(v) => settings.setSetting('wordWrap', v as 'on' | 'off')}
          />
          <ToggleSetting
            label="Minimap"
            value={settings.minimap}
            onChange={(v) => settings.setSetting('minimap', v)}
          />
          <SelectSetting
            label="Line Numbers"
            value={settings.lineNumbers}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
              { value: 'relative', label: 'Relative' }
            ]}
            onChange={(v) => settings.setSetting('lineNumbers', v as 'on' | 'off' | 'relative')}
          />
          <SelectSetting
            label="Auto Save"
            value={settings.autoSave}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'afterDelay', label: 'After Delay' },
              { value: 'onFocusChange', label: 'On Focus Change' }
            ]}
            onChange={(v) => settings.setSetting('autoSave', v as 'off' | 'afterDelay' | 'onFocusChange')}
          />
          {settings.autoSave === 'afterDelay' && (
            <NumberSetting
              label="Auto Save Delay (ms)"
              value={settings.autoSaveDelay}
              onChange={(v) => settings.setSetting('autoSaveDelay', v)}
              min={100}
              max={10000}
              step={100}
            />
          )}
        </SettingsSection>

        {/* Terminal Settings */}
        <SettingsSection title="Terminal">
          <NumberSetting
            label="Font Size"
            value={settings.terminalFontSize}
            onChange={(v) => settings.setSetting('terminalFontSize', v)}
            min={8}
            max={24}
          />
          <TextSetting
            label="Shell Path"
            value={settings.terminalShell}
            onChange={(v) => settings.setSetting('terminalShell', v)}
            placeholder="System default"
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <ColorSetting
            label="Accent Color"
            value={settings.accentColor}
            onChange={(v) => settings.setSetting('accentColor', v)}
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

function NumberSetting({
  label, value, onChange, min, max, step = 1
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number
}) {
  return (
    <SettingRow label={label}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
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
    </SettingRow>
  )
}

function TextSetting({
  label, value, onChange, placeholder
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <SettingRow label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-0.5 text-xs rounded outline-none"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        }}
      />
    </SettingRow>
  )
}

function SelectSetting({
  label, value, options, onChange
}: {
  label: string; value: string; options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <SettingRow label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    </SettingRow>
  )
}

function ToggleSetting({
  label, value, onChange
}: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <SettingRow label={label}>
      <button
        onClick={() => onChange(!value)}
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
    </SettingRow>
  )
}

function ColorSetting({
  label, value, onChange
}: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <SettingRow label={label}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-6 rounded cursor-pointer"
        style={{ border: '1px solid var(--border)' }}
      />
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
