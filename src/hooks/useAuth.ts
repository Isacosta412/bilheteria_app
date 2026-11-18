import { useContext } from 'react';
import { AuthContext, type ValorAuth } from '@/contexts/AuthProvider';

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContext);
  if (!valor) {
    throw new Error('useAuth() precisa estar dentro do <AuthProvider> (veja app/_layout.tsx).');
  }
  return valor;
}
