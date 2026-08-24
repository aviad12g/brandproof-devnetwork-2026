/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_XANO_API_BASE?: string;
  readonly VITE_FIXTURE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
