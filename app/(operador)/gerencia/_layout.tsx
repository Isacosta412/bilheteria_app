import { Stack } from 'expo-router';
import { Botao } from '@/components/Botao';
import { useAuth } from '@/hooks/useAuth';
import { TituloComLogo } from '@/components/Cabecalho';
import { cores } from '@/theme';
import { opcoesCabecalho } from '@/theme/navegacao';

// Abrindo /gerencia/filmes direto pela URL, o "voltar" leva para o hub.
export const unstable_settings = {
  initialRouteName: 'index',
};

/** Gerência: hub + listas e formulários empilhados (com voltar). A checagem de papel fica no layout do operador. */
export default function LayoutGerencia() {
  const { sair } = useAuth();
  return (
    <Stack
      screenOptions={{
        ...opcoesCabecalho,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Gerência',
          headerTitle: ({ children }) => <TituloComLogo>{children}</TituloComLogo>,
          headerTitleAlign: 'left',
          headerRight: () => <Botao titulo="Sair" variante="texto" onPress={() => void sair()} accessibilityLabel="Sair da conta" />,
        }}
      />
      <Stack.Screen name="filmes/index" options={{ title: 'Filmes' }} />
      <Stack.Screen name="filmes/[id]" options={{ title: 'Filme' }} />
      <Stack.Screen name="salas/index" options={{ title: 'Salas' }} />
      <Stack.Screen name="salas/[id]" options={{ title: 'Sala' }} />
      <Stack.Screen name="sessoes/index" options={{ title: 'Sessões' }} />
      <Stack.Screen name="sessoes/nova" options={{ title: 'Nova sessão' }} />
    </Stack>
  );
}
