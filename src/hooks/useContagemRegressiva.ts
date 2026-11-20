import { useEffect, useState } from 'react';

export interface Contagem {
  restanteMs: number;
  /** "09:42" */
  texto: string;
  expirou: boolean;
  /** Menos de 1 minuto: a tela destaca em vermelho. */
  urgente: boolean;
  /** Minutos inteiros restantes (para anunciar a leitores de tela só a cada minuto). */
  minutos: number;
}

/** Contagem regressiva até `expiraEm` (ISO), atualizada a cada segundo. */
export function useContagemRegressiva(expiraEm: string | undefined): Contagem {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!expiraEm) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiraEm]);

  const restanteMs = expiraEm ? Math.max(0, Date.parse(expiraEm) - agora) : 0;
  const totalSegundos = Math.ceil(restanteMs / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return {
    restanteMs,
    texto: `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`,
    expirou: expiraEm !== undefined && restanteMs <= 0,
    urgente: restanteMs > 0 && restanteMs < 60_000,
    minutos,
  };
}
