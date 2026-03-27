/// <reference types="vite/client" />

import type { NativeApi, DesktopBridge } from "@liteeditor/contracts";

interface ImportMetaEnv {
  readonly APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    api?: any;
    nativeApi?: NativeApi;
    desktopBridge?: DesktopBridge;
  }
}
