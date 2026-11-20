import type { Href } from 'expo-router';
import type { Usuario } from '@/types';

/** Tela inicial de cada perfil: para onde o usuário é levado ao entrar ou ao abrir uma URL de outro perfil. */
export function rotaInicial(usuario: Usuario | null): Href {
  if (!usuario) return '/login';
  return usuario.papel === 'OPERADOR' ? '/balcao' : '/';
}

/** Depois de salvar um formulário: volta para a tela anterior ou, se a página foi aberta direto pela URL, vai para a lista. */
export function voltarOuIr(router: { canGoBack: () => boolean; back: () => void; replace: (href: Href) => void }, lista: Href): void {
  if (router.canGoBack()) router.back();
  else router.replace(lista);
}
