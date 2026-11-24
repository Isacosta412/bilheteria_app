import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarPreco } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

interface SeletorTipoIngressoProps {
  /** Quantidade de assentos da reserva (inteiras + meias). */
  quantidade: number;
  meias: number;
  precoInteira: string;
  precoMeia: string;
  aoMudarMeias: (meias: number) => void;
  desabilitado?: boolean;
}

/**
 * Inteira × meia-entrada: os dois contadores sempre somam a quantidade de assentos escolhidos.
 * Aumentar a meia diminui a inteira e vice-versa.
 */
export function SeletorTipoIngresso({
  quantidade,
  meias,
  precoInteira,
  precoMeia,
  aoMudarMeias,
  desabilitado = false,
}: SeletorTipoIngressoProps) {
  const inteiras = quantidade - meias;
  const linhas = [
    {
      chave: 'inteira',
      titulo: 'Inteira',
      descricao: formatarPreco(precoInteira),
      valor: inteiras,
      menos: () => aoMudarMeias(meias + 1),
      mais: () => aoMudarMeias(meias - 1),
    },
    {
      chave: 'meia',
      titulo: 'Meia-entrada',
      descricao: `${formatarPreco(precoMeia)} · estudante, idoso, PCD`,
      valor: meias,
      menos: () => aoMudarMeias(meias - 1),
      mais: () => aoMudarMeias(meias + 1),
    },
  ];

  return (
    <View style={estilos.raiz}>
      {linhas.map((l) => (
        <View key={l.chave} style={estilos.linha}>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>{l.titulo}</Text>
            <Text style={estilos.descricao}>{l.descricao}</Text>
          </View>
          <View style={estilos.contador}>
            <BotaoContador
              simbolo="−"
              rotulo={`Menos ${l.titulo.toLowerCase()}`}
              onPress={l.menos}
              desabilitado={desabilitado || l.valor <= 0}
            />
            <Text style={estilos.valor} accessibilityLabel={`${l.valor} ${l.titulo.toLowerCase()}`} accessibilityLiveRegion="polite">
              {l.valor}
            </Text>
            <BotaoContador
              simbolo="+"
              rotulo={`Mais ${l.titulo.toLowerCase()}`}
              onPress={l.mais}
              desabilitado={desabilitado || l.valor >= quantidade}
            />
          </View>
        </View>
      ))}
      <Text style={estilos.aviso}>Quem compra meia-entrada apresenta o documento na entrada da sala.</Text>
    </View>
  );
}

function BotaoContador({
  simbolo,
  rotulo,
  onPress,
  desabilitado,
}: {
  simbolo: string;
  rotulo: string;
  onPress: () => void;
  desabilitado: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [estilos.botao, pressed && estilos.botaoPressionado, desabilitado && estilos.botaoDesabilitado]}
    >
      <Text style={estilos.simbolo}>{simbolo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  raiz: { gap: espacos.sm },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacos.md },
  textos: { flex: 1 },
  titulo: { ...tipografia.corpoForte, color: cores.texto },
  descricao: { ...tipografia.legenda, color: cores.textoSecundario },
  contador: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  botao: {
    width: AREA_TOQUE_MINIMA,
    height: AREA_TOQUE_MINIMA,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPressionado: { backgroundColor: cores.superficieElevada, borderColor: cores.primaria },
  botaoDesabilitado: { opacity: 0.35 },
  simbolo: { fontSize: 22, lineHeight: 24, fontWeight: '700', color: cores.texto },
  valor: { ...tipografia.subtitulo, color: cores.texto, minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] },
  aviso: { ...tipografia.legenda, color: cores.textoSecundario, marginTop: espacos.xs },
});
