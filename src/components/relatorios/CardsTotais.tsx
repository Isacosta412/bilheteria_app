import { StyleSheet, Text, View } from 'react-native';
import { formatarPercentual, formatarPreco } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { RelatorioSessoes } from '@/types';

/** Números de destaque do período (stat tiles: um número por cartão, sem gráfico). */
export function CardsTotais({ totais }: { totais: RelatorioSessoes['totais'] }) {
  const cartoes = [
    {
      rotulo: 'Ingressos vendidos',
      valor: totais.ingressosVendidos.toLocaleString('pt-BR'),
      detalhe: `${totais.quantidadeSessoes} ${totais.quantidadeSessoes === 1 ? 'sessão' : 'sessões'} no período`,
    },
    { rotulo: 'Receita', valor: formatarPreco(totais.receitaTotal), detalhe: 'Ingressos pagos' },
    {
      rotulo: 'Ocupação média',
      valor: formatarPercentual(totais.ocupacaoMediaPonderada),
      detalhe: `${totais.ingressosVendidos} de ${totais.capacidadeTotal} lugares`,
    },
  ];
  return (
    <View style={estilos.grade}>
      {cartoes.map((c) => (
        <View key={c.rotulo} style={estilos.cartao} accessible accessibilityLabel={`${c.rotulo}: ${c.valor}. ${c.detalhe}`}>
          <Text style={estilos.rotulo}>{c.rotulo}</Text>
          <Text style={estilos.valor}>{c.valor}</Text>
          <Text style={estilos.detalhe}>{c.detalhe}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.md },
  cartao: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.xxs,
  },
  rotulo: { ...tipografia.legenda, color: cores.textoSecundario, fontWeight: '600' },
  valor: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: cores.texto, fontVariant: ['tabular-nums'] },
  detalhe: { ...tipografia.legenda, color: cores.textoSecundario },
});
