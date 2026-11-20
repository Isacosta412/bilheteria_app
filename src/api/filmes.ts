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

/** Campos que o operador preenche (id, ativo e datas ficam com a API). */
export interface DadosFilme {
  titulo: string;
  sinopse: string;
  duracaoMinutos: number;
  classificacao: Filme['classificacao'];
  genero: string;
  posterUrl: string | null;
}

export async function criarFilme(dados: DadosFilme): Promise<Filme> {
  const { data } = await api.post<Filme>('/filmes', dados);
  return data;
}

export async function atualizarFilme(id: number, dados: DadosFilme): Promise<Filme> {
  const { data } = await api.put<Filme>(`/filmes/${id}`, dados);
  return data;
}

export async function definirFilmeAtivo(id: number, ativo: boolean): Promise<Filme> {
  const { data } = await api.patch<Filme>(`/filmes/${id}/ativo`, { ativo });
  return data;
}
