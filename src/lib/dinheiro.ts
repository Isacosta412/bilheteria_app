/**
 * Converte o que o operador digitou em reais: "100", "100,5", "100,50", "1.234,56" ou "100.50".
 * Devolve null se não for um valor válido. Usado SÓ para calcular o troco na tela.
 */
export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, '');
  if (limpo === '') return null;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  return Number(normalizado);
}

/** Soma em centavos para não acumular erro de ponto flutuante. */
export function emCentavos(valor: number | string): number {
  return Math.round(Number(valor) * 100);
}
