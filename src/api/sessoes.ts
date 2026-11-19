import type { Sessao } from '@/types';
import { api } from './client';

export interface FiltroSessoes {
  filmeId?: number;
  /** Dia AAAA-MM-DD (a API interpreta no horário de Brasília). */
  data?: string;
}

/** Só sessões futuras e não canceladas (padrão da API). */
export async function listarSessoes(filtro: FiltroSessoes = {}): Promise<Sessao[]> {
  const { data } = await api.get<Sessao[]>('/sessoes', { params: { filmeId: filtro.filmeId, data: filtro.data } });
  return data;
}

export async function buscarSessao(id: number): Promise<Sessao> {
  const { data } = await api.get<Sessao>(`/sessoes/${id}`);
  return data;
}
