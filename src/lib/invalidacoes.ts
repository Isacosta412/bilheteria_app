import type { QueryClient } from '@tanstack/react-query';
import { chaves } from '@/api/chaves';

/**
 * Depois de reservar, pagar ou cancelar: tudo que mostra disponibilidade ou compras fica
 * desatualizado (mapa, "X lugares livres" das listas de sessões, minhas reservas e ingressos).
 */
export async function invalidarAposCompra(queryClient: QueryClient, sessaoId?: number): Promise<void> {
  await Promise.all([
    sessaoId !== undefined
      ? queryClient.invalidateQueries({ queryKey: chaves.mapa(sessaoId) })
      : queryClient.invalidateQueries({ queryKey: ['mapa'] }),
    queryClient.invalidateQueries({ queryKey: chaves.todasSessoes() }),
    queryClient.invalidateQueries({ queryKey: ['sessao'] }),
    queryClient.invalidateQueries({ queryKey: ['reserva'] }),
    queryClient.invalidateQueries({ queryKey: chaves.reservasMinhas() }),
    // prefixo ['ingressos']: a lista "meus" e cada ingresso aberto
    queryClient.invalidateQueries({ queryKey: ['ingressos'] }),
  ]);
}
