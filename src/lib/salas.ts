import type { PosicaoAssento } from '@/api/salas';
import type { MapaAssentos, SalaDetalhe } from '@/types';

/** "C-7": chave de um assento na prévia do editor. */
export function chaveAssento(fila: string, numero: number): string {
  return `${fila}-${numero}`;
}

export function posicaoDaChave(chave: string): PosicaoAssento {
  const [fila = '', numero = '0'] = chave.split('-');
  return { fila, numero: Number(numero) };
}

/** Filas A, B, C... (a API gera os mesmos nomes a partir de qtdFilas). */
export function nomesDeFilas(qtd: number): string[] {
  return Array.from({ length: qtd }, (_, i) => String.fromCharCode(65 + i));
}

/** id sintético da prévia: fila (índice) × 100 + número. */
function idPrevia(indiceFila: number, numero: number): number {
  return indiceFila * 100 + numero;
}

/** Prévia do mapa da sala, gerada na tela, no formato que o MapaAssentos desenha. */
export function montarPrevia(
  qtdFilas: number,
  assentosPorFila: number,
  pcd: ReadonlySet<string>,
  vip: ReadonlySet<string>,
): { filas: MapaAssentos['filas']; chavePorId: Map<number, string> } {
  const chavePorId = new Map<number, string>();
  const filas = nomesDeFilas(qtdFilas).map((fila, i) => ({
    fila,
    assentos: Array.from({ length: assentosPorFila }, (_, j) => {
      const numero = j + 1;
      const chave = chaveAssento(fila, numero);
      const assentoId = idPrevia(i, numero);
      chavePorId.set(assentoId, chave);
      return {
        assentoId,
        numero,
        tipo: vip.has(chave) ? ('VIP' as const) : pcd.has(chave) ? ('PCD' as const) : ('PADRAO' as const),
        status: 'LIVRE' as const,
        minhaReserva: false,
      };
    }),
  }));
  return { filas, chavePorId };
}

/** Lê a estrutura atual de uma sala da API (para preencher a edição). */
export function estruturaDaSala(sala: SalaDetalhe) {
  const pcd = new Set<string>();
  const vip = new Set<string>();
  let assentosPorFila = 0;
  for (const { fila, assentos } of sala.layout) {
    for (const a of assentos) {
      assentosPorFila = Math.max(assentosPorFila, a.numero);
      if (a.tipo === 'PCD') pcd.add(chaveAssento(fila, a.numero));
      if (a.tipo === 'VIP') vip.add(chaveAssento(fila, a.numero));
    }
  }
  return { qtdFilas: sala.layout.length, assentosPorFila, pcd, vip };
}

/** Mantém só as marcações que ainda cabem na grade (ao diminuir filas/assentos). */
export function dentroDaGrade(chaves: ReadonlySet<string>, qtdFilas: number, assentosPorFila: number): string[] {
  const filas = new Set(nomesDeFilas(qtdFilas));
  return [...chaves].filter((c) => {
    const { fila, numero } = posicaoDaChave(c);
    return filas.has(fila) && numero >= 1 && numero <= assentosPorFila;
  });
}

export function iguais(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((x) => b.has(x));
}
