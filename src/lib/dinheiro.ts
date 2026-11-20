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

/**
 * Máscara de preço digitado da direita para a esquerda (como na maquininha):
 * "2490" → "R$ 24,90". Só os dígitos contam; no máximo 7 (R$ 99.999,99).
 */
export function mascararReais(texto: string): string {
  const digitos = texto.replace(/\D/g, '').replace(/^0+/, '').slice(0, 7);
  if (digitos === '') return '';
  const centavos = Number(digitos);
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** "R$ 24,90" → 24.9 (null se vazio). */
export function reaisDaMascara(texto: string): number | null {
  const digitos = texto.replace(/\D/g, '');
  return digitos === '' ? null : Number(digitos) / 100;
}
