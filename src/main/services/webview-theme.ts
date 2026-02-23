export type WebviewThemeTokens = Record<`--vscode-${string}`, string>

const DEFAULT_DARK_WEBVIEW_TOKENS: WebviewThemeTokens = {
  '--vscode-actionBar-toggledBackground': '#2a2a2e',
  '--vscode-badge-background': '#6366f1',
  '--vscode-badge-foreground': '#ffffff',
  '--vscode-banner-background': '#111114',
  '--vscode-banner-foreground': '#cccccc',
  '--vscode-banner-iconForeground': '#818cf8',
  '--vscode-button-background': '#6366f1',
  '--vscode-button-border': 'transparent',
  '--vscode-button-foreground': '#ffffff',
  '--vscode-button-hoverBackground': '#818cf8',
  '--vscode-button-secondaryBackground': '#2a2a2e',
  '--vscode-button-secondaryForeground': '#cccccc',
  '--vscode-button-secondaryHoverBackground': '#3a3a40',
  '--vscode-button-separator': '#2a2a2e',
  '--vscode-chat-font-family': 'var(--vscode-font-family)',
  '--vscode-chat-font-size': 'var(--vscode-font-size)',
  '--vscode-descriptionForeground': '#888888',
  '--vscode-disabledForeground': '#76767c',
  '--vscode-editorActionList-background': '#18181b',
  '--vscode-editorActionList-focusBackground': '#2a2a2e',
  '--vscode-editorActionList-focusForeground': '#ffffff',
  '--vscode-editorActionList-foreground': '#cccccc',
  '--vscode-editor-background': '#0c0c0f',
  '--vscode-editor-font-family': "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
  '--vscode-editor-font-size': '13px',
  '--vscode-editor-foreground': '#cccccc',
  '--vscode-editor-hoverHighlightBackground': 'rgba(99,102,241,0.1)',
  '--vscode-editor-lineHighlightBackground': 'rgba(255,255,255,0.04)',
  '--vscode-editor-placeholder-foreground': '#666666',
  '--vscode-editor-selectionBackground': 'rgba(99,102,241,0.28)',
  '--vscode-editorHoverWidget-background': '#111114',
  '--vscode-editorHoverWidget-border': '#2a2a2e',
  '--vscode-editorHoverWidget-foreground': '#cccccc',
  '--vscode-editorWidget-background': '#111114',
  '--vscode-editorWidget-border': '#2a2a2e',
  '--vscode-editorWidget-foreground': '#cccccc',
  '--vscode-errorForeground': '#f87171',
  '--vscode-focusBorder': '#6366f1',
  '--vscode-font-family': 'system-ui, -apple-system, sans-serif',
  '--vscode-font-size': '13px',
  '--vscode-foreground': '#cccccc',
  '--vscode-gitDecoration-addedResourceForeground': '#74c991',
  '--vscode-gitDecoration-deletedResourceForeground': '#c74e39',
  '--vscode-icon-foreground': '#cccccc',
  '--vscode-inlineChatInput-border': '#2a2a2e',
  '--vscode-input-background': '#18181b',
  '--vscode-input-border': '#2a2a2e',
  '--vscode-input-foreground': '#cccccc',
  '--vscode-input-placeholderForeground': '#666666',
  '--vscode-inputOption-activeBorder': '#6366f1',
  '--vscode-inputOption-hoverBackground': '#1e1e22',
  '--vscode-list-activeSelectionBackground': '#2a2a2e',
  '--vscode-list-activeSelectionForeground': '#ffffff',
  '--vscode-list-hoverBackground': '#1e1e22',
  '--vscode-menu-background': '#18181b',
  '--vscode-menu-border': '#2a2a2e',
  '--vscode-menu-foreground': '#cccccc',
  '--vscode-menu-selectionBackground': '#2a2a2e',
  '--vscode-menu-selectionBorder': '#3a3a40',
  '--vscode-menu-selectionForeground': '#ffffff',
  '--vscode-panel-background': '#0c0c0f',
  '--vscode-panel-border': '#2a2a2e',
  '--vscode-progressBar-background': '#6366f1',
  '--vscode-sash-hoverBorder': '#6366f1',
  '--vscode-scrollbar-shadow': 'rgba(0,0,0,0.2)',
  '--vscode-scrollbarSlider-activeBackground': 'rgba(255,255,255,0.2)',
  '--vscode-scrollbarSlider-background': 'rgba(255,255,255,0.1)',
  '--vscode-scrollbarSlider-hoverBackground': 'rgba(255,255,255,0.15)',
  '--vscode-sideBar-background': '#111114',
  '--vscode-sideBar-foreground': '#cccccc',
  '--vscode-sideBarActivityBarTop-border': '#2a2a2e',
  '--vscode-sideBarSectionHeader-background': '#18181b',
  '--vscode-textCodeBlock-background': '#111114',
  '--vscode-textLink-activeForeground': '#a5b4fc',
  '--vscode-textLink-foreground': '#818cf8',
  '--vscode-toolbar-hoverBackground': '#1e1e22',
  '--vscode-widget-border': '#2a2a2e',
  '--vscode-widget-shadow': 'rgba(0,0,0,0.35)'
}

export function getDefaultDarkWebviewTokens(): WebviewThemeTokens {
  return { ...DEFAULT_DARK_WEBVIEW_TOKENS }
}

export function buildWebviewThemeCss(tokens: WebviewThemeTokens = getDefaultDarkWebviewTokens()): string {
  const vars = Object.entries(tokens)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `      ${key}: ${value};`)
    .join('\n')

  return `
  <style>
    :root {
${vars}
    }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color-scheme: dark;
    }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }
  </style>`
}
