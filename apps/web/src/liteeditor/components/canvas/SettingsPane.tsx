// @ts-nocheck
import { UnifiedSettings } from "../settings/UnifiedSettings";

export function SettingsPane() {
  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <UnifiedSettings />
    </div>
  );
}
