import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Polygon } from 'react-native-svg';
import { cores, espacos } from '@/theme';

/**
 * Geometria do balde (viewBox 64×64). O mesmo desenho está em assets/icon-pipocou.svg,
 * que gera os ícones do app e o favicon (scripts/gerar-icones.mjs).
 */
const BALDE = '13,29 51,29 45,59 19,59';
const LISTRAS = ['13,29 20.6,29 24.2,59 19,59', '28.2,29 35.8,29 34.6,59 29.4,59', '43.4,29 51,29 45,59 39.8,59'];
const BORDA = '11,26 53,26 52.2,31 11.8,31';
/** Pipocas [cx, cy, r], desenhadas de trás para a frente (a sombra amarela separa uma da outra). */
export const PIPOCAS_LOGO: readonly (readonly [number, number, number])[] = [
  [15, 22, 5],
  [49, 22, 5],
  [22, 17, 6],
  [42, 16, 6],
  [32, 12, 6.5],
  [27, 22, 6],
  [37, 21, 6],
  [19, 25, 4.5],
  [45, 25, 4.5],
  [32, 25, 5],
];

export function DesenhoLogo({ tamanho }: { tamanho: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
      <G>
        {PIPOCAS_LOGO.map(([cx, cy, r]) => (
          <G key={`${cx}-${cy}`}>
            <Circle cx={cx + 1.2} cy={cy + 1.2} r={r} fill={cores.pipoca.sombra} />
            <Circle cx={cx} cy={cy} r={r} fill={cores.pipoca.corpo} />
          </G>
        ))}
        <Polygon points={BALDE} fill={cores.pipoca.corpo} />
        {LISTRAS.map((p) => (
          <Polygon key={p} points={p} fill={cores.destaque} />
        ))}
        <Polygon points={BORDA} fill={cores.primaria} />
      </G>
    </Svg>
  );
}

interface LogoPipocouProps {
  tamanho?: number;
  /** Mostra o nome "Pipocou" abaixo do balde. */
  comTexto?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

/** Marca do Pipocou: balde de pipoca (+ nome). Decorativo para o leitor de tela, que lê só o nome. */
export function LogoPipocou({ tamanho = 72, comTexto = true, estilo }: LogoPipocouProps) {
  return (
    <View style={[estilos.container, estilo]} accessible accessibilityRole="image" accessibilityLabel="Pipocou">
      <View aria-hidden importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <DesenhoLogo tamanho={tamanho} />
      </View>
      {comTexto && (
        <Text style={[estilos.nome, { fontSize: Math.max(22, tamanho * 0.42) }]} aria-hidden>
          Pipocou
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', gap: espacos.xs },
  nome: { color: cores.primaria, fontWeight: '900', letterSpacing: 0.5 },
});
