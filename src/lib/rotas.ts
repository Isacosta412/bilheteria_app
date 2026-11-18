import type { Href } from 'expo-router';
import type { Usuario } from '@/types';

/** Tela inicial de cada perfil: para onde o usuário é levado ao entrar ou ao abrir uma URL de outro perfil. */
export function rotaInicial(usuario: Usuario | null): Href {
  if (!usuario) return '/login';
  return usuario.papel === 'OPERADOR' ? '/balcao' : '/';
}
