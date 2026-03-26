// @ts-nocheck
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
import { type ProviderKind } from "@t3tools/contracts";
import { normalizeModelSlug } from "@t3tools/shared/model";
import {
  getCustomModelsForProvider,
  MAX_CUSTOM_MODEL_LENGTH,
  MODEL_PROVIDER_SETTINGS,
  patchCustomModels,
  useAppSettings,
} from "~/appSettings";
import { serverConfigQueryOptions } from "~/lib/serverReactQuery";
import { APP_VERSION } from "~/branding";
import { DEFAULT_GIT_TEXT_GENERATION_MODEL } from "@t3tools/contracts";
import { getModelOptions } from "@t3tools/shared/model";
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
  | "not_installed"
  | "installed_managed"
  | "installed_external"
  | "update_available"
  | "broken"
  | "verifying"
  | "downloading"
  | "installing"
  | "failed";

type IntegrationStatus = {
  id: IntegrationId;
  state: IntegrationState;
  installedVersion: string | null;
  latestVersion: string | null;
  source: "managed" | "external" | null;
  verified: boolean;
  lastVerifiedAt: number | null;
  message?: string;
};

type IntegrationProgress = {
  id: IntegrationId;
  stage: string;
  percent?: number;
  message?: string;
};

type StatusVariant = "success" | "info" | "warning";

// ---------------------------------------------------------------------------
// Navigation sections
// ---------------------------------------------------------------------------
interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_SECTIONS: NavSection[] = [
  { id: "providers", label: "Providers", icon: Zap },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "editor", label: "Editor", icon: Code2 },
  { id: "models", label: "Models", icon: Cpu },
  { id: "codex-server", label: "Codex", icon: Box },
  { id: "git", label: "Git", icon: GitBranch },
  { id: "threads", label: "Threads", icon: Layers },
  { id: "responses", label: "Responses", icon: MessageSquare },
  { id: "timestamp", label: "Timestamp", icon: Clock },
  { id: "keybindings", label: "Keys", icon: Keyboard },
  { id: "safety", label: "Safety", icon: Shield },
  { id: "about", label: "About", icon: Info },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProviderCard({
  icon: Icon,
  title,
  version,
  status,
  statusLabel,
  actionLabel,
  onAction,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  version: string;
  status: StatusVariant;
  statusLabel: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  const dotColor = { success: "#4ade80", warning: "#fbbf24", info: "#60a5fa" }[status];
  return (
    <div
      className="group relative rounded-xl p-4 transition-all duration-200"
      style={{
        backgroundColor: "var(--bg-surface, var(--color-panel, #131314))",
        border: "1px solid var(--border, rgba(255,255,255,0.06))",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent, #c9a24d)";
        e.currentTarget.style.boxShadow = "0 0 20px var(--accent-dim, rgba(201,162,77,0.1))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border, rgba(255,255,255,0.06))";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))" }}>
          <Icon className="w-4 h-4" style={{ color: "var(--accent, #c9a24d)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{title}</h4>
          <p className="text-[10px] mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>{version}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-[10px] font-medium" style={{ color: dotColor }}>{statusLabel}</span>
        </div>
      </div>
      <button
        onClick={onAction}
        disabled={disabled}
        className="w-full py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
        style={{
          backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))",
          color: "var(--text-secondary)",
          border: "1px solid var(--border, rgba(255,255,255,0.06))",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-dim, rgba(201,162,77,0.15))"; e.currentTarget.style.color = "var(--accent, #c9a24d)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-muted, rgba(255,255,255,0.04))"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function SettingRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-colors"
      style={{ backgroundColor: "var(--bg-surface, var(--color-panel, #131314))" }}
    >
      {children}
    </div>
  );
}

function SettingLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      {description && (
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-9 h-5 rounded-full transition-all duration-200 relative shrink-0"
      style={{
        backgroundColor: checked ? "var(--accent, #c9a24d)" : "var(--bg-muted, rgba(255,255,255,0.1))",
        boxShadow: checked ? "0 0 8px var(--accent-dim, rgba(201,162,77,0.3))" : "none",
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{
          transform: checked ? "translateX(18px)" : "translateX(2px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function StyledInput({
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  className = "",
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`px-3 py-1.5 text-xs rounded-lg outline-none transition-colors ${className}`}
      style={{
        backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))",
        color: "var(--text-primary)",
        border: "1px solid var(--border, rgba(255,255,255,0.06))",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent, #c9a24d)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border, rgba(255,255,255,0.06))"; }}
    />
  );
}

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-lg outline-none transition-colors"
      style={{
        backgroundColor: "var(--bg-muted, rgba(255,255,255,0.04))",
        color: "var(--text-primary)",
        border: "1px solid var(--border, rgba(255,255,255,0.06))",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <SettingRow>
      <SettingLabel label={label} />
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-32 h-1 accent-primary"
        />
        <span className="text-xs tabular-nums w-12 text-right" style={{ color: "var(--text-muted)" }}>
          {Number.isInteger(step) ? value : value.toFixed(1)}{suffix ?? ""}
        </span>
      </div>
    </SettingRow>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {description && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40"
      style={{
        backgroundColor: "var(--accent-dim, rgba(201,162,77,0.12))",
        color: "var(--accent, #c9a24d)",
        border: "1px solid var(--accent-dim, rgba(201,162,77,0.2))",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-dim, rgba(201,162,77,0.25))"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-dim, rgba(201,162,77,0.12))"; }}
    >
      {children}
    </button>
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
  const [activeSection, setActiveSection] = useState("providers");

  const gitTextGenerationModelOptions = typeof getAppModelOptions === "function"
    ? getAppModelOptions("codex", appSettings.customCodexModels, appSettings.textGenerationModel)
    : [];

  const openKeybindingsFile = useCallback(() => {
    if (!keybindingsConfigPath) return;
    setOpenKeybindingsError(null);
    setIsOpeningKeybindings(true);
    const api = ensureNativeApi();
    const editor = resolveAndPersistPreferredEditor(availableEditors ?? []);
    if (!editor) {
      setOpenKeybindingsError("No available editors found.");
      setIsOpeningKeybindings(false);
      return;
    }
    void api.shell
      .openInEditor(keybindingsConfigPath, editor)
      .catch((error) => {
        setOpenKeybindingsError(
          error instanceof Error ? error.message : "Unable to open keybindings file.",
        );
      })
      .finally(() => setIsOpeningKeybindings(false));
  }, [availableEditors, keybindingsConfigPath]);

  // Integration status
  const [integrationStatus, setIntegrationStatus] = useState<
    Record<IntegrationId, IntegrationStatus | null>
  >({ codex: null, claude: null });
  const [integrationBusy, setIntegrationBusy] = useState<Record<IntegrationId, boolean>>({
    codex: false,
    claude: false,
  });

  // Custom model inputs
  const [customModelInputByProvider, setCustomModelInputByProvider] = useState<
    Record<ProviderKind, string>
  >({ codex: "", claudeAgent: "" });
  const [customModelErrorByProvider, setCustomModelErrorByProvider] = useState<
    Partial<Record<ProviderKind, string | null>>
  >({});

  const refreshIntegrations = useCallback(async () => {
    try {
      const statuses = await window.api.integrations.listStatus();
      const next: Record<IntegrationId, IntegrationStatus | null> = { codex: null, claude: null };
      for (const status of statuses) {
        if (status.id === "codex" || status.id === "claude") {
          next[status.id] = status;
        }
      }
      setIntegrationStatus(next);
    } catch {}
  }, []);

  const handleCheckUpdates = useCallback(
    async (id?: IntegrationId) => {
      try {
        if (id) {
          setIntegrationBusy((p) => ({ ...p, [id]: true }));
          await window.api.integrations.checkUpdates(id);
        } else {
          await window.api.integrations.checkUpdates();
        }
        await refreshIntegrations();
      } catch {} finally {
        if (id) setIntegrationBusy((p) => ({ ...p, [id]: false }));
      }
    },
    [refreshIntegrations],
  );

  useEffect(() => {
    if (!settings.isLoaded) settings.loadSettings();
  }, []);

  useEffect(() => {
    void refreshIntegrations();
    const unsubscribe = window.api.integrations.onProgress?.((progress: IntegrationProgress) => {
      if (progress.id !== "codex" && progress.id !== "claude") return;
      if (progress.stage === "error" || progress.stage === "done") {
        setIntegrationBusy((p) => ({ ...p, [progress.id]: false }));
        void refreshIntegrations();
      } else {
        setIntegrationBusy((p) => ({ ...p, [progress.id]: true }));
      }
    });
    return () => unsubscribe?.();
  }, [refreshIntegrations]);

  const addCustomModel = useCallback(
    (provider: ProviderKind) => {
      const input = customModelInputByProvider[provider];
      const normalized = normalizeModelSlug(input, provider);
      if (!normalized) {
        setCustomModelErrorByProvider((e) => ({ ...e, [provider]: "Enter a model slug." }));
        return;
      }
      if (normalized.length > MAX_CUSTOM_MODEL_LENGTH) {
        setCustomModelErrorByProvider((e) => ({
          ...e,
          [provider]: `Model slugs must be ${MAX_CUSTOM_MODEL_LENGTH} characters or less.`,
        }));
        return;
      }
      const existing = getCustomModelsForProvider(appSettings, provider);
      if (existing.includes(normalized)) {
        setCustomModelErrorByProvider((e) => ({
          ...e,
          [provider]: "That custom model is already saved.",
        }));
        return;
      }
      updateSettings(patchCustomModels(provider, [...existing, normalized]));
      setCustomModelInputByProvider((e) => ({ ...e, [provider]: "" }));
      setCustomModelErrorByProvider((e) => ({ ...e, [provider]: null }));
    },
    [customModelInputByProvider, appSettings, updateSettings],
  );

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

  // ---------------------------------------------------------------------------
  // Section renderers
  // ---------------------------------------------------------------------------

  const renderProviders = () => (
    <>
      <SectionHeader title="Providers" description="AI provider status and application updates" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ProviderCard
          icon={Terminal}
          title="Claude Code"
          version={integrationStatus.claude?.installedVersion ?? "Not detected"}
          status={integrationVariant("claude")}
          statusLabel={integrationLabel("claude")}
          actionLabel="Check Status"
          onAction={() => void handleCheckUpdates("claude")}
          disabled={integrationBusy.claude}
        />
        <ProviderCard
          icon={Box}
          title="Codex"
          version={integrationStatus.codex?.installedVersion ?? "Not detected"}
          status={integrationVariant("codex")}
          statusLabel={integrationLabel("codex")}
          actionLabel="Check Status"
          onAction={() => void handleCheckUpdates("codex")}
          disabled={integrationBusy.codex}
        />
        <ProviderCard
          icon={RefreshCw}
          title="Updates"
          version={`Version ${APP_VERSION}`}
          status="info"
          statusLabel={APP_VERSION}
          actionLabel="Check for Updates"
          onAction={() => void handleCheckUpdates()}
        />
      </div>
    </>
  );

  const renderAppearance = () => (
    <>
      <SectionHeader title="Appearance" description="Theme, accent color, and visual effects" />
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
    </>
  );

  const renderEditor = () => (
    <>
      <SectionHeader title="Editor" description="Font, indentation, and editor behavior" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Font Size" />
          <StyledInput type="number" value={settings.fontSize} onChange={(v) => settings.setSetting("fontSize", Number(v))} min={8} max={32} className="w-20" />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Font Family" />
          <StyledSelect
            value={settings.fontFamily}
            onChange={(v) => settings.setSetting("fontFamily", v)}
            options={[
              { value: "JetBrains Mono", label: "JetBrains Mono" },
              { value: "Fira Code", label: "Fira Code" },
              { value: "Cascadia Code", label: "Cascadia Code" },
              { value: "Source Code Pro", label: "Source Code Pro" },
              { value: "Consolas", label: "Consolas" },
              { value: "monospace", label: "Monospace" },
            ]}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Tab Size" />
          <StyledInput type="number" value={settings.tabSize} onChange={(v) => settings.setSetting("tabSize", Number(v))} min={1} max={8} className="w-20" />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Word Wrap" />
          <Toggle checked={settings.wordWrap === "on"} onChange={(v) => settings.setSetting("wordWrap", v ? "on" : "off")} />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Minimap" />
          <Toggle checked={settings.minimap} onChange={(v) => settings.setSetting("minimap", v)} />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Line Numbers" />
          <Toggle checked={settings.lineNumbers !== "off"} onChange={(v) => settings.setSetting("lineNumbers", v ? "on" : "off")} />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="Auto Save" description="Automatically save files after a delay" />
          <Toggle checked={settings.autoSave !== "off"} onChange={(v) => settings.setSetting("autoSave", v ? "afterDelay" : "off")} />
        </SettingRow>
      </div>
    </>
  );

  const renderModels = () => (
    <>
      <SectionHeader title="Models" description="Custom model slugs for Codex and Claude providers" />
      <div className="space-y-6">
        {MODEL_PROVIDER_SETTINGS.map((providerSettings) => {
          const provider = providerSettings.provider;
          const customModels = getCustomModelsForProvider(appSettings, provider);
          const inputValue = customModelInputByProvider[provider];
          const error = customModelErrorByProvider[provider] ?? null;
          return (
            <div key={provider} className="space-y-3">
              <div>
                <h4 className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{providerSettings.title}</h4>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{providerSettings.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <StyledInput
                  value={inputValue}
                  onChange={(v) => {
                    setCustomModelInputByProvider((prev) => ({ ...prev, [provider]: v }));
                    if (error) setCustomModelErrorByProvider((prev) => ({ ...prev, [provider]: null }));
                  }}
                  placeholder={providerSettings.placeholder}
                  className="flex-1"
                />
                <ActionButton onClick={() => addCustomModel(provider)}>
                  <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Add</span>
                </ActionButton>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {customModels.length > 0 && (
                <div className="space-y-1">
                  {customModels.map((slug) => (
                    <div key={`${provider}:${slug}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--bg-surface, var(--color-panel))" }}>
                      <code className="text-xs font-mono truncate" style={{ color: "var(--text-primary)" }}>{slug}</code>
                      <button
                        onClick={() => updateSettings(patchCustomModels(provider, customModels.filter((m) => m !== slug)))}
                        className="text-[10px] transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderCodexServer = () => (
    <>
      <SectionHeader title="Codex App Server" description="Override Codex binary path and home directory" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Binary Path" description="Leave blank to use codex from PATH" />
          <StyledInput value={appSettings.codexBinaryPath ?? ""} onChange={(v) => updateSettings({ codexBinaryPath: v })} placeholder="codex" className="w-48" />
        </SettingRow>
        <SettingRow>
          <SettingLabel label="CODEX_HOME" description="Custom config directory" />
          <StyledInput value={appSettings.codexHomePath ?? ""} onChange={(v) => updateSettings({ codexHomePath: v })} placeholder="~/.codex" className="w-48" />
        </SettingRow>
      </div>
      <div className="flex justify-end mt-3">
        <ActionButton onClick={() => updateSettings({ codexBinaryPath: appDefaults.codexBinaryPath, codexHomePath: appDefaults.codexHomePath })}>
          Reset to defaults
        </ActionButton>
      </div>
    </>
  );

  const renderGit = () => (
    <>
      <SectionHeader title="Git" description="Model for commit messages and branch names" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Text Generation Model" />
          <StyledSelect
            value={appSettings.textGenerationModel ?? ""}
            onChange={(v) => updateSettings({ textGenerationModel: v || undefined })}
            options={gitTextGenerationModelOptions.map((o: any) => ({ value: o.slug, label: o.name }))}
          />
        </SettingRow>
      </div>
      {appSettings.textGenerationModel !== appDefaults.textGenerationModel && (
        <div className="flex justify-end mt-3">
          <ActionButton onClick={() => updateSettings({ textGenerationModel: appDefaults.textGenerationModel })}>
            Restore default
          </ActionButton>
        </div>
      )}
    </>
  );

  const renderThreads = () => (
    <>
      <SectionHeader title="Threads" description="Default workspace mode for new threads" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Default to worktree" description="New threads start in worktree mode instead of Local" />
          <Toggle checked={appSettings.defaultThreadEnvMode === "worktree"} onChange={(v) => updateSettings({ defaultThreadEnvMode: v ? "worktree" : "local" })} />
        </SettingRow>
      </div>
    </>
  );

  const renderResponses = () => (
    <>
      <SectionHeader title="Responses" description="Control how assistant output is rendered" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Stream messages" description="Show token-by-token output while a response is in progress" />
          <Toggle checked={appSettings.enableAssistantStreaming} onChange={(v) => updateSettings({ enableAssistantStreaming: v })} />
        </SettingRow>
      </div>
    </>
  );

  const renderTimestamp = () => (
    <>
      <SectionHeader title="Timestamp" description="How timestamps are displayed in chat" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Format" />
          <StyledSelect
            value={appSettings.timestampFormat ?? "locale"}
            onChange={(v) => updateSettings({ timestampFormat: v as any })}
            options={[
              { value: "locale", label: "System default" },
              { value: "12-hour", label: "12-hour" },
              { value: "24-hour", label: "24-hour" },
            ]}
          />
        </SettingRow>
      </div>
    </>
  );

  const renderKeybindings = () => (
    <>
      <SectionHeader title="Keybindings" description="Advanced key customization" />
      <SettingRow>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Configuration file</span>
          <p className="text-[10px] mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
            {keybindingsConfigPath ?? "Resolving..."}
          </p>
        </div>
        <ActionButton onClick={openKeybindingsFile} disabled={!keybindingsConfigPath || isOpeningKeybindings}>
          {isOpeningKeybindings ? "Opening..." : "Open keybindings.json"}
        </ActionButton>
      </SettingRow>
      {openKeybindingsError && <p className="text-xs text-red-400 mt-2">{openKeybindingsError}</p>}
    </>
  );

  const renderSafety = () => (
    <>
      <SectionHeader title="Safety" description="Guardrails for destructive actions" />
      <div className="space-y-1">
        <SettingRow>
          <SettingLabel label="Confirm thread deletion" description="Ask for confirmation before deleting a thread" />
          <Toggle checked={appSettings.confirmThreadDelete} onChange={(v) => updateSettings({ confirmThreadDelete: v })} />
        </SettingRow>
      </div>
    </>
  );

  const renderAbout = () => (
    <>
      <SectionHeader title="About" description="Application version and environment" />
      <SettingRow>
        <SettingLabel label="Version" />
        <code className="text-xs font-mono font-medium" style={{ color: "var(--accent, #c9a24d)" }}>{APP_VERSION}</code>
      </SettingRow>
    </>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    providers: renderProviders,
    appearance: renderAppearance,
    editor: renderEditor,
    models: renderModels,
    "codex-server": renderCodexServer,
    git: renderGit,
    threads: renderThreads,
    responses: renderResponses,
    timestamp: renderTimestamp,
    keybindings: renderKeybindings,
    safety: renderSafety,
    about: renderAbout,
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar navigation */}
      <nav
        className="shrink-0 flex flex-col py-3 overflow-y-auto"
        style={{
          width: 160,
          borderRight: "1px solid var(--border, rgba(255,255,255,0.06))",
          backgroundColor: "var(--bg-base, #0a0a0b)",
        }}
      >
        <div className="px-4 mb-4">
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        </div>
        {NAV_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs transition-all duration-150 text-left"
              style={{
                color: isActive ? "var(--accent, #c9a24d)" : "var(--text-muted)",
                backgroundColor: isActive ? "var(--accent-dim, rgba(201,162,77,0.08))" : "transparent",
                borderRight: isActive ? "2px solid var(--accent, #c9a24d)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-muted, rgba(255,255,255,0.03))";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={14} />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content panel */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="max-w-3xl">
          {sectionRenderers[activeSection]?.()}
        </div>
      </div>
    </div>
  );
}
