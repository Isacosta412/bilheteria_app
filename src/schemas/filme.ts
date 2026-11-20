import { z } from 'zod';
import type { Classificacao } from '@/types';

/** Mesmo limite da API (DURACAO_MAXIMA_MINUTOS). */
export const DURACAO_MAXIMA = 600;

export const CLASSIFICACOES: Classificacao[] = ['LIVRE', 'DEZ', 'DOZE', 'CATORZE', 'DEZESSEIS', 'DEZOITO'];

const texto = (rotulo: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, { message: `Informe ${rotulo}.` })
    .max(max, { message: `Use no máximo ${max} caracteres.` });

/** Formulário de filme: os campos são texto (como no input) e viram número no envio. */
export const filmeSchema = z.object({
  titulo: texto('o título', 200),
  sinopse: texto('a sinopse', 5000),
  duracaoMinutos: z
    .string()
    .trim()
    .regex(/^\d+$/, { message: 'Informe a duração em minutos (só números).' })
    .refine((v) => Number(v) >= 1 && Number(v) <= DURACAO_MAXIMA, {
      message: `A duração vai de 1 a ${DURACAO_MAXIMA} minutos.`,
    }),
  classificacao: z.enum(CLASSIFICACOES, { message: 'Escolha a classificação.' }),
  genero: texto('o gênero', 60),
  posterUrl: z
    .string()
    .trim()
    .max(500, { message: 'Use no máximo 500 caracteres.' })
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), { message: 'Informe um endereço que comece com http:// ou https://' }),
});
export type FormFilme = z.infer<typeof filmeSchema>;
