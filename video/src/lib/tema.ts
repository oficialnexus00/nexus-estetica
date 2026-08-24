// Identidade visual da NEXUS — ver `empresa/identidade-visual.md`.

export const CORES = {
  fundo: "#0A0C0E",
  fundoElevado: "#14181B",
  teal: "#00BFA5",
  texto: "#FFFFFF",
  textoSuave: "#8D9AA3",
} as const;

// Inter e a tipografia oficial. Fallback pro stack do sistema caso a fonte nao
// esteja instalada na maquina que renderiza (ver README).
export const FONTE =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
