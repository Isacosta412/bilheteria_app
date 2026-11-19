import { Pressable, StyleSheet, Text } from 'react-native';
import { formatarHora, formatarPreco, lugaresLivres } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
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
      accessibilityLabel={`Sessão das ${hora}, ${sessao.sala.nome}, ${preco}, ${livres}`}
      accessibilityState={{ disabled: esgotada }}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado, esgotada && estilos.esgotada]}
    >
      <Text style={estilos.hora}>{hora}</Text>
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
    minWidth: 136,
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
  hora: { ...tipografia.subtitulo, color: cores.texto },
  sala: { ...tipografia.legenda, color: cores.textoSecundario },
  preco: { ...tipografia.corpoForte, color: cores.texto, marginTop: espacos.xs },
  livres: { ...tipografia.legenda, color: cores.sucesso },
  livresEsgotada: { color: cores.erro },
});
