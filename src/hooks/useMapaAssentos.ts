import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { chaves } from '@/api/chaves';
import { buscarMapaAssentos } from '@/api/reservas';

/** Intervalo de atualização do mapa (CLAUDE.md: a cada 5 s). */
export const INTERVALO_MAPA_MS = 5000;

/**
 * Mapa de assentos da sessão, atualizado a cada 5 s enquanto a tela está aberta e
 * sempre que a pessoa volta para ela (foco).
 */
export function useMapaAssentos(sessaoId: number, habilitado = true) {
  const consulta = useQuery({
    queryKey: chaves.mapa(sessaoId),
    queryFn: () => buscarMapaAssentos(sessaoId),
    enabled: habilitado,
    refetchInterval: INTERVALO_MAPA_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { refetch } = consulta;
  useFocusEffect(
    useCallback(() => {
      if (habilitado) void refetch();
    }, [habilitado, refetch]),
  );

  return consulta;
}
