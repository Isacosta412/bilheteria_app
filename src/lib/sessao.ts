import type { FormatoSessao, IdiomaSessao } from '@/types';

export const ROTULO_FORMATO: Record<FormatoSessao, string> = { DOIS_D: '2D', TRES_D: '3D' };
export const ROTULO_IDIOMA: Record<IdiomaSessao, string> = { DUBLADO: 'Dublado', LEGENDADO: 'Legendado' };
/** Siglas curtas para os cartões ("DUB", "LEG"). */
export const SIGLA_IDIOMA: Record<IdiomaSessao, string> = { DUBLADO: 'DUB', LEGENDADO: 'LEG' };

/** "3D · Legendado" */
export function descreverVersao(sessao: { formato: FormatoSessao; idioma: IdiomaSessao }): string {
  return `${ROTULO_FORMATO[sessao.formato]} · ${ROTULO_IDIOMA[sessao.idioma]}`;
}
