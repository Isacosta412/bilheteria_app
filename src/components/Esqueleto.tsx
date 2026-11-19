import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { cores, espacos, raios } from '@/theme';

interface EsqueletoProps {
  largura?: DimensionValue;
  altura?: DimensionValue;
  estilo?: StyleProp<ViewStyle>;
}

/** Bloco pulsante que ocupa o lugar do conteúdo enquanto ele carrega. */
export function Esqueleto({ largura = '100%', altura = 16, estilo }: EsqueletoProps) {
  // useState com inicializador: um único Animated.Value por componente (compatível com o React Compiler).
  const [opacidade] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.9, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacidade, { toValue: 0.4, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    animacao.start();
    return () => animacao.stop();
  }, [opacidade]);

  return (
    <Animated.View
      style={[estilos.bloco, { width: largura, height: altura, opacity: opacidade }, estilo]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Esqueleto no formato do CardFilme. */
export function EsqueletoCardFilme() {
  return (
    <View style={estilos.card}>
      <Esqueleto altura="auto" estilo={estilos.poster} />
      <Esqueleto largura="85%" altura={16} />
      <Esqueleto largura="55%" altura={12} />
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { backgroundColor: cores.superficieElevada, borderRadius: raios.sm },
  card: { flex: 1, gap: espacos.sm, padding: espacos.xs },
  poster: { aspectRatio: 2 / 3, borderRadius: raios.md },
});
