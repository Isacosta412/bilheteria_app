import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { DesenhoLogo } from '@/components/LogoPipocou';
import { cores, espacos } from '@/theme';

/** Largura de cada listra da faixa (px). */
const LISTRA = 14;

/**
 * Faixa listrada vermelho e branco, como o balde de pipoca. Decorativa.
 * Use no rodapé do cabeçalho, no topo de cartões e no ingresso.
 */
export function FaixaListrada({ altura = 5, estilo }: { altura?: number; estilo?: StyleProp<ViewStyle> }) {
  // 200 listras cobrem até 2800 px de largura; o excesso é cortado pelo overflow.
  return (
    <View style={[estilos.faixa, { height: altura }, estilo]} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: 200 }, (_, i) => (
        <View key={i} style={{ width: LISTRA, backgroundColor: i % 2 === 0 ? cores.vermelhoListra : cores.branco }} />
      ))}
    </View>
  );
}

/** Fundo do cabeçalho: vinho profundo com a faixa listrada embaixo e um fio amarelo. */
export function FundoCabecalho() {
  return (
    <View style={estilos.fundoCabecalho}>
      <View style={estilos.fioAmarelo} />
      <FaixaListrada altura={5} />
    </View>
  );
}

/** Título do cabeçalho com o balde do Pipocou à esquerda (telas principais das abas). */
export function TituloComLogo({ children }: { children: string }) {
  return (
    <View style={estilos.titulo}>
      <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <DesenhoLogo tamanho={30} />
      </View>
      <Text style={estilos.marca} aria-hidden>
        Pipocou
      </Text>
      <View style={estilos.separador} />
      <Text style={estilos.tituloTexto} accessibilityRole="header" numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

/** Balde pequeno no canto do cabeçalho das telas empilhadas (com voltar). */
export function LogoCabecalho() {
  return (
    <View style={estilos.logoCanto} accessible accessibilityRole="image" accessibilityLabel="Pipocou">
      <DesenhoLogo tamanho={28} />
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: { flexDirection: 'row', overflow: 'hidden', width: '100%' },
  fundoCabecalho: { flex: 1, backgroundColor: cores.barra, justifyContent: 'flex-end' },
  fioAmarelo: { height: 2, backgroundColor: cores.primaria },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  marca: { color: cores.primaria, fontWeight: '900', fontSize: 20, letterSpacing: 0.3 },
  separador: { width: 1, height: 18, backgroundColor: cores.bordaInterativa, marginHorizontal: espacos.xs },
  tituloTexto: { color: cores.branco, fontWeight: '700', fontSize: 17 },
  logoCanto: { paddingHorizontal: espacos.md },
});
