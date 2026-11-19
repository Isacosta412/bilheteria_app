import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ROTULO_CLASSIFICACAO, duracaoPorExtenso, formatarDuracao } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { Filme } from '@/types';
import { Poster } from './Poster';
import { SeloClassificacao } from './SeloClassificacao';

interface CardFilmeProps {
  filme: Filme;
  /** Ex.: "Próxima: 19:30" ou "3 sessões hoje". */
  destaque?: string;
  onPress: () => void;
}

export function CardFilme({ filme, destaque, onPress }: CardFilmeProps) {
  const rotulo = [
    filme.titulo,
    `classificação ${ROTULO_CLASSIFICACAO[filme.classificacao].extenso}`,
    duracaoPorExtenso(filme.duracaoMinutos),
    filme.genero,
    destaque,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint="Abre as sessões do filme"
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}
    >
      <Poster url={filme.posterUrl} titulo={filme.titulo} />
      <Text style={estilos.titulo} numberOfLines={2}>
        {filme.titulo}
      </Text>
      <View style={estilos.linha}>
        <SeloClassificacao classificacao={filme.classificacao} tamanho={22} />
        <Text style={estilos.meta} numberOfLines={1}>
          {formatarDuracao(filme.duracaoMinutos)} · {filme.genero}
        </Text>
      </View>
      {destaque !== undefined && (
        <Text style={estilos.destaque} numberOfLines={1}>
          {destaque}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: { flex: 1, gap: espacos.xs, padding: espacos.xs, borderRadius: raios.md },
  pressionado: { opacity: 0.8, backgroundColor: cores.superficie },
  titulo: { ...tipografia.corpoForte, color: cores.texto, marginTop: espacos.xs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  meta: { ...tipografia.legenda, color: cores.textoSecundario, flexShrink: 1 },
  destaque: { ...tipografia.legenda, color: cores.primaria, fontWeight: '600' },
});
