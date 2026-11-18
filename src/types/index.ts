/**
 * Tipos que espelham os DTOs da bilheteria-api.
 * Convenções da API: datas em ISO 8601 (string, UTC) e valores em reais como string com
 * 2 casas ("30.00"). Nunca use `any`.
 */

// ─── Usuário ─────────────────────────────────────────────────────────────────
export type Papel = 'CLIENTE' | 'OPERADOR';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  criadoEm: string;
}

export interface RespostaLogin {
  token: string;
  usuario: Usuario;
}

// ─── Filme ───────────────────────────────────────────────────────────────────
export type Classificacao = 'LIVRE' | 'DEZ' | 'DOZE' | 'CATORZE' | 'DEZESSEIS' | 'DEZOITO';

export interface Filme {
  id: number;
  titulo: string;
  sinopse: string;
  duracaoMinutos: number;
  classificacao: Classificacao;
  genero: string;
  posterUrl: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Sala ────────────────────────────────────────────────────────────────────
export type TipoAssento = 'PADRAO' | 'PCD' | 'VIP';

export interface Sala {
  id: number;
  nome: string;
  ativa: boolean;
  capacidade: number;
  qtdFilas: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SalaDetalhe extends Sala {
  layout: { fila: string; assentos: { id: number; numero: number; tipo: TipoAssento }[] }[];
}

// ─── Sessão ──────────────────────────────────────────────────────────────────
export interface Sessao {
  id: number;
  dataHora: string;
  /** Fim do filme (sem o intervalo de limpeza). */
  terminoPrevisto: string;
  preco: string;
  cancelada: boolean;
  /** Livres agora (LIVRE + reservados com prazo vencido). */
  assentosLivres: number;
  filme: Pick<Filme, 'id' | 'titulo' | 'duracaoMinutos' | 'classificacao' | 'posterUrl'>;
  sala: Pick<Sala, 'id' | 'nome'>;
}

// ─── Mapa de assentos ────────────────────────────────────────────────────────
export type StatusAssento = 'LIVRE' | 'RESERVADO' | 'VENDIDO';

export interface AssentoMapa {
  assentoId: number;
  numero: number;
  tipo: TipoAssento;
  /** Status efetivo (um reservado vencido já vem como LIVRE). */
  status: StatusAssento;
  /** true só nos assentos que o próprio usuário logado reservou. */
  minhaReserva: boolean;
}

export interface MapaAssentos {
  sessao: Sessao;
  filas: { fila: string; assentos: AssentoMapa[] }[];
  resumo: { livres: number; reservados: number; vendidos: number };
}

// ─── Reserva ─────────────────────────────────────────────────────────────────
export type StatusReserva = 'PENDENTE' | 'PAGA' | 'EXPIRADA' | 'CANCELADA';
export type CanalReserva = 'APP' | 'BALCAO';

export interface Reserva {
  reservaId: number;
  status: StatusReserva;
  canal: CanalReserva;
  total: string;
  expiraEm: string;
  criadoEm: string;
  sessao: { id: number; dataHora: string; filmeTitulo: string; salaNome: string };
  /** Vazio quando a reserva expirou ou foi cancelada (os assentos foram liberados). */
  assentos: { assentoId: number; fila: string; numero: number; tipo: TipoAssento }[];
}

// ─── Pagamento e ingresso (confirmar após o B06) ─────────────────────────────
export type MetodoPagamento = 'PIX' | 'CARTAO' | 'DINHEIRO';

export interface Ingresso {
  codigo: string;
  emitidoEm: string;
  utilizadoEm: string | null;
  sessao: { id: number; dataHora: string; filmeTitulo: string; salaNome: string };
  assento: { fila: string; numero: number; tipo: TipoAssento };
}

// ─── Relatório (view vw_relatorio_sessoes; confirmar após o B07) ─────────────
export interface RelatorioSessao {
  sessaoId: number;
  filmeId: number;
  filmeTitulo: string;
  salaId: number;
  salaNome: string;
  dataHora: string;
  preco: string;
  cancelada: boolean;
  capacidade: number;
  vendidos: number;
  reservados: number;
  livres: number;
  /** Percentual com 2 casas, ex.: "20.00". */
  taxaOcupacao: string;
  receita: string;
}

// ─── Erros ───────────────────────────────────────────────────────────────────
export interface ErroApi {
  erro: {
    codigo: string;
    mensagem: string;
    detalhes?: unknown;
  };
}
