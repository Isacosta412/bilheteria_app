import { z } from 'zod';
import { reaisDaMascara } from '@/lib/dinheiro';

export const sessaoSchema = z.object({
  filmeId: z
    .number()
    .nullable()
    .refine((v): boolean => v !== null, { message: 'Escolha o filme.' }),
  salaId: z
    .number()
    .nullable()
    .refine((v): boolean => v !== null, { message: 'Escolha a sala.' }),
  dataHora: z
    .date({ message: 'Informe uma data e hora válidas.' })
    .nullable()
    .refine((v): boolean => v !== null, { message: 'Informe a data e a hora.' })
    .refine((v) => v === null || v.getTime() > Date.now(), { message: 'Escolha uma data e hora no futuro.' }),
  preco: z.string().refine((v) => (reaisDaMascara(v) ?? 0) > 0, { message: 'Informe o preço do ingresso.' }),
});
export type FormSessao = z.infer<typeof sessaoSchema>;
