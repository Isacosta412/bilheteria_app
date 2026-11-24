import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarHora, formatarPreco, lugaresLivres } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import { ROTULO_FORMATO, ROTULO_IDIOMA, SIGLA_IDIOMA } from '@/lib/sessao';
import type { Sessao } from '@/types';

interface CardSessaoProps {
  sessao: Sessao;
  onPress: () => void;
}

/** Horário em destaque, sala, preço e lugares livres. Sessão esgotada fica desabilitada. */
export function CardSessao({ sessao, onPress }: CardSessaoProps) {
  const esgotada = sessao.assentosLivres <= 0;
  const hora = formatarHora(sessao.dataHora);
  const preco = formatarPreco(sessao.preco);
  const livres = lugaresLivres(sessao.assentosLivres);

  return (
    <Pressable
      onPress={onPress}
      disabled={esgotada}
      accessibilityRole="button"
      accessibilityLabel={`Sessão das ${hora}, ${ROTULO_FORMATO[sessao.formato]} ${ROTULO_IDIOMA[sessao.idioma].toLowerCase()}, ${sessao.sala.nome}, ${preco}, ${livres}`}
      accessibilityState={{ disabled: esgotada }}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado, esgotada && estilos.esgotada]}
    >
      <View style={estilos.topo}>
        <Text style={estilos.hora}>{hora}</Text>
        <View style={estilos.selos} aria-hidden>
          <Text style={[estilos.selo, sessao.formato === 'TRES_D' && estilos.selo3d]}>{ROTULO_FORMATO[sessao.formato]}</Text>
          <Text style={estilos.selo}>{SIGLA_IDIOMA[sessao.idioma]}</Text>
        </View>
      </View>
      <Text style={estilos.sala} numberOfLines={1}>
        {sessao.sala.nome}
      </Text>
      <Text style={estilos.preco}>{preco}</Text>
      <Text style={[estilos.livres, esgotada && estilos.livresEsgotada]}>{livres}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    minWidth: 150,
    minHeight: AREA_TOQUE_MINIMA,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    backgroundColor: cores.superficie,
    gap: 2,
  },
  pressionado: { borderColor: cores.primaria, backgroundColor: cores.superficieElevada },
  esgotada: { opacity: 0.55 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacos.sm },
  hora: { ...tipografia.subtitulo, color: cores.texto },
  selos: { flexDirection: 'row', gap: 4 },
  selo: {
    ...tipografia.legenda,
    fontWeight: '700',
    color: cores.texto,
    borderWidth: 1,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.sm,
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
  selo3d: { backgroundColor: cores.primaria, borderColor: cores.primaria, color: cores.sobrePrimaria },
  sala: { ...tipografia.legenda, color: cores.textoSecundario },
  preco: { ...tipografia.corpoForte, color: cores.texto, marginTop: espacos.xs },
  livres: { ...tipografia.legenda, color: cores.sucesso },
  livresEsgotada: { color: cores.erro },
});
