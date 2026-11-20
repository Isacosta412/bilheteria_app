/**
 * Paleta de cinema: fundo escuro, primária coral vibrante.
 * Contrastes (WCAG 2.1) medidos para os pares usados no app:
 *   texto/fundo 17,5:1 · texto/superfície 15,7:1 · textoSecundario/superfície 7,5:1
 *   primaria/fundo 6,4:1 · sobrePrimaria/primaria 6,1:1 (branco sobre a primária daria 3,0:1: NÃO usar)
 *   erro/superfície 6,8:1 · sucesso/superfície 9,9:1 · aviso/superfície 11,3:1
 *   bordaInterativa/fundo ≥ 3:1 (exigência para contornos de componentes, não texto)
 */
export const cores = {
  fundo: '#0E0E13',
  superficie: '#1A1A23',
  superficieElevada: '#24242F',
  borda: '#2C2C38',
  bordaInterativa: '#6E6E84',

  texto: '#F4F4F6',
  textoSecundario: '#A9A9B8',

  primaria: '#FF5A6E',
  primariaPressionada: '#E64A5E',
  sobrePrimaria: '#14141A',

  sucesso: '#4ADE80',
  sobreSucesso: '#14141A',
  aviso: '#FACC15',
  sobreAviso: '#14141A',
  erro: '#FF7A7A',
  fundoErro: '#3A1820',

  /** Mapa de assentos (F03). A legenda também usa ícone/padrão, não só a cor. */
  assento: {
    livre: 'transparent',
    livreBorda: '#A9A9B8',
    selecionado: '#FF5A6E',
    reservado: '#FACC15',
    vendido: '#4B4B5A',
  },

  /**
   * Gráficos dos relatórios (F06). Validados com o validador da skill dataviz sobre a superfície
   * #1A1A23: faixa de luminosidade, croma, separação para daltonismo (ΔE 26,8) e contraste ≥ 3:1.
   * Série única (ocupação) = azul; App × Balcão = azul × laranja, sempre com legenda e rótulo em texto.
   */
  grafico: {
    serie: '#3987E5',
    app: '#3987E5',
    balcao: '#D95926',
    grade: '#2C2C38',
    trilha: '#24242F',
  },
} as const;

export type Cores = typeof cores;
