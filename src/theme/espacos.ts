/** Escala de espaçamento (múltiplos de 4). */
export const espacos = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const raios = {
  sm: 6,
  md: 10,
  lg: 16,
  pilula: 999,
} as const;

/** Largura máxima do conteúdo na web (centralizado). */
export const LARGURA_MAXIMA = 960;

/** Área de toque mínima recomendada (WCAG/Material: 44–48). */
export const AREA_TOQUE_MINIMA = 44;
