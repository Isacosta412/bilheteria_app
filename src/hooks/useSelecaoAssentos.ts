import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MENSAGENS_ERRO } from '@/api/erros';
import { MAX_SELECAO_PADRAO } from '@/components/MapaAssentos';
import { useToast } from '@/components/Toast';
import type { MapaAssentos } from '@/types';

/** Ordem natural das etiquetas: A2 antes de A10, A antes de AA. */
function compararRotulos(a: string, b: string): number {
  return a.length - b.length || a.localeCompare(b, 'pt-BR', { numeric: true });
}

/**
 * Seleção de assentos compartilhada pelo cliente (sessao/[id]) e pelo balcão.
 *
 * "escolhidos" é o que a pessoa tocou; a seleção EFETIVA só mantém os que continuam LIVRES no
 * mapa mais recente (que se atualiza a cada 5 s). Quando um escolhido deixa de estar livre,
 * avisa uma vez com um toast. `marcarConflito()` (depois de um 409) troca o aviso pela
 * mensagem do CLAUDE.md: "Ops! Alguém acabou de escolher um desses assentos".
 */
export function useSelecaoAssentos(mapa: MapaAssentos | undefined, maxSelecao = MAX_SELECAO_PADRAO) {
  const toast = useToast();
  const [escolhidos, setEscolhidos] = useState<number[]>([]);

  const { livres, rotulos } = useMemo(() => {
    const livresSet = new Set<number>();
    const rotulosMap = new Map<number, string>();
    for (const { fila, assentos } of mapa?.filas ?? []) {
      for (const a of assentos) {
        rotulosMap.set(a.assentoId, `${fila}${a.numero}`);
        if (a.status === 'LIVRE') livresSet.add(a.assentoId);
      }
    }
    return { livres: livresSet, rotulos: rotulosMap };
  }, [mapa]);

  const selecionados = useMemo(
    () => (mapa ? escolhidos.filter((id) => livres.has(id)) : escolhidos),
    [mapa, escolhidos, livres],
  );
  const perdidos = useMemo(
    () => (mapa ? escolhidos.filter((id) => !livres.has(id)) : []),
    [mapa, escolhidos, livres],
  );

  // Avisa UMA vez quando um assento escolhido deixa de estar livre (outra pessoa pegou).
  const avisados = useRef(new Set<number>());
  const conflitoRecente = useRef(false);
  const chavePerdidos = perdidos.join(',');
  useEffect(() => {
    const novos = perdidos.filter((id) => !avisados.current.has(id));
    if (novos.length === 0) return;
    novos.forEach((id) => avisados.current.add(id));
    const nomes = novos.map((id) => rotulos.get(id) ?? '?').join(', ');
    const restam = selecionados.length > 0 ? ' Os demais continuam selecionados.' : '';
    toast.mostrar(
      conflitoRecente.current
        ? `${MENSAGENS_ERRO.ASSENTO_INDISPONIVEL} (${nomes})${restam}`
        : novos.length === 1
          ? `O assento ${nomes} acabou de ser reservado por outra pessoa.`
          : `Os assentos ${nomes} acabaram de ser reservados por outra pessoa.`,
      'aviso',
    );
    conflitoRecente.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispara só quando o conjunto de perdidos muda
  }, [chavePerdidos]);

  const alternar = useCallback(
    (assentoId: number) => {
      const jaSelecionado = selecionados.includes(assentoId);
      if (!jaSelecionado && selecionados.length >= maxSelecao) {
        toast.mostrar(`Você pode escolher no máximo ${maxSelecao} assentos por vez.`, 'info');
        return;
      }
      avisados.current.delete(assentoId);
      setEscolhidos(jaSelecionado ? selecionados.filter((id) => id !== assentoId) : [...selecionados, assentoId]);
    },
    [selecionados, toast, maxSelecao],
  );

  const limpar = useCallback(() => {
    avisados.current.clear();
    setEscolhidos([]);
  }, []);

  /** Chamar ao receber 409 ASSENTO_INDISPONIVEL, antes de recarregar o mapa. */
  const marcarConflito = useCallback(() => {
    conflitoRecente.current = true;
  }, []);

  const nomesSelecionados = useMemo(
    () => selecionados.map((id) => rotulos.get(id) ?? '').sort(compararRotulos).join(', '),
    [selecionados, rotulos],
  );

  return { selecionados, nomesSelecionados, alternar, limpar, marcarConflito, rotulos };
}
