import type { Compra, MetodoPagamento } from '@/types';
import { api } from './client';

export interface DadosVendaBalcao {
  sessaoId: number;
  assentoIds: number[];
  metodo: MetodoPagamento;
  nomeComprador?: string;
}

/** Venda presencial: reserva + pagamento em uma transação na API. O total é calculado por ela. */
export async function venderNoBalcao(dados: DadosVendaBalcao): Promise<Compra> {
  const { data } = await api.post<Compra>('/balcao/vendas', dados);
  return data;
}
