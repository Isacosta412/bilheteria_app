import type { AgrupamentoVendas, RelatorioSessoes, RelatorioVendas } from '@/types';
import { api } from './client';

export interface FiltroRelatorio {
  /** AAAA-MM-DD (dias de Brasília, inclusive). */
  inicio: string;
  fim: string;
  filmeId?: number;
  salaId?: number;
}

export async function relatorioSessoes(filtro: FiltroRelatorio): Promise<RelatorioSessoes> {
  const { data } = await api.get<RelatorioSessoes>('/relatorios/sessoes', { params: filtro });
  return data;
}

export async function relatorioVendas(
  filtro: Pick<FiltroRelatorio, 'inicio' | 'fim'>,
  agrupar: AgrupamentoVendas,
): Promise<RelatorioVendas> {
  const { data } = await api.get<RelatorioVendas>('/relatorios/vendas', { params: { ...filtro, agrupar } });
  return data;
}

/**
 * Só na web: baixa /relatorios/sessoes.csv com o token (um <a href> direto não levaria o
 * cabeçalho Authorization) e entrega ao navegador como arquivo.
 */
export async function baixarCsvSessoes(filtro: FiltroRelatorio): Promise<void> {
  const { data } = await api.get<Blob>('/relatorios/sessoes.csv', { params: filtro, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-sessoes-${filtro.inicio}-a-${filtro.fim}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
