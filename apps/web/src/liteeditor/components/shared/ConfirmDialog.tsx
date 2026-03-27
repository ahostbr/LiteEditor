import React, { useEffect, useRef } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useDialogStore, type DialogButton } from "../../stores/dialog-store";

const icons = {
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const iconColors = {
  warning: "var(--accent)",
  error: "var(--error)",
  info: "var(--info)",
};

function getButtonStyle(variant: DialogButton["variant"]): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: "var(--accent)",
        color: "var(--bg-base)",
      };
    case "destructive":
      return {
        backgroundColor: "transparent",
        color: "var(--error)",
        border: "1px solid color-mix(in srgb, var(--error) 40%, transparent)",
      };
    case "muted":
      return {
        backgroundColor: "var(--bg-muted)",
        color: "var(--text-secondary)",
        border: "1px solid transparent",
      };
  }
}

function getButtonHoverStyle(variant: DialogButton["variant"]): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: "var(--accent-hover)",
        color: "var(--bg-base)",
      };
    case "destructive":
      return {
        backgroundColor: "color-mix(in srgb, var(--error) 12%, transparent)",
        color: "var(--error)",
        border: "1px solid var(--error)",
      };
    case "muted":
      return {
        backgroundColor: "var(--bg-subtle)",
        color: "var(--text-primary)",
        border: "1px solid transparent",
      };
  }
}

export function ConfirmDialog() {
  const isOpen = useDialogStore((s) => s.isOpen);
  const options = useDialogStore((s) => s.options);
  const dismiss = useDialogStore((s) => s.dismiss);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !options) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        dismiss(options.cancelIndex);
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [isOpen, options, dismiss]);

  if (!isOpen || !options) return null;

  const IconComponent = options.icon ? icons[options.icon] : null;
  const iconColor = options.icon ? iconColors[options.icon] : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss(options.cancelIndex);
      }}
    >
      <div
        ref={panelRef}
        className="rounded-lg shadow-2xl w-[420px] max-w-[90vw]"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 0 0 1px rgba(212, 160, 57, 0.06), 0 24px 48px rgba(0, 0, 0, 0.5)",
          animation: "dialogEnter 150ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-1">
          {IconComponent && (
            <div
              className="shrink-0 mt-0.5 rounded-md flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                backgroundColor: `color-mix(in srgb, ${iconColor} 10%, transparent)`,
              }}
            >
              <IconComponent size={18} style={{ color: iconColor }} />
            </div>
          )}
          <div className="min-w-0">
            <h3
              className="text-[13px] font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {options.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4" style={{ paddingLeft: IconComponent ? 60 : 20 }}>
          <p
            className="text-[12px] leading-relaxed mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {options.message}
          </p>
          {options.detail && (
            <p
              className="mt-2 text-[11px] leading-relaxed whitespace-pre-line"
              style={{
                color: "var(--text-muted)",
                fontFamily: options.detailMonospace
                  ? "JetBrains Mono, Consolas, Courier New, monospace"
                  : "inherit",
              }}
            >
              {options.detail}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Render in reverse so primary (index 0) is rightmost */}
          {[...options.buttons].reverse().map((btn, reverseI) => {
            const i = options.buttons.length - 1 - reverseI;
            return (
              <button
                key={i}
                onClick={() => dismiss(i)}
                autoFocus={i === 0}
                className={"px-4 py-1.5 rounded text-[12px] font-medium transition-all duration-100 cursor-default dialog-btn-" + (btn.variant || "muted")}
                style={getButtonStyle(btn.variant)}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
