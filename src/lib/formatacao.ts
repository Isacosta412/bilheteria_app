import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Classificacao } from '@/types';

/**
 * Formatação em pt-BR (date-fns + Intl). Datas da API chegam em ISO (UTC) e são exibidas no
 * fuso do aparelho. "EEEEEE" é o dia da semana curto no ptBR do date-fns 4 ("ter").
 */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "ter, 24/11 · 19:30" */
export function formatarDiaHora(iso: string): string {
  return format(parseISO(iso), "EEEEEE, dd/MM '·' HH:mm", { locale: ptBR });
}

/** "24/11 19:12" */
export function formatarDataHoraCurta(iso: string): string {
  return format(parseISO(iso), 'dd/MM HH:mm', { locale: ptBR });
}

/** Código do ingresso em grupos de 4 para facilitar a digitação: "K7PX3MQ92A" → "K7PX 3MQ9 2A". */
export function formatarCodigo(codigo: string): string {
  return codigo.replace(/(.{4})(?=.)/g, '$1 ');
}

/** Código soletrado para leitores de tela: "K, 7, P, X, ...". */
export function soletrarCodigo(codigo: string): string {
  return codigo.split('').join(', ');
}

/** "19:30" */
export function formatarHora(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: ptBR });
}

/** "ter, 24/11" */
export function formatarDiaCurto(data: Date): string {
  return format(data, 'EEEEEE, dd/MM', { locale: ptBR });
}

/** "Hoje", "Amanhã" ou "qua, 26/11". */
export function rotuloDia(data: Date, hoje = new Date()): string {
  if (isSameDay(data, hoje)) return 'Hoje';
  if (isSameDay(data, addDays(hoje, 1))) return 'Amanhã';
  return formatarDiaCurto(data);
}

/** Dia AAAA-MM-DD na data local do aparelho (usado como filtro ?data=). */
export function diaIso(data: Date): string {
  return format(data, 'yyyy-MM-dd');
}

/** "30.00" → "R$ 30,00" */
export function formatarPreco(valor: string | number): string {
  return moeda.format(Number(valor));
}

/** 104 → "1h44"; 90 → "1h30"; 45 → "45 min" */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** "12 lugares livres", "1 lugar livre", "Esgotado" */
export function lugaresLivres(quantidade: number): string {
  if (quantidade <= 0) return 'Esgotado';
  return quantidade === 1 ? '1 lugar livre' : `${quantidade} lugares livres`;
}

/** Duração por extenso para leitores de tela: "1 hora e 44 minutos". */
export function duracaoPorExtenso(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const partes: string[] = [];
  if (h > 0) partes.push(h === 1 ? '1 hora' : `${h} horas`);
  if (m > 0) partes.push(m === 1 ? '1 minuto' : `${m} minutos`);
  return partes.join(' e ');
}

export const ROTULO_CLASSIFICACAO: Record<Classificacao, { sigla: string; extenso: string }> = {
  LIVRE: { sigla: 'L', extenso: 'livre para todos os públicos' },
  DEZ: { sigla: '10', extenso: 'não recomendado para menores de 10 anos' },
  DOZE: { sigla: '12', extenso: 'não recomendado para menores de 12 anos' },
  CATORZE: { sigla: '14', extenso: 'não recomendado para menores de 14 anos' },
  DEZESSEIS: { sigla: '16', extenso: 'não recomendado para menores de 16 anos' },
  DEZOITO: { sigla: '18', extenso: 'não recomendado para menores de 18 anos' },
};

/** "30.00" → "30%"; "42.50" → "42,5%" */
export function formatarPercentual(valor: string | number): string {
  return `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

/** plural(2, 'ingresso vendido', 'ingressos vendidos') → "2 ingressos vendidos" */
export function plural(quantidade: number, singular: string, varios: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

/** Primeiro número de um texto (ex.: a quantidade dentro de uma mensagem da API). */
export function primeiroNumero(texto: string | undefined): number | null {
  const m = /\d+/.exec(texto ?? '');
  return m ? Number(m[0]) : null;
}
