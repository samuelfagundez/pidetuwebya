/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_MAILER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
