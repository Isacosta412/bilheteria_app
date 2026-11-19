import { useEffect, useState } from 'react';

/** Devolve `valor` só depois de `atraso` ms sem mudanças (ex.: busca enquanto digita). */
export function useDebounce<T>(valor: T, atraso = 300): T {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setAtrasado(valor), atraso);
    return () => clearTimeout(id);
  }, [valor, atraso]);
  return atrasado;
}
