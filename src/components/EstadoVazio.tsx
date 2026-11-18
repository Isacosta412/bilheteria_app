import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';
import { Botao } from './Botao';

interface EstadoVazioProps {
  titulo: string;
  descricao?: string;
  /** Emoji/símbolo decorativo (ignorado por leitores de tela). */
  icone?: string;
  acao?: { titulo: string; onPress: () => void };
}

export function EstadoVazio({ titulo, descricao, icone = '🎬', acao }: EstadoVazioProps) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.icone} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
        {icone}
      </Text>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {descricao !== undefined && <Text style={estilos.descricao}>{descricao}</Text>}
      {acao !== undefined && <Botao titulo={acao.titulo} onPress={acao.onPress} variante="secundaria" estilo={estilos.acao} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: espacos.xxl, gap: espacos.sm },
  icone: { fontSize: 44, marginBottom: espacos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.texto, textAlign: 'center' },
  descricao: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center', maxWidth: 420 },
  acao: { marginTop: espacos.lg },
});
