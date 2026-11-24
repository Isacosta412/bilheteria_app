import type { FormatoSessao, IdiomaSessao, Sessao } from '@/types';
import { api } from './client';

export interface FiltroSessoes {
  filmeId?: number;
  salaId?: number;
  /** Dia AAAA-MM-DD (a API interpreta no horário de Brasília). */
  data?: string;
  /** Gerência: mostra também as canceladas. */
  incluirCanceladas?: boolean;
}

/** Por padrão, só sessões futuras e não canceladas. */
export async function listarSessoes(filtro: FiltroSessoes = {}): Promise<Sessao[]> {
  const { data } = await api.get<Sessao[]>('/sessoes', {
    params: {
      filmeId: filtro.filmeId,
      salaId: filtro.salaId,
      data: filtro.data,
      incluirCanceladas: filtro.incluirCanceladas ? 'true' : undefined,
    },
  });
  return data;
}

export async function buscarSessao(id: number): Promise<Sessao> {
  const { data } = await api.get<Sessao>(`/sessoes/${id}`);
  return data;
}

export interface DadosSessao {
  filmeId: number;
  salaId: number;
  /** ISO 8601 com fuso. */
  dataHora: string;
  preco: number;
  formato: FormatoSessao;
  idioma: IdiomaSessao;
}

export async function criarSessao(dados: DadosSessao): Promise<Sessao> {
  const { data } = await api.post<Sessao>('/sessoes', dados);
  return data;
}

/** Troca o formato e/ou o idioma de uma sessão já criada. */
export async function atualizarSessao(id: number, dados: { formato?: FormatoSessao; idioma?: IdiomaSessao }): Promise<Sessao> {
  const { data } = await api.patch<Sessao>(`/sessoes/${id}`, dados);
  return data;
}

export async function cancelarSessao(id: number): Promise<Sessao> {
  const { data } = await api.patch<Sessao>(`/sessoes/${id}/cancelar`);
  return data;
}
