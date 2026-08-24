import { FPS } from "./tema";
import type { Roteiro } from "./roteiros";

// Ritmo de fala coloquial em PT-BR (~156 palavras/min). Quando entrar audio de
// verdade (ElevenLabs), trocar esse calculo pela duracao real do arquivo.
const PALAVRAS_POR_SEGUNDO = 2.6;

const PAUSA_APOS_GANCHO = 18;
const PAUSA_NO_CTA = 45;
const MIN_FRAMES_POR_LEGENDA = 22;

export const palavras = (texto: string): string[] =>
  texto.split(/\s+/).filter(Boolean);

export const framesDeFala = (texto: string): number =>
  Math.ceil((palavras(texto).length / PALAVRAS_POR_SEGUNDO) * FPS);

/** Quebra o texto em blocos curtos de legenda queimada. */
export const emLegendas = (texto: string, maxPalavras = 4): string[] => {
  const todas = palavras(texto);
  const blocos: string[] = [];
  for (let i = 0; i < todas.length; i += maxPalavras) {
    blocos.push(todas.slice(i, i + maxPalavras).join(" "));
  }
  return blocos;
};

export type Legenda = {
  texto: string;
  inicio: number;
  duracao: number;
};

export type Cronograma = {
  gancho: { inicio: number; duracao: number };
  legendas: Legenda[];
  cta: { inicio: number; duracao: number };
  total: number;
};

export const montarCronograma = (roteiro: Roteiro): Cronograma => {
  const duracaoGancho = framesDeFala(roteiro.gancho) + PAUSA_APOS_GANCHO;

  let cursor = duracaoGancho;
  const legendas = emLegendas(roteiro.desenvolvimento).map((texto) => {
    const duracao = Math.max(framesDeFala(texto), MIN_FRAMES_POR_LEGENDA);
    const legenda = { texto, inicio: cursor, duracao };
    cursor += duracao;
    return legenda;
  });

  const duracaoCta = framesDeFala(roteiro.cta) + PAUSA_NO_CTA;

  return {
    gancho: { inicio: 0, duracao: duracaoGancho },
    legendas,
    cta: { inicio: cursor, duracao: duracaoCta },
    total: cursor + duracaoCta,
  };
};
