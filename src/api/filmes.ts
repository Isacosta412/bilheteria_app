import type { Filme } from '@/types';
import { api } from './client';

export interface FiltroFilmes {
  ativo?: boolean;
  busca?: string;
}

export async function listarFilmes(filtro: FiltroFilmes = {}): Promise<Filme[]> {
  const { data } = await api.get<Filme[]>('/filmes', {
    params: {
      ativo: filtro.ativo === undefined ? undefined : String(filtro.ativo),
      busca: filtro.busca || undefined,
    },
  });
  return data;
}

export async function buscarFilme(id: number): Promise<Filme> {
  const { data } = await api.get<Filme>(`/filmes/${id}`);
  return data;
}
