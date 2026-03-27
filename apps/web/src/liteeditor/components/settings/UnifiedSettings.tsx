import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Palette,
  Code2,
  Cpu,
  Box,
  RefreshCw,
  Plus,
  Terminal,
  GitBranch,
  MessageSquare,
  Keyboard,
  Shield,
  Info,
  Clock,
  Layers,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { type ProviderKind } from "@liteeditor/contracts";
import { normalizeModelSlug } from "@liteeditor/shared/model";
import {
  getCustomModelsForProvider,
  MAX_CUSTOM_MODEL_LENGTH,
  MODEL_PROVIDER_SETTINGS,
  patchCustomModels,
  useAppSettings,
} from "~/appSettings";
import { serverConfigQueryOptions } from "~/lib/serverReactQuery";
import { APP_VERSION } from "~/branding";
import { DEFAULT_GIT_TEXT_GENERATION_MODEL } from "@liteeditor/contracts";
import { getModelOptions } from "@liteeditor/shared/model";
import { getAppModelOptions } from "~/appSettings";
import { ensureNativeApi } from "~/nativeApi";
import { resolveAndPersistPreferredEditor } from "~/editorPreferences";
import { useSettingsStore } from "../../stores/settings-store";
import { useEditorStore } from "../../stores/editor-store";
import { AppearanceSection } from "./AppearanceSection";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type IntegrationId = "codex" | "claude";
type IntegrationState =
  | "not_installed" | "installed_managed" | "installed_external"
  | "update_available" | "broken" | "verifying" | "downloading" | "installing" | "failed";
type IntegrationStatus = {
  id: IntegrationId; state: IntegrationState; installedVersion: string | null;
  latestVersion: string | null; source: "managed" | "external" | null;
  verified: boolean; lastVerifiedAt: number | null; message?: string;
};
type IntegrationProgress = { id: IntegrationId; stage: string; percent?: number; message?: string; };
type StatusVariant = "success" | "info" | "warning";

// ---------------------------------------------------------------------------
// Card wrapper — every section is a card
// ---------------------------------------------------------------------------

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
  span,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  span?: "full" | "half";
}) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-4 ${span === "full" ? "col-span-full" : ""}`}
      style={{
        backgroundColor: "var(--bg-surface, var(--color-panel, #131314))",
        border: "1px solid var(--border, rgba(255,255,255,0.06))",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))" }}>
          <Icon className="w-4 h-4" style={{ color: "var(--accent, #c9a24d)" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          {description && <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable setting row components
// ---------------------------------------------------------------------------

function SettingRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 border-b last:border-b-0 ${className}`}
      style={{ borderColor: "var(--border, rgba(255,255,255,0.04))" }}>
      {children}
    </div>
  );
}

function SettingLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      {description && <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="w-9 h-5 rounded-full transition-all duration-200 relative shrink-0"
      style={{
        backgroundColor: checked ? "var(--accent, #c9a24d)" : "var(--bg-muted, rgba(255,255,255,0.1))",
        boxShadow: checked ? "0 0 8px var(--accent-dim, rgba(201,162,77,0.3))" : "none",
      }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

function StyledInput({ value, onChange, type = "text", placeholder, min, max, className = "" }: {
  value: string | number; onChange: (v: string) => void; type?: "text" | "number";
  placeholder?: string; min?: number; max?: number; className?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
      className={`px-3 py-1.5 text-xs rounded-lg outline-none transition-colors ${className}`}
      style={{ backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))", color: "var(--text-primary)",
        border: "1px solid var(--border, rgba(255,255,255,0.06))" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent, #c9a24d)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border, rgba(255,255,255,0.06))"; }} />
  );
}

function StyledSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-lg outline-none transition-colors"
      style={{ backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))", color: "var(--text-primary)",
        border: "1px solid var(--border, rgba(255,255,255,0.06))" }}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function ActionButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 hover:opacity-85"
      style={{ backgroundColor: "var(--accent, #c9a24d)", color: "var(--accent-foreground, #0a0a0b)",
        border: "1px solid transparent" }}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Provider status card (inline)
// ---------------------------------------------------------------------------

function ProviderStatus({ icon: Icon, title, version, status, statusLabel, actionLabel, onAction, disabled }: {
  icon: LucideIcon; title: string; version: string; status: StatusVariant;
  statusLabel: string; actionLabel: string; onAction: () => void; disabled?: boolean;
}) {
  const dotColor = { success: "#4ade80", warning: "#fbbf24", info: "#60a5fa" }[status];
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--border, rgba(255,255,255,0.04))" }}>
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{title}</span>
        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{version}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-[10px]" style={{ color: dotColor }}>{statusLabel}</span>
        </div>
        <ActionButton onClick={onAction} disabled={disabled}>{actionLabel}</ActionButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function UnifiedSettings() {
  const settings = useSettingsStore();
  const projectRoot = useEditorStore((s) => s.projectRoot);
  const { settings: appSettings, defaults: appDefaults, updateSettings } = useAppSettings();
  const serverConfigQuery = useQuery(serverConfigQueryOptions());
  const keybindingsConfigPath = serverConfigQuery.data?.keybindingsConfigPath ?? null;
  const availableEditors = serverConfigQuery.data?.availableEditors;
  const [isOpeningKeybindings, setIsOpeningKeybindings] = useState(false);
  const [openKeybindingsError, setOpenKeybindingsError] = useState<string | null>(null);

  const gitTextGenerationModelOptions = typeof getAppModelOptions === "function"
    ? getAppModelOptions("codex", appSettings.customCodexModels, appSettings.textGenerationModel) : [];

  const openKeybindingsFile = useCallback(() => {
    if (!keybindingsConfigPath) return;
    setOpenKeybindingsError(null);
    setIsOpeningKeybindings(true);
    const api = ensureNativeApi();
    const editor = resolveAndPersistPreferredEditor(availableEditors ?? []);
    if (!editor) { setOpenKeybindingsError("No available editors found."); setIsOpeningKeybindings(false); return; }
    void api.shell.openInEditor(keybindingsConfigPath, editor)
      .catch((error) => { setOpenKeybindingsError(error instanceof Error ? error.message : "Unable to open keybindings file."); })
      .finally(() => setIsOpeningKeybindings(false));
  }, [availableEditors, keybindingsConfigPath]);

  const [integrationStatus, setIntegrationStatus] = useState<Record<IntegrationId, IntegrationStatus | null>>({ codex: null, claude: null });
  const [integrationBusy, setIntegrationBusy] = useState<Record<IntegrationId, boolean>>({ codex: false, claude: false });
  const [customModelInputByProvider, setCustomModelInputByProvider] = useState<Record<ProviderKind, string>>({ codex: "", claudeAgent: "" });
  const [customModelErrorByProvider, setCustomModelErrorByProvider] = useState<Partial<Record<ProviderKind, string | null>>>({});

  const refreshIntegrations = useCallback(async () => {
    try {
      const statuses = await window.api.integrations.listStatus();
      const next: Record<IntegrationId, IntegrationStatus | null> = { codex: null, claude: null };
      for (const status of statuses) { if (status.id === "codex" || status.id === "claude") next[status.id] = status; }
      setIntegrationStatus(next);
    } catch {}
  }, []);

  const handleCheckUpdates = useCallback(async (id?: IntegrationId) => {
    try {
      if (id) { setIntegrationBusy((p) => ({ ...p, [id]: true })); await window.api.integrations.checkUpdates(id); }
      else { await window.api.integrations.checkUpdates(); }
      await refreshIntegrations();
    } catch {} finally { if (id) setIntegrationBusy((p) => ({ ...p, [id]: false })); }
  }, [refreshIntegrations]);

  useEffect(() => { if (!settings.isLoaded) settings.loadSettings(); }, []);
  useEffect(() => {
    void refreshIntegrations();
    const unsubscribe = window.api.integrations.onProgress?.((progress: IntegrationProgress) => {
      if (progress.id !== "codex" && progress.id !== "claude") return;
      if (progress.stage === "error" || progress.stage === "done") {
        setIntegrationBusy((p) => ({ ...p, [progress.id]: false })); void refreshIntegrations();
      } else { setIntegrationBusy((p) => ({ ...p, [progress.id]: true })); }
    });
    return () => unsubscribe?.();
  }, [refreshIntegrations]);

  const addCustomModel = useCallback((provider: ProviderKind) => {
    const input = customModelInputByProvider[provider];
    const normalized = normalizeModelSlug(input, provider);
    if (!normalized) { setCustomModelErrorByProvider((e) => ({ ...e, [provider]: "Enter a model slug." })); return; }
    if (normalized.length > MAX_CUSTOM_MODEL_LENGTH) {
      setCustomModelErrorByProvider((e) => ({ ...e, [provider]: `Max ${MAX_CUSTOM_MODEL_LENGTH} chars.` })); return;
    }
    const existing = getCustomModelsForProvider(appSettings, provider);
    if (existing.includes(normalized)) { setCustomModelErrorByProvider((e) => ({ ...e, [provider]: "Already saved." })); return; }
    updateSettings(patchCustomModels(provider, [...existing, normalized]));
    setCustomModelInputByProvider((e) => ({ ...e, [provider]: "" }));
    setCustomModelErrorByProvider((e) => ({ ...e, [provider]: null }));
  }, [customModelInputByProvider, appSettings, updateSettings]);

  const integrationVariant = (id: IntegrationId): StatusVariant => {
    const state = integrationStatus[id]?.state;
    if (state === "installed_managed" || state === "installed_external") return "success";
    if (state === "update_available" || state === "broken" || state === "failed") return "warning";
    return "info";
  };
  const integrationLabel = (id: IntegrationId): string => {
    const ver = integrationStatus[id]?.installedVersion;
    if (ver) return `v${ver}`;
    const state = integrationStatus[id]?.state;
    if (!state || state === "not_installed") return "Not installed";
    return state.split("_").join(" ");
  };

  return (
    <div className="w-full h-full flex-1 overflow-y-auto">
      <div className="p-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Configure providers, appearance, editor, and models.</p>
        </div>

        {/* Card grid — auto-fills columns based on available width */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>

          {/* Providers */}
          <SettingsCard icon={Zap} title="Providers" description="AI provider status and updates">
            <ProviderStatus icon={Terminal} title="Claude Code"
              version={integrationStatus.claude?.installedVersion ?? "—"}
              status={integrationVariant("claude")} statusLabel={integrationLabel("claude")}
              actionLabel="Check" onAction={() => void handleCheckUpdates("claude")} disabled={integrationBusy.claude} />
            <ProviderStatus icon={Box} title="Codex"
              version={integrationStatus.codex?.installedVersion ?? "—"}
              status={integrationVariant("codex")} statusLabel={integrationLabel("codex")}
              actionLabel="Check" onAction={() => void handleCheckUpdates("codex")} disabled={integrationBusy.codex} />
            <ProviderStatus icon={RefreshCw} title="App Updates"
              version={APP_VERSION} status="info" statusLabel={APP_VERSION}
              actionLabel="Check Updates" onAction={() => void handleCheckUpdates()} />
          </SettingsCard>

          {/* Appearance */}
          <SettingsCard icon={Palette} title="Appearance" description="Theme, accent color, and effects">
            <AppearanceSection
              accentColor={settings.accentColor}
              setAccentColor={(v) => settings.setSetting("accentColor", v)}
              particleDensity={settings.particleDensity}
              setParticleDensity={(v) => settings.setSetting("particleDensity", v)}
              particleSpeed={settings.particleSpeed}
              setParticleSpeed={(v) => settings.setSetting("particleSpeed", v)}
              particleLifespan={settings.particleLifespan}
              setParticleLifespan={(v) => settings.setSetting("particleLifespan", v)}
              glassBlur={settings.glassBlur}
              setGlassBlur={(v) => settings.setSetting("glassBlur", v)}
              reduceMotion={settings.reduceMotion}
              setReduceMotion={(v) => settings.setSetting("reduceMotion", v)}
            />
          </SettingsCard>

          {/* Editor */}
          <SettingsCard icon={Code2} title="Editor" description="Font, indentation, and behavior">
            <SettingRow><SettingLabel label="Font Size" /><StyledInput type="number" value={settings.fontSize} onChange={(v) => settings.setSetting("fontSize", Number(v))} min={8} max={32} className="w-20" /></SettingRow>
            <SettingRow><SettingLabel label="Font Family" /><StyledSelect value={settings.fontFamily} onChange={(v) => settings.setSetting("fontFamily", v)} options={[
              { value: "JetBrains Mono", label: "JetBrains Mono" }, { value: "Fira Code", label: "Fira Code" },
              { value: "Cascadia Code", label: "Cascadia Code" }, { value: "Source Code Pro", label: "Source Code Pro" },
              { value: "Consolas", label: "Consolas" }, { value: "monospace", label: "Monospace" },
            ]} /></SettingRow>
            <SettingRow><SettingLabel label="Tab Size" /><StyledInput type="number" value={settings.tabSize} onChange={(v) => settings.setSetting("tabSize", Number(v))} min={1} max={8} className="w-20" /></SettingRow>
            <SettingRow><SettingLabel label="Word Wrap" /><Toggle checked={settings.wordWrap === "on"} onChange={(v) => settings.setSetting("wordWrap", v ? "on" : "off")} /></SettingRow>
            <SettingRow><SettingLabel label="Minimap" /><Toggle checked={settings.minimap} onChange={(v) => settings.setSetting("minimap", v)} /></SettingRow>
            <SettingRow><SettingLabel label="Line Numbers" /><Toggle checked={settings.lineNumbers !== "off"} onChange={(v) => settings.setSetting("lineNumbers", v ? "on" : "off")} /></SettingRow>
            <SettingRow><SettingLabel label="Auto Save" description="Save files after a delay" /><Toggle checked={settings.autoSave !== "off"} onChange={(v) => settings.setSetting("autoSave", v ? "afterDelay" : "off")} /></SettingRow>
          </SettingsCard>

          {/* Models */}
          <SettingsCard icon={Cpu} title="Models" description="Custom model slugs">
            {MODEL_PROVIDER_SETTINGS.map((ps) => {
              const provider = ps.provider;
              const customModels = getCustomModelsForProvider(appSettings, provider);
              const inputValue = customModelInputByProvider[provider];
              const error = customModelErrorByProvider[provider] ?? null;
              return (
                <div key={provider} className="mb-4 last:mb-0">
                  <div className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>{ps.title}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <StyledInput value={inputValue} onChange={(v) => {
                      setCustomModelInputByProvider((prev) => ({ ...prev, [provider]: v }));
                      if (error) setCustomModelErrorByProvider((prev) => ({ ...prev, [provider]: null }));
                    }} placeholder={ps.placeholder} className="flex-1"
                    />
                    <ActionButton onClick={() => addCustomModel(provider)}>
                      <span className="flex items-center gap-1"><Plus className="w-3 h-3" />Add</span>
                    </ActionButton>
                  </div>
                  {error && <p className="text-[10px] text-red-400 mb-1">{error}</p>}
                  {customModels.map((slug) => (
                    <div key={`${provider}:${slug}`} className="flex items-center justify-between py-1 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <code className="text-[10px] font-mono" style={{ color: "var(--text-primary)" }}>{slug}</code>
                      <button onClick={() => updateSettings(patchCustomModels(provider, customModels.filter((m) => m !== slug)))}
                        className="text-[10px] hover:text-red-500" style={{ color: "var(--text-muted)" }}>Remove</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </SettingsCard>

          {/* Codex Server */}
          <SettingsCard icon={Box} title="Codex Server" description="Binary path overrides">
            <SettingRow><SettingLabel label="Binary Path" description="Leave blank for PATH" /><StyledInput value={appSettings.codexBinaryPath ?? ""} onChange={(v) => updateSettings({ codexBinaryPath: v })} placeholder="codex" className="w-40" /></SettingRow>
            <SettingRow><SettingLabel label="CODEX_HOME" description="Custom config dir" /><StyledInput value={appSettings.codexHomePath ?? ""} onChange={(v) => updateSettings({ codexHomePath: v })} placeholder="~/.codex" className="w-40" /></SettingRow>
            <div className="flex justify-end mt-2">
              <ActionButton onClick={() => updateSettings({ codexBinaryPath: appDefaults.codexBinaryPath, codexHomePath: appDefaults.codexHomePath })}>Reset</ActionButton>
            </div>
          </SettingsCard>

          {/* Git */}
          <SettingsCard icon={GitBranch} title="Git" description="Commit message model">
            <SettingRow><SettingLabel label="Text Generation Model" /><StyledSelect
              value={appSettings.textGenerationModel ?? ""}
              onChange={(v) => updateSettings({ textGenerationModel: v || undefined })}
              options={gitTextGenerationModelOptions.map((o: any) => ({ value: o.slug, label: o.name }))} /></SettingRow>
            {appSettings.textGenerationModel !== appDefaults.textGenerationModel && (
              <div className="flex justify-end mt-2">
                <ActionButton onClick={() => updateSettings({ textGenerationModel: appDefaults.textGenerationModel })}>Restore default</ActionButton>
              </div>
            )}
          </SettingsCard>

          {/* Threads */}
          <SettingsCard icon={Layers} title="Threads" description="Default workspace mode">
            <SettingRow><SettingLabel label="Default to worktree" description="New threads use worktree mode" /><Toggle checked={appSettings.defaultThreadEnvMode === "worktree"} onChange={(v) => updateSettings({ defaultThreadEnvMode: v ? "worktree" : "local" })} /></SettingRow>
          </SettingsCard>

          {/* Responses */}
          <SettingsCard icon={MessageSquare} title="Responses" description="Output rendering">
            <SettingRow><SettingLabel label="Stream messages" description="Token-by-token output" /><Toggle checked={appSettings.enableAssistantStreaming} onChange={(v) => updateSettings({ enableAssistantStreaming: v })} /></SettingRow>
          </SettingsCard>

          {/* Timestamp */}
          <SettingsCard icon={Clock} title="Timestamp" description="Chat time format">
            <SettingRow><SettingLabel label="Format" /><StyledSelect
              value={appSettings.timestampFormat ?? "locale"}
              onChange={(v) => updateSettings({ timestampFormat: v as any })}
              options={[{ value: "locale", label: "System default" }, { value: "12-hour", label: "12-hour" }, { value: "24-hour", label: "24-hour" }]} /></SettingRow>
          </SettingsCard>

          {/* Keybindings */}
          <SettingsCard icon={Keyboard} title="Keybindings" description="Key customization">
            <div className="flex items-center justify-between gap-2">
              <code className="text-[10px] font-mono truncate flex-1" style={{ color: "var(--text-muted)" }}>{keybindingsConfigPath ?? "Resolving..."}</code>
              <ActionButton onClick={openKeybindingsFile} disabled={!keybindingsConfigPath || isOpeningKeybindings}>
                {isOpeningKeybindings ? "Opening..." : "Open file"}
              </ActionButton>
            </div>
            {openKeybindingsError && <p className="text-[10px] text-red-400 mt-2">{openKeybindingsError}</p>}
          </SettingsCard>

          {/* Safety */}
          <SettingsCard icon={Shield} title="Safety" description="Destructive action guards">
            <SettingRow><SettingLabel label="Confirm thread deletion" description="Ask before deleting" /><Toggle checked={appSettings.confirmThreadDelete} onChange={(v) => updateSettings({ confirmThreadDelete: v })} /></SettingRow>
          </SettingsCard>

          {/* About */}
          <SettingsCard icon={Info} title="About" description="Application info">
            <SettingRow>
              <SettingLabel label="Version" />
              <code className="text-xs font-mono font-medium" style={{ color: "var(--accent, #c9a24d)" }}>{APP_VERSION}</code>
            </SettingRow>
          </SettingsCard>

        </div>
      </div>
    </div>
  );
}
