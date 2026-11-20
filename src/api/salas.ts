import type { Sala, SalaDetalhe } from '@/types';
import { api } from './client';

export interface PosicaoAssento {
  fila: string;
  numero: number;
}

/** Layout gerado pela API: filas A, B, C... (qtdFilas) × assentosPorFila. */
export interface EstruturaSala {
  qtdFilas: number;
  assentosPorFila: number;
  assentosPcd: PosicaoAssento[];
  assentosVip: PosicaoAssento[];
}

export async function listarSalas(): Promise<Sala[]> {
  const { data } = await api.get<Sala[]>('/salas');
  return data;
}

export async function buscarSala(id: number): Promise<SalaDetalhe> {
  const { data } = await api.get<SalaDetalhe>(`/salas/${id}`);
  return data;
}

export async function criarSala(dados: { nome: string } & EstruturaSala): Promise<SalaDetalhe> {
  const { data } = await api.post<SalaDetalhe>('/salas', dados);
  return data;
}

/** Sem `estrutura`, só o nome e o "ativa" mudam (sempre permitido). */
export async function atualizarSala(
  id: number,
  dados: { nome: string; ativa: boolean; estrutura?: EstruturaSala },
): Promise<SalaDetalhe> {
  const { data } = await api.put<SalaDetalhe>(`/salas/${id}`, dados);
  return data;
}
