import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { CINEMA } from '@/lib/cinema';
import { cores, espacos, tipografia } from '@/theme';

/** Linha com o endereço do cinema (📍 nome · local / rua, cidade). */
export function EnderecoCinema({ cor = cores.textoSecundario, estilo }: { cor?: string; estilo?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[estilos.raiz, estilo]}
      accessible
      accessibilityLabel={`Endereço: ${CINEMA.nome}, ${CINEMA.local}, ${CINEMA.endereco}, ${CINEMA.cidade}`}
    >
      <Text style={estilos.pino} aria-hidden>
        📍
      </Text>
      <View style={estilos.textos}>
        <Text style={[estilos.nome, { color: cor }]}>
          {CINEMA.nome} · {CINEMA.local}
        </Text>
        <Text style={[estilos.endereco, { color: cor }]}>
          {CINEMA.endereco} · {CINEMA.cidade}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flexDirection: 'row', alignItems: 'flex-start', gap: espacos.xs },
  pino: { fontSize: 14, lineHeight: 20 },
  textos: { flexShrink: 1 },
  nome: { ...tipografia.legenda, fontWeight: '700' },
  endereco: { ...tipografia.legenda },
});
