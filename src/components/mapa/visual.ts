import { cores } from '@/theme';
import type { AssentoMapa, TipoAssento } from '@/types';

/** Estado visual de um assento (o status da API + a seleção local). */
export type EstadoVisual = 'livre' | 'selecionado' | 'reservado' | 'vendido' | 'minhaReserva';

export function estadoVisual(assento: AssentoMapa, selecionado: boolean): EstadoVisual {
  if (assento.minhaReserva) return 'minhaReserva';
  if (assento.status === 'VENDIDO') return 'vendido';
  if (assento.status === 'RESERVADO') return 'reservado';
  return selecionado ? 'selecionado' : 'livre';
}

/**
 * Cor E ícone para cada estado (a legenda nunca depende só da cor).
 * Textos/ícones com contraste AA sobre o fundo do assento.
 */
export const VISUAL: Record<EstadoVisual, { fundo: string; borda: string; icone: string; corIcone: string; rotulo: string }> = {
  livre: { fundo: 'transparent', borda: cores.assento.livreBorda, icone: '', corIcone: cores.textoSecundario, rotulo: 'Livre' },
  selecionado: { fundo: cores.assento.selecionado, borda: cores.assento.selecionado, icone: '✓', corIcone: cores.sobrePrimaria, rotulo: 'Selecionado' },
  reservado: { fundo: cores.assento.reservado, borda: cores.assento.reservado, icone: '⏱', corIcone: cores.sobreAviso, rotulo: 'Reservado' },
  vendido: { fundo: cores.assento.vendido, borda: cores.assento.vendido, icone: '✕', corIcone: cores.texto, rotulo: 'Vendido' },
  minhaReserva: { fundo: 'transparent', borda: cores.primaria, icone: '◉', corIcone: cores.primaria, rotulo: 'Sua reserva' },
};

export const ICONE_TIPO: Record<TipoAssento, string> = { PADRAO: '', PCD: '♿', VIP: '★' };

export const DESCRICAO_ESTADO: Record<EstadoVisual, string> = {
  livre: 'livre',
  selecionado: 'selecionado',
  reservado: 'reservado',
  vendido: 'vendido',
  minhaReserva: 'reservado por você',
};
