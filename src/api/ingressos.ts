import type { Ingresso, IngressosDaSessao } from '@/types';
import { api } from './client';

/** Ingressos do usuário agrupados por sessão (próximas primeiro, depois as passadas). */
export async function listarMeusIngressos(): Promise<IngressosDaSessao[]> {
  const { data } = await api.get<IngressosDaSessao[]>('/ingressos/meus');
  return data;
}

/** Só o dono ou um operador; para outros a API responde 404. */
export async function buscarIngresso(codigo: string): Promise<Ingresso> {
  const { data } = await api.get<Ingresso>(`/ingressos/${encodeURIComponent(codigo)}`);
  return data;
}
