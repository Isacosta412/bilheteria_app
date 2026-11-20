import type { Compra, MapaAssentos, MetodoPagamento, Reserva } from '@/types';
import { api } from './client';

/** Mapa da sessão. Com login, marca `minhaReserva` nos assentos do próprio usuário. */
export async function buscarMapaAssentos(sessaoId: number): Promise<MapaAssentos> {
  const { data } = await api.get<MapaAssentos>(`/sessoes/${sessaoId}/assentos`);
  return data;
}

/** Só sessão e assentos: total, prazo e status são calculados pela API. */
export async function reservar(dados: { sessaoId: number; assentoIds: number[] }): Promise<Reserva> {
  const { data } = await api.post<Reserva>('/reservas', dados);
  return data;
}

export async function buscarReserva(id: number): Promise<Reserva> {
  const { data } = await api.get<Reserva>(`/reservas/${id}`);
  return data;
}

export async function listarMinhasReservas(): Promise<Reserva[]> {
  const { data } = await api.get<Reserva[]>('/reservas/minhas');
  return data;
}

export async function cancelarReserva(id: number): Promise<Reserva> {
  const { data } = await api.delete<Reserva>(`/reservas/${id}`);
  return data;
}

/** Pagamento simulado pelo app (PIX ou cartão). O valor é sempre o total da reserva, definido pela API. */
export async function pagarReserva(id: number, metodo: Extract<MetodoPagamento, 'PIX' | 'CARTAO'>): Promise<Compra> {
  const { data } = await api.post<Compra>(`/reservas/${id}/pagamento`, { metodo });
  return data;
}
