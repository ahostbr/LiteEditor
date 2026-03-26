// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { type BrowserTab } from "../../stores/browser-shell-store";

interface TabSidebarProps {
  paneId: string;
  tabs: BrowserTab[];
  activeTabIndex: number;
  collapsed: boolean;
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  onToggleCollapse: () => void;
}

const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 48;
const HOVER_REVEAL_DELAY_MS = 300;

export function TabSidebar({
  paneId,
  tabs,
  activeTabIndex,
  collapsed,
  onActivateTab,
  onCloseTab,
  onNewTab,
  onToggleCollapse,
}: TabSidebarProps) {
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const isExpanded = !collapsed || hoverExpanded;
  const width = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const handleMouseEnter = useCallback(() => {
    if (!collapsed) return;
    hoverTimerRef.current = setTimeout(() => setHoverExpanded(true), HOVER_REVEAL_DELAY_MS);
  }, [collapsed]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoverExpanded(false);
  }, []);

  // When explicitly uncollapsed, clear hover state
  useEffect(() => {
    if (!collapsed) setHoverExpanded(false);
  }, [collapsed]);

  // Dismiss context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => setContextMenu(null);
    window.addEventListener("click", handler, { capture: true });
    return () => window.removeEventListener("click", handler, { capture: true });
  }, [contextMenu]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  }, []);

  const handleContextAction = useCallback(
    async (action: string) => {
      if (!contextMenu) return;
      const { tabId } = contextMenu;
      setContextMenu(null);

      if (action === "close") {
        onCloseTab(tabId);
      } else if (action === "close-others") {
        for (const t of tabs) {
          if (t.id !== tabId) onCloseTab(t.id);
        }
      } else if (action === "duplicate") {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) onNewTab();
      } else if (action === "copy-url") {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab?.url) {
          try {
            await navigator.clipboard.writeText(tab.url);
          } catch {}
        }
      }
    },
    [contextMenu, tabs, onCloseTab, onNewTab],
  );

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          transition: "width 150ms ease",
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {/* Header: label + collapse toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px",
            height: 32,
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {isExpanded && (
            <span
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              Tabs
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar (Cmd+Shift+E)" : "Collapse sidebar (Cmd+Shift+E)"}
            style={{
              marginLeft: "auto",
              padding: 2,
              borderRadius: 3,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Tab list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
          }}
        >
          {tabs.map((tab, index) => (
            <TabChip
              key={tab.id}
              tab={tab}
              isActive={index === activeTabIndex}
              isExpanded={isExpanded}
              onClick={() => onActivateTab(tab.id)}
              onClose={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            />
          ))}
        </div>

        {/* New tab button */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "4px 6px", flexShrink: 0 }}>
          <button
            onClick={onNewTab}
            title="New tab (Cmd+T)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              padding: isExpanded ? "4px 8px" : "4px 0",
              justifyContent: isExpanded ? "flex-start" : "center",
              borderRadius: 4,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Plus size={14} style={{ flexShrink: 0 }} />
            {isExpanded && <span style={{ fontSize: 12 }}>New tab</span>}
          </button>
        </div>
      </div>

      {/* Context menu portal */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextAction}
        />
      )}
    </>
  );
}

// --- TabChip ---

interface TabChipProps {
  tab: BrowserTab;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function TabChip({ tab, isActive, isExpanded, onClick, onClose, onContextMenu }: TabChipProps) {
  const [hovered, setHovered] = useState(false);

  const displayTitle = tab.title && tab.title !== tab.url
    ? tab.title
    : extractDomain(tab.url);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isExpanded ? tab.url : `${displayTitle}\n${tab.url}`}
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        gap: 6,
        paddingLeft: isActive ? 6 : 8,
        paddingRight: 6,
        cursor: "pointer",
        borderLeft: isActive ? "2px solid var(--accent, #4f8ef7)" : "2px solid transparent",
        backgroundColor: isActive
          ? "var(--bg-muted, rgba(255,255,255,0.07))"
          : hovered
            ? "var(--bg-hover, rgba(255,255,255,0.04))"
            : "transparent",
        transition: "background 80ms",
        overflow: "hidden",
      }}
    >
      {/* Favicon with workspace color dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <FaviconIcon favicon={tab.favicon} size={14} isActive={isActive} />
        {tab.workspaceColor && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: tab.workspaceColor,
              border: "1px solid var(--bg-surface)",
            }}
          />
        )}
      </div>

      {/* Title — only when expanded */}
      {isExpanded && (
        <span
          style={{
            flex: 1,
            fontSize: 12,
            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayTitle}
        </span>
      )}

      {/* Close button — expanded mode, visible on hover or active */}
      {isExpanded && (isActive || hovered) && (
        <button
          onClick={onClose}
          className="opacity-0 group-hover:opacity-100"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: 3,
            border: "none",
            background: "none",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            color: "var(--text-muted)",
            opacity: hovered ? 0.8 : 0,
            transition: "opacity 80ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-overlay, rgba(255,255,255,0.1))";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.opacity = hovered ? "0.8" : "0";
          }}
          title="Close tab"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

// --- FaviconIcon ---

function FaviconIcon({
  favicon,
  size = 14,
  isActive = false,
}: {
  favicon?: string;
  size?: number;
  isActive?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Reset failed state when favicon URL changes
    setFailed(false);
  }, [favicon]);

  if (favicon && !failed) {
    return (
      <img
        src={favicon}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: 2 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Globe
      size={size}
      style={{ color: isActive ? "var(--accent, #4f8ef7)" : "var(--text-muted)", opacity: 0.7 }}
    />
  );
}

// --- Context Menu ---

function TabContextMenu({
  x,
  y,
  onAction,
}: {
  x: number;
  y: number;
  onAction: (action: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let nx = x;
    let ny = y;
    if (x + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 8;
    if (y + rect.height > window.innerHeight) ny = window.innerHeight - rect.height - 8;
    if (nx !== x || ny !== y) setPos({ x: nx, y: ny });
  }, [x, y]);

  const items = [
    { action: "close", label: "Close tab" },
    { action: "close-others", label: "Close other tabs" },
    { action: "duplicate", label: "Duplicate tab" },
    { action: "copy-url", label: "Copy URL" },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        backgroundColor: "var(--bg-overlay, #1e1e1e)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "4px 0",
        minWidth: 160,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {items.map(({ action, label }) => (
        <button
          key={action}
          onClick={(e) => {
            e.stopPropagation();
            onAction(action);
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "6px 14px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// --- Helpers ---

function extractDomain(url: string): string {
  if (!url) return "New Tab";
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") || url;
  } catch {
    return url;
  }
}
