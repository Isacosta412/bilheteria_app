import { router, Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { CortinaProvider } from '@/components/CortinaPipoca';
import { LogoPipocou } from '@/components/LogoPipocou';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/contexts/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { cores, espacos, tipografia } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Tenta de novo só falhas de rede/servidor; um 404 ou 403 não muda numa segunda tentativa.
      retry: (tentativas, erro) => {
        const status = isAxiosError(erro) ? erro.response?.status : undefined;
        return tentativas < 1 && (status === undefined || status >= 500);
      },
    },
  },
});

/**
 * Proteção por papel: cada grupo confere o usuário no próprio _layout e redireciona quem não
 * pertence a ele para a tela inicial do seu papel (src/lib/rotas.ts):
 *   (publico)  → só sem login        → logado vai para "/" (cliente) ou "/balcao" (operador)
 *   (cliente)  → só CLIENTE          → sem login vai para "/login"; operador para "/balcao"
 *   (operador) → só OPERADOR         → sem login vai para "/login"; cliente para "/"
 * Assim, um cliente que digita /balcao na web volta para "/". A API recusa de qualquer jeito;
 * esta é a camada de interface.
 */
function Navegacao() {
  const { carregando } = useAuth();

  // Enquanto a sessão salva é restaurada, nenhuma rota é montada: um F5 numa URL protegida
  // não é desviado para o login antes de sabermos quem é o usuário.
  if (carregando) {
    return <Carregando telaCheia mensagem="Abrindo o Pipocou…" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="(publico)" />
      <Stack.Screen name="(cliente)" />
      <Stack.Screen name="(operador)" />
    </Stack>
  );
}

/**
 * Erro inesperado ao desenhar uma tela: mensagem amigável, sem stack trace nem texto técnico
 * (o Expo Router usa este export no lugar da tela de erro padrão).
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <View style={estilos.erro}>
        <LogoPipocou tamanho={64} comTexto={false} />
        <Text style={estilos.erroTitulo} accessibilityRole="header">
          Algo deu errado nesta tela
        </Text>
        <Text style={estilos.erroTexto}>Tente de novo. Se continuar, volte ao início.</Text>
        <Botao titulo="Tentar de novo" onPress={() => void retry()} />
        <Botao titulo="Voltar ao início" variante="texto" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  erro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.xl,
    gap: espacos.md,
  },
  erroTitulo: { ...tipografia.subtitulo, color: cores.texto, textAlign: 'center' },
  erroTexto: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center', maxWidth: 420 },
});

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <CortinaProvider>
              <StatusBar style="light" />
              <Navegacao />
            </CortinaProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
