/// <reference path="../.astro/types.d.ts" />

// Declaraciones para las variables de entorno accesibles desde import.meta.env
interface ImportMetaEnv {
  /** API Key para Resend (server only) */
  readonly RESEND_API_KEY?: string;
  /** Dirección de correo remitente (server only) */
  readonly SENDER_EMAIL?: string;
  /** Dirección de correo receptora (opcional). Si no está, se usará SENDER_EMAIL */
  readonly RECEIVER_EMAIL?: string;
  /** Entorno de ejecución */
  readonly NODE_ENV?: 'development' | 'production' | 'test';
  // Añadir aquí otras variables públicas si las necesitas, por ejemplo:
  // readonly PUBLIC_SOME_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
