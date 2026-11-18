import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { rotaInicial } from '@/lib/rotas';
import { cores } from '@/theme';

/** Telas públicas: quem já está logado é levado para a área do seu papel. */
export default function LayoutPublico() {
  const { usuario } = useAuth();
  if (usuario) {
    return <Redirect href={rotaInicial(usuario)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
    </Stack>
  );
}
