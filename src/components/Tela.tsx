import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { LARGURA_MAXIMA, cores, espacos } from '@/theme';

interface TelaProps {
  children: ReactNode;
  /** Envolve o conteúdo em ScrollView (padrão: true). Use false em telas com FlatList. */
  rolavel?: boolean;
  /** Centraliza o conteúdo verticalmente (ex.: login). */
  centralizar?: boolean;
  /** Bordas seguras a respeitar. Dentro de Tabs/Stack com cabeçalho, o topo já é tratado. */
  bordas?: Edge[];
  estiloConteudo?: StyleProp<ViewStyle>;
}

/** Container padrão das telas: área segura, fundo do tema e largura máxima centralizada na web. */
export function Tela({ children, rolavel = true, centralizar = false, bordas = ['left', 'right', 'bottom'], estiloConteudo }: TelaProps) {
  const conteudo = <View style={[estilos.conteudo, centralizar && estilos.centralizado, estiloConteudo]}>{children}</View>;

  return (
    <SafeAreaView style={estilos.raiz} edges={bordas}>
      <KeyboardAvoidingView style={estilos.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {rolavel ? (
          <ScrollView
            contentContainerStyle={[estilos.rolagem, centralizar && estilos.rolagemCentralizada]}
            keyboardShouldPersistTaps="handled"
          >
            {conteudo}
          </ScrollView>
        ) : (
          conteudo
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1 },
  rolagemCentralizada: { justifyContent: 'center' },
  conteudo: {
    flex: 1,
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    padding: espacos.lg,
  },
  centralizado: { flex: 0, justifyContent: 'center' },
});
