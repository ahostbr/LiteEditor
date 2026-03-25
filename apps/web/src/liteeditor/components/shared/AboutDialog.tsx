// @ts-nocheck
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const [info, setInfo] = useState<{
    appName: string;
    appDescription: string;
    version: string;
    commitHash?: string;
    buildDate?: string;
    electronVersion?: string;
    nodeVersion?: string;
    platform?: string;
    links?: Array<{ label: string; url: string }>;
  } | null>(null);
  const [iconSrc, setIconSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.api.about.getInfo().then(setInfo);
    window.api.about.getIcon().then((src: string | null) => {
      if (src) setIconSrc(src);
    });
  }, []);

  if (!info) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md p-1 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onClick={onClose}
          aria-label="Close about dialog"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-4">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt=""
              className="h-14 w-14 rounded-lg border object-contain p-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-overlay)" }}
              draggable={false}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {info.appName}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {info.appDescription}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt style={{ color: "var(--text-muted)" }}>Version</dt>
          <dd style={{ color: "var(--text-primary)" }}>{info.version}</dd>
          {info.commitHash ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Commit</dt>
              <dd style={{ color: "var(--text-primary)" }}>{info.commitHash}</dd>
            </>
          ) : null}
          {info.buildDate ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Build Date</dt>
              <dd style={{ color: "var(--text-primary)" }}>{info.buildDate}</dd>
            </>
          ) : null}
          {info.electronVersion ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Electron</dt>
              <dd style={{ color: "var(--text-primary)" }}>{info.electronVersion}</dd>
            </>
          ) : null}
          {info.nodeVersion ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Node</dt>
              <dd style={{ color: "var(--text-primary)" }}>{info.nodeVersion}</dd>
            </>
          ) : null}
          {info.platform ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Platform</dt>
              <dd style={{ color: "var(--text-primary)" }}>{info.platform}</dd>
            </>
          ) : null}
        </dl>
        {info.links && info.links.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {info.links.map((link) => (
              <button
                key={link.url}
                type="button"
                className="rounded-md border px-3 py-1.5 text-xs transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-overlay)",
                }}
                onClick={() => window.api.shell.openExternal(link.url)}
              >
                {link.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
