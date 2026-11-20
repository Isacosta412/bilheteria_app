import axios, { AxiosError, isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ErroApi } from '@/types';
import { MENSAGEM_GENERICA, MENSAGEM_SEM_CONEXAO, MENSAGEM_TEMPO_ESGOTADO, MENSAGENS_ERRO } from './erros';

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL && __DEV__) {
  console.warn('EXPO_PUBLIC_API_URL não definida: crie o .env a partir do .env.example.');
}

// eslint-disable-next-line import/no-named-as-default-member -- `create` é usado pela instância padrão, como na documentação do axios
export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token em memória (o AuthProvider carrega do armazenamento e atualiza aqui) ─
let tokenAtual: string | null = null;

export function definirToken(token: string | null): void {
  tokenAtual = token;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (tokenAtual) {
    config.headers.set('Authorization', `Bearer ${tokenAtual}`);
  }
  return config;
});

// ─── 401 → sessão expirada: o AuthProvider faz logout e o layout manda para o login ─
let aoExpirarSessao: (() => void) | null = null;

export function definirAoExpirarSessao(callback: (() => void) | null): void {
  aoExpirarSessao = callback;
}

/** Nessas rotas, 401 significa "credenciais erradas", não "sessão expirada". */
const ROTAS_SEM_LOGOUT = ['/auth/login', '/auth/registrar'];

api.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => {
    if (isAxiosError(erro) && erro.response?.status === 401) {
      const url = erro.config?.url ?? '';
      if (tokenAtual && !ROTAS_SEM_LOGOUT.some((rota) => url.endsWith(rota))) {
        aoExpirarSessao?.();
      }
    }
    return Promise.reject(erro);
  },
);

// ─── Tradução de erros para o usuário ────────────────────────────────────────
function corpoDeErro(e: unknown): ErroApi['erro'] | undefined {
  if (!isAxiosError(e)) return undefined;
  const dados: unknown = e.response?.data;
  if (typeof dados === 'object' && dados !== null && 'erro' in dados) {
    const { erro } = dados as ErroApi;
    if (typeof erro?.codigo === 'string' && typeof erro.mensagem === 'string') return erro;
  }
  return undefined;
}

/** `detalhes` do erro da API (ex.: { utilizadoEm } no INGRESSO_JA_UTILIZADO), se houver. */
export function detalhesDoErro(e: unknown): unknown {
  return corpoDeErro(e)?.detalhes;
}

/** Mensagem original da API (já em pt-BR), para quando ela é mais específica que o dicionário. */
export function mensagemDaApi(e: unknown): string | undefined {
  return corpoDeErro(e)?.mensagem;
}

/** Código de erro da API (ex.: "ASSENTO_INDISPONIVEL"), se houver. */
export function codigoDoErro(e: unknown): string | undefined {
  return corpoDeErro(e)?.codigo;
}

/**
 * Converte qualquer erro em uma mensagem amigável em pt-BR.
 * Nunca devolve JSON, status HTTP ou stack trace.
 */
export function traduzirErro(e: unknown): string {
  if (isAxiosError(e)) {
    if (e.code === AxiosError.ECONNABORTED || e.code === AxiosError.ETIMEDOUT) return MENSAGEM_TEMPO_ESGOTADO;
    if (!e.response) return MENSAGEM_SEM_CONEXAO;

    const corpo = corpoDeErro(e);
    if (corpo) {
      const conhecida = MENSAGENS_ERRO[corpo.codigo];
      if (conhecida) return conhecida;
      // Código novo ainda sem tradução: as mensagens 4xx da API já são em português e amigáveis.
      if (e.response.status < 500) return corpo.mensagem;
    }
  }
  return MENSAGEM_GENERICA;
}

/**
 * Erros por campo de um 400 DADOS_INVALIDOS ({ campo, mensagem }[] em `detalhes`),
 * para marcar o campo certo no formulário com setError.
 */
export function errosDeCampo(e: unknown): Record<string, string> {
  const corpo = corpoDeErro(e);
  if (corpo?.codigo !== 'DADOS_INVALIDOS' || !Array.isArray(corpo.detalhes)) return {};

  const resultado: Record<string, string> = {};
  for (const item of corpo.detalhes as unknown[]) {
    if (typeof item === 'object' && item !== null && 'campo' in item && 'mensagem' in item) {
      const { campo, mensagem } = item as { campo: unknown; mensagem: unknown };
      if (typeof campo === 'string' && typeof mensagem === 'string' && !(campo in resultado)) {
        resultado[campo] = mensagem;
      }
    }
  }
  return resultado;
}
