/**
 * Paleta "Pipocou": sala escura, pipoca amarela, poltrona vermelha e creme de pipoca.
 * Contrastes (WCAG 2.1) medidos para os pares usados no app:
 *   texto/fundo 17,8:1 · texto/superfície 15,9:1 · texto/elevada 14,0:1
 *   textoSecundario/fundo 10,0:1 · textoSecundario/superfície 8,9:1 · textoSecundario/elevada 7,9:1
 *   primaria/fundo 12,2:1 · primaria/elevada 9,7:1 · sobrePrimaria/primaria 12,2:1
 *   destaque/fundo 4,5:1 (só gráfico, texto grande e a "TELA"; não usar em texto pequeno na superfície)
 *   erro/superfície 7,4:1 · sucesso/superfície 10,9:1 · aviso/superfície 8,2:1
 *   bordaInterativa/fundo ≥ 3:1 (exigência para contornos de componentes, não texto)
 */
const paleta = {
  fundo: '#14110F',
  superficie: '#221C18',
  elevada: '#2E2621',
  primaria: '#FFC93C',
  destaque: '#E63946',
  creme: '#FFF8E7',
  laranja: '#F4A261',
  cinzaVendido: '#5C534D',
  branco: '#FFFFFF',
  preto: '#000000',
} as const;

export const cores = {
  fundo: paleta.fundo,
  superficie: paleta.superficie,
  superficieElevada: paleta.elevada,
  borda: '#3A302A',
  bordaInterativa: '#8A7B6E',

  texto: paleta.creme,
  textoSecundario: '#C9BBA8',

  primaria: paleta.primaria,
  primariaPressionada: '#E8B22A',
  sobrePrimaria: paleta.fundo,

  /** Vermelho de poltrona: "TELA", detalhes gráficos e o logo. */
  destaque: paleta.destaque,
  sobreDestaque: paleta.fundo,

  sucesso: '#6EE7A0',
  sobreSucesso: paleta.fundo,
  aviso: paleta.laranja,
  sobreAviso: paleta.fundo,
  erro: '#FF8A80',
  fundoErro: '#3A1C1C',

  /** Mapa de assentos. A legenda também usa ícone/padrão, não só a cor. */
  assento: {
    livre: 'transparent',
    livreBorda: paleta.creme,
    selecionado: paleta.primaria,
    reservado: paleta.laranja, // + ícone de relógio; ícone #14110F 9,1:1
    vendido: paleta.cinzaVendido, // + X creme 7,1:1
    vendidoBorda: '#8A7B6E', // o cinza sozinho fica em 2,5:1 no fundo; o contorno passa de 3:1
    tela: paleta.destaque,
  },

  /** Pipoca da animação (creme com sombra amarela). */
  pipoca: { corpo: paleta.creme, sombra: paleta.primaria },

  /** Papel do ingresso e do comprovante (claro, como um ingresso impresso). Tinta/papel 17,8:1; secundária 7,9:1. */
  ingresso: {
    papel: paleta.creme,
    tinta: paleta.fundo,
    tintaSecundaria: '#5C4A3D',
    borda: '#D9CBB3',
  },

  /** QR code: escuro sobre branco para a câmera ler bem. */
  qr: { fundo: paleta.branco, tinta: paleta.fundo },

  /** Impressão do comprovante do balcão (CSS de @media print). */
  impressao: { papel: paleta.branco, tinta: paleta.preto },

  /** Selos oficiais da classificação indicativa (ClassInd). */
  classificacao: {
    LIVRE: { fundo: '#0A7A3B', texto: paleta.branco },
    DEZ: { fundo: '#0B69A3', texto: paleta.branco },
    DOZE: { fundo: '#F2C94C', texto: paleta.fundo },
    CATORZE: { fundo: '#E8790D', texto: paleta.fundo },
    DEZESSEIS: { fundo: '#C8102E', texto: paleta.branco },
    DEZOITO: { fundo: paleta.preto, texto: paleta.branco },
    bordaClara: paleta.creme,
  },

  /** Resultado da validação na entrada: verde/branco 5,0:1 · laranja/#14110F 9,1:1 · vermelho/branco 6,5:1. */
  validacao: {
    liberado: { fundo: '#15803D', texto: paleta.branco },
    utilizado: { fundo: paleta.laranja, texto: paleta.fundo },
    recusado: { fundo: '#B91C1C', texto: paleta.branco },
  },

  /** Leitor de QR: fundo da câmera e faixas translúcidas sobre a imagem. */
  camera: { fundo: paleta.preto, faixa: 'rgba(0,0,0,0.55)', texto: paleta.branco },

  /** Fundo escurecido atrás de diálogos e seletores. */
  sobreposicao: 'rgba(0,0,0,0.7)',
  sombra: paleta.preto,

  /**
   * Gráficos dos relatórios. Validados com o validador da skill dataviz sobre a superfície
   * #221C18: faixa de luminosidade, croma, separação para daltonismo (ΔE 26,8) e contraste ≥ 3:1.
   * Série única (ocupação) = azul; App × Balcão = azul × laranja, sempre com legenda e rótulo em texto.
   */
  grafico: {
    serie: '#3987E5',
    app: '#3987E5',
    balcao: '#D95926',
    grade: '#3A302A',
    trilha: paleta.elevada,
  },
} as const;

export type Cores = typeof cores;
