import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'Informe o e-mail.' })
  .pipe(z.email({ message: 'E-mail inválido.' }));

const senha = z
  .string()
  .min(8, { message: 'A senha precisa ter pelo menos 8 caracteres.' })
  .max(72, { message: 'A senha pode ter no máximo 72 caracteres.' });

export const loginSchema = z.object({
  email,
  senha,
});
export type FormLogin = z.infer<typeof loginSchema>;

/** Cadastro: SEM campo de papel (a API sempre cria CLIENTE). */
export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, { message: 'Informe seu nome (mínimo 2 letras).' }).max(120),
    email,
    senha,
    confirmarSenha: z.string().min(1, { message: 'Repita a senha.' }),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem.',
  });
export type FormCadastro = z.infer<typeof cadastroSchema>;
