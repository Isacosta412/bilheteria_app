/**
 * Paleta "Pipocou" — sala de cinema: fundo vinho/terracota (veludo das poltronas), cartões em
 * vinho escuro, pipoca amarela, vermelho do balde e creme/branco da pipoca.
 * Contrastes (WCAG 2.1) medidos para os pares usados no app:
 *   texto/fundo 7,0:1 · texto/superfície 13,0:1 · texto/elevada 10,9:1
 *   textoSecundario/fundo 5,5:1 · textoSecundario/superfície 10,3:1 · textoSecundario/elevada 8,5:1
 *   primaria/fundo 4,8:1 · primaria/superfície 9,0:1 · sobrePrimaria/primaria 9,0:1
 *   vermelho/superfície 4,5:1 (detalhes, "TELA" e o logo; não usar em texto pequeno sobre o fundo)
 *   erro/superfície 8,1:1 · sucesso/superfície 9,8:1 · aviso/superfície 6,7:1
 *   bordaInterativa/superfície 7,6:1 (contornos de componentes ≥ 3:1)
 */
const paleta = {
  fundo: '#8A3F37',
  superficie: '#4F1D1A',
  elevada: '#63261F',
  vinhoProfundo: '#3A1512',
  primaria: '#FFC93C',
  destaque: '#FF5A66',
  vermelhoBalde: '#E63946',
  creme: '#FFF8E7',
  laranja: '#F4A261',
  cinzaVendido: '#6B5550',
  branco: '#FFFFFF',
  preto: '#000000',
} as const;

export const cores = {
  fundo: paleta.fundo,
  superficie: paleta.superficie,
  superficieElevada: paleta.elevada,
  borda: '#7A3A32',
  bordaInterativa: '#E0AEA2',

  texto: paleta.creme,
  textoSecundario: '#F3D9CC',

  primaria: paleta.primaria,
  primariaPressionada: '#E8B22A',
  sobrePrimaria: paleta.vinhoProfundo,

  /** Vermelho do balde: detalhes gráficos, faixas listradas e o logo. */
  destaque: paleta.destaque,
  sobreDestaque: paleta.vinhoProfundo,
  /** Vermelho das listras do balde (faixa listrada e logo). */
  vermelhoListra: paleta.vermelhoBalde,
  /** Branco puro dos detalhes (listras, contornos da marca). */
  branco: paleta.branco,
  /** Cabeçalho e barra de abas: vinho mais fundo que os cartões. */
  barra: paleta.vinhoProfundo,
  /** Desenhos de cinema e pipoca do fundo (creme bem transparente sobre o vinho). */
  desenhoFundo: paleta.creme,

  sucesso: '#7CF0AE',
  sobreSucesso: paleta.vinhoProfundo,
  aviso: paleta.laranja,
  sobreAviso: paleta.vinhoProfundo,
  erro: '#FFB4A8',
  fundoErro: '#3A1512',

  /** Mapa de assentos. A legenda também usa ícone/padrão, não só a cor. */
  assento: {
    livre: 'transparent',
    livreBorda: paleta.creme,
    selecionado: paleta.primaria,
    reservado: paleta.laranja, // + ícone de relógio; ícone #14110F 9,1:1
    vendido: paleta.cinzaVendido, // + X creme 7,1:1
    vendidoBorda: '#C9A9A0', // contorno claro para o assento vendido se destacar do cartão
    tela: paleta.branco,
  },

  /** Pipoca da animação (creme com sombra amarela). */
  pipoca: { corpo: paleta.creme, sombra: paleta.primaria },

  /** Papel do ingresso e do comprovante (claro, como um ingresso impresso). Tinta/papel 17,8:1; secundária 7,9:1. */
  ingresso: {
    papel: paleta.creme,
    tinta: paleta.vinhoProfundo,
    tintaSecundaria: '#6B3A33',
    borda: '#D9CBB3',
  },

  /** QR code: escuro sobre branco para a câmera ler bem. */
  qr: { fundo: paleta.branco, tinta: paleta.preto },

  /** Impressão do comprovante do balcão (CSS de @media print). */
  impressao: { papel: paleta.branco, tinta: paleta.preto },

  /** Selos oficiais da classificação indicativa (ClassInd). */
  classificacao: {
    LIVRE: { fundo: '#0A7A3B', texto: paleta.branco },
    DEZ: { fundo: '#0B69A3', texto: paleta.branco },
    DOZE: { fundo: '#F2C94C', texto: paleta.preto },
    CATORZE: { fundo: '#E8790D', texto: paleta.preto },
    DEZESSEIS: { fundo: '#C8102E', texto: paleta.branco },
    DEZOITO: { fundo: paleta.preto, texto: paleta.branco },
    bordaClara: paleta.creme,
  },

  /** Resultado da validação na entrada: verde/branco 5,0:1 · laranja/#14110F 9,1:1 · vermelho/branco 6,5:1. */
  validacao: {
    liberado: { fundo: '#15803D', texto: paleta.branco },
    utilizado: { fundo: paleta.laranja, texto: paleta.vinhoProfundo },
    recusado: { fundo: '#B91C1C', texto: paleta.branco },
  },

  /** Leitor de QR: fundo da câmera e faixas translúcidas sobre a imagem. */
  camera: { fundo: paleta.preto, faixa: 'rgba(0,0,0,0.55)', texto: paleta.branco },

  /** Fundo escurecido atrás de diálogos e seletores. */
  sobreposicao: 'rgba(0,0,0,0.7)',
  sombra: paleta.preto,

  /**
   * Gráficos dos relatórios, sobre a superfície vinho #4F1D1A (contraste ≥ 5:1 em todas as séries).
   * Série única (ocupação) = amarelo pipoca; App × Balcão = azul × laranja, sempre com legenda e rótulo em texto.
   */
  grafico: {
    serie: '#FFC93C',
    app: '#6FA8F5',
    balcao: '#F4A261',
    grade: '#7A3A32',
    trilha: paleta.elevada,
  },
} as const;

export type Cores = typeof cores;
