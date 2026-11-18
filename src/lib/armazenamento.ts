import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento de dados sensíveis (token) atrás de uma interface única:
 *  - celular: expo-secure-store (Keychain no iOS, Keystore no Android);
 *  - web: localStorage (o navegador não tem um cofre equivalente).
 * Todos os métodos são assíncronos e nunca lançam: uma falha de leitura vira `null`.
 */
export interface Armazenamento {
  obter(chave: string): Promise<string | null>;
  salvar(chave: string, valor: string): Promise<void>;
  remover(chave: string): Promise<void>;
}

const web: Armazenamento = {
  async obter(chave) {
    try {
      return globalThis.localStorage?.getItem(chave) ?? null;
    } catch {
      // modo privado / armazenamento bloqueado
      return null;
    }
  },
  async salvar(chave, valor) {
    try {
      globalThis.localStorage?.setItem(chave, valor);
    } catch {
      // sem armazenamento: a sessão dura até fechar a aba
    }
  },
  async remover(chave) {
    try {
      globalThis.localStorage?.removeItem(chave);
    } catch {
      // nada a remover
    }
  },
};

const nativo: Armazenamento = {
  async obter(chave) {
    try {
      return await SecureStore.getItemAsync(chave);
    } catch {
      return null;
    }
  },
  async salvar(chave, valor) {
    await SecureStore.setItemAsync(chave, valor);
  },
  async remover(chave) {
    try {
      await SecureStore.deleteItemAsync(chave);
    } catch {
      // já removido
    }
  },
};

export const armazenamento: Armazenamento = Platform.OS === 'web' ? web : nativo;
