/**
 * Chaves do React Query num só lugar: telas diferentes que pedem os mesmos dados
 * compartilham o cache, e uma invalidação acerta todas.
 */
export const chaves = {
  filmes: (filtros: { ativo?: boolean; busca?: string }) => ['filmes', filtros] as const,
  filme: (id: number) => ['filme', id] as const,
  /** filmeId/data nulos = sem filtro (todas as sessões futuras). */
  sessoes: (filmeId: number | null, data: string | null) => ['sessoes', filmeId, data] as const,
  /** Prefixo de todas as listas de sessões (para invalidar). */
  todasSessoes: () => ['sessoes'] as const,
  /** Gerência: lista com canceladas (fica sob o prefixo ['sessoes'] para as invalidações). */
  sessoesGerencia: (data: string | null) => ['sessoes', 'gerencia', data] as const,
  sessao: (id: number) => ['sessao', id] as const,
  salas: () => ['salas'] as const,
  sala: (id: number) => ['salas', id] as const,
  relatorioSessoes: (filtro: { inicio: string; fim: string; filmeId?: number; salaId?: number }) =>
    ['relatorios', 'sessoes', filtro] as const,
  relatorioVendas: (filtro: { inicio: string; fim: string }, agrupar: string) =>
    ['relatorios', 'vendas', filtro, agrupar] as const,
  mapa: (sessaoId: number) => ['mapa', sessaoId] as const,
  reserva: (id: number) => ['reserva', id] as const,
  reservasMinhas: () => ['reservas', 'minhas'] as const,
  ingressosMeus: () => ['ingressos', 'meus'] as const,
  ingresso: (codigo: string) => ['ingressos', 'codigo', codigo] as const,
};
