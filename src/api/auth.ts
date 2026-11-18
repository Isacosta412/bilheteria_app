import type { RespostaLogin, Usuario } from '@/types';
import { api } from './client';

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export async function login(email: string, senha: string): Promise<RespostaLogin> {
  const { data } = await api.post<RespostaLogin>('/auth/login', { email, senha });
  return data;
}

/** Cadastro público: o papel é sempre CLIENTE (definido pela API, nunca enviado). */
export async function registrar(dados: DadosCadastro): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/registrar', dados);
  return data;
}

export async function me(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}
