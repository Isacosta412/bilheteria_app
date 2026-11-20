import { z } from 'zod';

export const MAX_FILAS = 26;
export const MAX_ASSENTOS_POR_FILA = 40;

const inteiro = (rotulo: string, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, { message: `Informe ${rotulo} (só números).` })
    .refine((v) => Number(v) >= 1 && Number(v) <= max, { message: `Use de 1 a ${max}.` });

export const salaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: 'Informe o nome da sala.' })
    .max(60, { message: 'Use no máximo 60 caracteres.' }),
  qtdFilas: inteiro('a quantidade de filas', MAX_FILAS),
  assentosPorFila: inteiro('os assentos por fila', MAX_ASSENTOS_POR_FILA),
});
export type FormSala = z.infer<typeof salaSchema>;
