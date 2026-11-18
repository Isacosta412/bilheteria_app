import { Text } from 'react-native';

/** Ícone simples (emoji) para as abas, oculto para leitores de tela: o rótulo da aba já descreve. */
export function IconeAba({ simbolo, focado }: { simbolo: string; focado: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focado ? 1 : 0.6 }} accessibilityElementsHidden importantForAccessibility="no" aria-hidden>
      {simbolo}
    </Text>
  );
}
