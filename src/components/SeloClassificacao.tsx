import { StyleSheet, Text, View } from 'react-native';
import { ROTULO_CLASSIFICACAO } from '@/lib/formatacao';
import type { Classificacao } from '@/types';

/**
 * Selo da classificação indicativa (cores do padrão brasileiro).
 * Contraste do texto sobre cada cor ≥ 5,4:1 (AA). O 18 tem borda clara para aparecer no fundo escuro.
 */
const ESTILO: Record<Classificacao, { fundo: string; texto: string }> = {
  LIVRE: { fundo: '#0A7A3B', texto: '#FFFFFF' },
  DEZ: { fundo: '#0B69A3', texto: '#FFFFFF' },
  DOZE: { fundo: '#F2C94C', texto: '#14141A' },
  CATORZE: { fundo: '#E8790D', texto: '#14141A' },
  DEZESSEIS: { fundo: '#C8102E', texto: '#FFFFFF' },
  DEZOITO: { fundo: '#000000', texto: '#FFFFFF' },
};

export function SeloClassificacao({ classificacao, tamanho = 24 }: { classificacao: Classificacao; tamanho?: number }) {
  const { fundo, texto } = ESTILO[classificacao];
  const { sigla, extenso } = ROTULO_CLASSIFICACAO[classificacao];
  return (
    <View
      style={[
        estilos.selo,
        { backgroundColor: fundo, minWidth: tamanho, height: tamanho, borderRadius: tamanho / 5 },
        classificacao === 'DEZOITO' && estilos.bordaClara,
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Classificação: ${extenso}`}
    >
      <Text style={[estilos.texto, { color: texto, fontSize: tamanho * 0.5 }]}>{sigla}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bordaClara: { borderWidth: 1, borderColor: '#F4F4F6' },
  texto: { fontWeight: '800' },
});
