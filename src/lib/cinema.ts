/** Onde fica o cinema. Aparece em Em cartaz, na página do filme e no ingresso. */
export const CINEMA = {
  nome: 'Pipocou Chapecó',
  local: 'Pátio Chapecó',
  endereco: 'Av. Fernando Machado, 4000-D, Líder',
  cidade: 'Chapecó - SC, 89805-203',
} as const;

/** "Pátio Chapecó · Av. Fernando Machado, 4000-D, Líder · Chapecó - SC, 89805-203" */
export const ENDERECO_COMPLETO = `${CINEMA.local} · ${CINEMA.endereco} · ${CINEMA.cidade}`;
