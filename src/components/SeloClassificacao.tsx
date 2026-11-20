import { StyleSheet, Text, View } from 'react-native';
import { ROTULO_CLASSIFICACAO } from '@/lib/formatacao';
import { cores } from '@/theme';
import type { Classificacao } from '@/types';

/**
 * Selo da classificação indicativa (cores do padrão brasileiro).
 * Contraste do texto sobre cada cor ≥ 5,4:1 (AA). O 18 tem borda clara para aparecer no fundo escuro.
 */
const ESTILO: Record<Classificacao, { fundo: string; texto: string }> = cores.classificacao;

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
  bordaClara: { borderWidth: 1, borderColor: cores.classificacao.bordaClara },
  texto: { fontWeight: '800' },
});
