import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { rotaInicial } from '@/lib/rotas';
import { cores } from '@/theme';

// As abas ficam embaixo de tudo: abrindo /filme/3 direto pela URL, o "voltar" leva para elas.
export const unstable_settings = {
  initialRouteName: '(abas)',
};

/**
 * Área do CLIENTE: sem login vai para /login; operador vai para /balcao.
 * Stack por fora (telas com cabeçalho e voltar: filme, sessão, checkout) e as abas por dentro.
 */
export default function LayoutCliente() {
  const { usuario } = useAuth();
  if (usuario?.papel !== 'CLIENTE') {
    return <Redirect href={rotaInicial(usuario)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.superficie },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="(abas)" options={{ headerShown: false }} />
      <Stack.Screen name="filme/[id]" options={{ title: 'Filme' }} />
      <Stack.Screen name="sessao/[id]" options={{ title: 'Escolha seus assentos' }} />
      <Stack.Screen name="checkout/[reservaId]" options={{ title: 'Pagamento' }} />
      <Stack.Screen name="ingressos/[codigo]" options={{ title: 'Ingresso' }} />
    </Stack>
  );
}
