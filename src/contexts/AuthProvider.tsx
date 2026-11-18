import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { definirAoExpirarSessao, definirToken } from '@/api/client';
import { armazenamento } from '@/lib/armazenamento';
import type { Usuario } from '@/types';

const CHAVE_TOKEN = 'bilheteria.token';

export interface ValorAuth {
  usuario: Usuario | null;
  /** true enquanto a sessão salva está sendo restaurada ao abrir o app. */
  carregando: boolean;
  entrar(email: string, senha: string): Promise<void>;
  /** Cria a conta (sempre CLIENTE) e já entra. */
  cadastrar(dados: authApi.DadosCadastro): Promise<void>;
  sair(): Promise<void>;
}

export const AuthContext = createContext<ValorAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const queryClient = useQueryClient();

  /** Apaga o token (memória + armazenamento), o usuário e o cache de dados. */
  const limparSessao = useCallback(async () => {
    definirToken(null);
    await armazenamento.remover(CHAVE_TOKEN);
    setUsuario(null);
    queryClient.clear();
  }, [queryClient]);

  // 401 em qualquer chamada → sessão expirada. Com o usuário nulo, o layout leva ao login.
  useEffect(() => {
    definirAoExpirarSessao(() => {
      void limparSessao();
    });
    return () => definirAoExpirarSessao(null);
  }, [limparSessao]);

  // Ao abrir o app: restaura a sessão salva perguntando à API quem é o dono do token.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const token = await armazenamento.obter(CHAVE_TOKEN);
        if (!token) return;
        definirToken(token);
        const atual = await authApi.me();
        if (ativo) setUsuario(atual);
      } catch (e) {
        if (!ativo) return;
        if (isAxiosError(e) && !e.response) {
          // Sem conexão: mantém o token salvo para tentar de novo na próxima abertura.
          definirToken(null);
        } else {
          await limparSessao();
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [limparSessao]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const { token, usuario: logado } = await authApi.login(email, senha);
      await armazenamento.salvar(CHAVE_TOKEN, token);
      definirToken(token);
      queryClient.clear();
      setUsuario(logado);
    },
    [queryClient],
  );

  const cadastrar = useCallback(
    async (dados: authApi.DadosCadastro) => {
      await authApi.registrar(dados);
      await entrar(dados.email, dados.senha);
    },
    [entrar],
  );

  const valor = useMemo<ValorAuth>(
    () => ({ usuario, carregando, entrar, cadastrar, sair: limparSessao }),
    [usuario, carregando, entrar, cadastrar, limparSessao],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
