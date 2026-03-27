import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] py-1 rounded shadow-lg"
      style={{
        left: x,
        top: y,
        backgroundColor: "var(--bg-overlay)",
        border: "1px solid var(--border)",
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 mx-2" style={{ borderTop: "1px solid var(--border)" }} />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-default transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>,
    document.body,
  );
}
