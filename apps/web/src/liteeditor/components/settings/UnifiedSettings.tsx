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
// Types for integration status (mirrors SettingsPanel.tsx)
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="ml-11">{children}</div>
    </div>
  );
}

type StatusVariant = "success" | "info" | "warning";

function LauncherCard({
  icon: Icon,
  title,
  description,
  status,
  statusLabel,
  actionLabel,
  onAction,
  disabled,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: StatusVariant;
  statusLabel: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const statusColors: Record<StatusVariant, string> = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-secondary rounded-lg shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-1 text-xs rounded-md border ${statusColors[status]}`}>
          {statusLabel}
        </span>
        <button
          onClick={onAction}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {actionLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function SliderRow({
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Number.isInteger(step) ? value : value.toFixed(1)}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary"
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <div className="flex-1">
        <span className="text-xs text-foreground">{label}</span>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="w-8 h-4 rounded-full transition-colors relative shrink-0"
        style={{ backgroundColor: checked ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(2px)" }}
        />
      </button>
    </label>
  );
}

function InputRow({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-28 px-2 py-1 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-primary/50"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-primary/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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

  // Git text generation model
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

  // Integration status (reused from SettingsPanel)
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
    } catch {
      // silently ignore
    }
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
      } catch {
        // silently ignore
      } finally {
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

  // Add custom model handler
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

  // Helpers
  const integrationVariant = (id: IntegrationId): StatusVariant => {
    const state = integrationStatus[id]?.state;
    if (
      state === "installed_managed" ||
      state === "installed_external"
    )
      return "success";
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
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure providers, appearance, editor, and models.
          </p>
        </div>

        {/* ---- Section 1: Quick Access ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-secondary rounded-lg">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Quick Access</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provider status and application updates
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LauncherCard
              icon={Terminal}
              title="Claude Code"
              description={integrationStatus.claude?.installedVersion ?? "Check status"}
              status={integrationVariant("claude")}
              statusLabel={integrationLabel("claude")}
              actionLabel="Check"
              onAction={() => void handleCheckUpdates("claude")}
              disabled={integrationBusy.claude}
            />
            <LauncherCard
              icon={Box}
              title="Codex"
              description={integrationStatus.codex?.installedVersion ?? "Check status"}
              status={integrationVariant("codex")}
              statusLabel={integrationLabel("codex")}
              actionLabel="Check"
              onAction={() => void handleCheckUpdates("codex")}
              disabled={integrationBusy.codex}
            />
            <LauncherCard
              icon={RefreshCw}
              title="Updates"
              description={`Version ${APP_VERSION}`}
              status="info"
              statusLabel={APP_VERSION}
              actionLabel="Check Updates"
              onAction={() => void handleCheckUpdates()}
            />
          </div>
        </div>

        {/* ---- Section 2: Appearance (reuse existing component) ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
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
        </div>

        {/* ---- Section 3: Editor ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Code2}
            title="Editor"
            description="Font, indentation, and editor behavior"
          >
            <div className="space-y-3">
              <InputRow
                label="Font Size"
                type="number"
                value={settings.fontSize}
                onChange={(v) => settings.setSetting("fontSize", Number(v))}
                min={8}
                max={32}
              />
              <SelectRow
                label="Font Family"
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
              <InputRow
                label="Tab Size"
                type="number"
                value={settings.tabSize}
                onChange={(v) => settings.setSetting("tabSize", Number(v))}
                min={1}
                max={8}
              />
              <ToggleRow
                label="Word Wrap"
                checked={settings.wordWrap === "on"}
                onChange={(v) => settings.setSetting("wordWrap", v ? "on" : "off")}
              />
              <ToggleRow
                label="Minimap"
                checked={settings.minimap}
                onChange={(v) => settings.setSetting("minimap", v)}
              />
              <ToggleRow
                label="Line Numbers"
                checked={settings.lineNumbers !== "off"}
                onChange={(v) => settings.setSetting("lineNumbers", v ? "on" : "off")}
              />
              <ToggleRow
                label="Auto Save"
                checked={settings.autoSave !== "off"}
                onChange={(v) => settings.setSetting("autoSave", v ? "afterDelay" : "off")}
              />
            </div>
          </SettingSection>
        </div>

        {/* ---- Section 5: Models ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Cpu}
            title="Models"
            description="Add custom model slugs for Codex and Claude providers"
          >
            <div className="space-y-4">
              {MODEL_PROVIDER_SETTINGS.map((providerSettings) => {
                const provider = providerSettings.provider;
                const customModels = getCustomModelsForProvider(appSettings, provider);
                const inputValue = customModelInputByProvider[provider];
                const error = customModelErrorByProvider[provider] ?? null;
                return (
                  <div key={provider} className="space-y-2">
                    <span className="text-xs font-medium text-foreground">
                      {providerSettings.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {providerSettings.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          setCustomModelInputByProvider((prev) => ({
                            ...prev,
                            [provider]: e.target.value,
                          }));
                          if (error) {
                            setCustomModelErrorByProvider((prev) => ({
                              ...prev,
                              [provider]: null,
                            }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomModel(provider);
                          }
                        }}
                        placeholder={providerSettings.placeholder}
                        className="flex-1 px-2 py-1 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-primary/50"
                      />
                      <button
                        onClick={() => addCustomModel(provider)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add model
                      </button>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    {customModels.length > 0 && (
                      <div className="space-y-1">
                        {customModels.map((slug) => (
                          <div
                            key={`${provider}:${slug}`}
                            className="flex items-center justify-between gap-2 px-2 py-1 rounded-md border border-border bg-background"
                          >
                            <code className="text-xs text-foreground truncate">{slug}</code>
                            <button
                              onClick={() => {
                                const filtered = customModels.filter((m) => m !== slug);
                                updateSettings(patchCustomModels(provider, filtered));
                              }}
                              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
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
          </SettingSection>
        </div>
        {/* ---- Section 6: Codex App Server ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Box}
            title="Codex App Server"
            description="Override Codex binary path and home directory for new sessions"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">Codex binary path</span>
                <input
                  type="text"
                  value={appSettings.codexBinaryPath ?? ""}
                  onChange={(e) => updateSettings({ codexBinaryPath: e.target.value })}
                  placeholder="codex"
                  className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-primary/50"
                />
                <span className="text-[10px] text-muted-foreground">Leave blank to use codex from your PATH.</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">CODEX_HOME path</span>
                <input
                  type="text"
                  value={appSettings.codexHomePath ?? ""}
                  onChange={(e) => updateSettings({ codexHomePath: e.target.value })}
                  placeholder="/Users/you/.codex"
                  className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-primary/50"
                />
                <span className="text-[10px] text-muted-foreground">Optional custom Codex home/config directory.</span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => updateSettings({ codexBinaryPath: appDefaults.codexBinaryPath, codexHomePath: appDefaults.codexHomePath })}
                  className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Reset codex overrides
                </button>
              </div>
            </div>
          </SettingSection>
        </div>

        {/* ---- Section 7: Git ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={GitBranch}
            title="Git"
            description="Configure the model used for generating commit messages and branch names"
          >
            <div className="space-y-3">
              <SelectRow
                label="Text generation model"
                value={appSettings.textGenerationModel ?? ""}
                onChange={(v) => updateSettings({ textGenerationModel: v || undefined })}
                options={gitTextGenerationModelOptions.map((o: any) => ({ value: o.slug, label: o.name }))}
              />
              {appSettings.textGenerationModel !== appDefaults.textGenerationModel && (
                <div className="flex justify-end">
                  <button
                    onClick={() => updateSettings({ textGenerationModel: appDefaults.textGenerationModel })}
                    className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Restore default
                  </button>
                </div>
              )}
            </div>
          </SettingSection>
        </div>

        {/* ---- Section 8: Threads ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Layers}
            title="Threads"
            description="Default workspace mode for new threads"
          >
            <ToggleRow
              label="Default to New worktree"
              description="New threads start in worktree mode instead of Local"
              checked={appSettings.defaultThreadEnvMode === "worktree"}
              onChange={(v) => updateSettings({ defaultThreadEnvMode: v ? "worktree" : "local" })}
            />
          </SettingSection>
        </div>

        {/* ---- Section 9: Responses ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={MessageSquare}
            title="Responses"
            description="Control how assistant output is rendered"
          >
            <ToggleRow
              label="Stream assistant messages"
              description="Show token-by-token output while a response is in progress"
              checked={appSettings.enableAssistantStreaming}
              onChange={(v) => updateSettings({ enableAssistantStreaming: v })}
            />
          </SettingSection>
        </div>

        {/* ---- Section 10: Timestamp ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Clock}
            title="Timestamp Format"
            description="Choose how timestamps are displayed in chat"
          >
            <SelectRow
              label="Format"
              value={appSettings.timestampFormat ?? "locale"}
              onChange={(v) => updateSettings({ timestampFormat: v as any })}
              options={[
                { value: "locale", label: "System default" },
                { value: "12-hour", label: "12-hour" },
                { value: "24-hour", label: "24-hour" },
              ]}
            />
          </SettingSection>
        </div>

        {/* ---- Section 11: Keybindings ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Keyboard}
            title="Keybindings"
            description="Edit keybindings.json for advanced key customization"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {keybindingsConfigPath ?? "Resolving..."}
                  </p>
                </div>
                <button
                  onClick={openKeybindingsFile}
                  disabled={!keybindingsConfigPath || isOpeningKeybindings}
                  className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isOpeningKeybindings ? "Opening..." : "Open keybindings.json"}
                </button>
              </div>
              {openKeybindingsError && <p className="text-xs text-destructive">{openKeybindingsError}</p>}
            </div>
          </SettingSection>
        </div>

        {/* ---- Section 12: Safety ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Shield}
            title="Safety"
            description="Guardrails for destructive actions"
          >
            <ToggleRow
              label="Confirm thread deletion"
              description="Ask for confirmation before deleting a thread"
              checked={appSettings.confirmThreadDelete}
              onChange={(v) => updateSettings({ confirmThreadDelete: v })}
            />
          </SettingSection>
        </div>

        {/* ---- Section 13: About ---- */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
          <SettingSection
            icon={Info}
            title="About"
            description="Application version and environment"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <code className="text-xs font-medium text-foreground">{APP_VERSION}</code>
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
}
