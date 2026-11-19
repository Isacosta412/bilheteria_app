/**
 * Chaves do React Query num só lugar: telas diferentes que pedem os mesmos dados
 * compartilham o cache, e uma invalidação acerta todas.
 */
export const chaves = {
  filmes: (filtros: { ativo?: boolean; busca?: string }) => ['filmes', filtros] as const,
  filme: (id: number) => ['filme', id] as const,
  /** filmeId/data nulos = sem filtro (todas as sessões futuras). */
  sessoes: (filmeId: number | null, data: string | null) => ['sessoes', filmeId, data] as const,
  sessao: (id: number) => ['sessao', id] as const,
};
