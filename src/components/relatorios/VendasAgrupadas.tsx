import { StyleSheet, Text, View } from 'react-native';
import { formatarPreco } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { RelatorioVendas } from '@/types';

const ROTULO_METODO: Record<string, string> = { DINHEIRO: 'Dinheiro', CARTAO: 'Cartão', PIX: 'PIX' };

/** Legenda App × Balcão: cor + texto (nunca só cor). */
function Legenda() {
  return (
    <View style={estilos.legenda} accessibilityRole="summary" accessibilityLabel="Legenda: azul App, laranja Balcão">
      <View style={estilos.itemLegenda}>
        <View style={[estilos.quadrado, { backgroundColor: cores.grafico.app }]} />
        <Text style={estilos.textoLegenda}>App</Text>
      </View>
      <View style={estilos.itemLegenda}>
        <View style={[estilos.quadrado, { backgroundColor: cores.grafico.balcao }]} />
        <Text style={estilos.textoLegenda}>Balcão</Text>
      </View>
    </View>
  );
}

/**
 * Vendas por dia / filme / método: ingressos e receita, com a divisão App × Balcão
 * em uma barra empilhada (comprimento = ingressos do grupo em relação ao maior grupo).
 */
export function VendasAgrupadas({ relatorio }: { relatorio: RelatorioVendas }) {
  const maior = Math.max(1, ...relatorio.grupos.map((g) => g.ingressos));
  const { totais } = relatorio;

  return (
    <View style={estilos.container}>
      <Legenda />
      <Text style={estilos.resumo}>
        Total: {totais.ingressos} ingressos · {formatarPreco(totais.receita)} · App {totais.app.ingressos} · Balcão{' '}
        {totais.balcao.ingressos}
      </Text>

      {relatorio.grupos.map((grupo) => {
        // A API devolve o método como código (DINHEIRO); na tela, o nome por extenso.
        const g = relatorio.agrupamento === 'metodo' ? { ...grupo, rotulo: ROTULO_METODO[grupo.chave] ?? grupo.rotulo } : grupo;
        const larguraTotal = (g.ingressos / maior) * 100;
        const fracaoApp = g.ingressos > 0 ? g.app.ingressos / g.ingressos : 0;
        return (
          <View
            key={g.chave}
            style={estilos.grupo}
            accessible
            accessibilityLabel={`${g.rotulo}: ${g.ingressos} ingressos, ${formatarPreco(g.receita)}. App ${g.app.ingressos} ingressos, ${formatarPreco(g.app.receita)}. Balcão ${g.balcao.ingressos} ingressos, ${formatarPreco(g.balcao.receita)}.`}
          >
            <View style={estilos.cabecalho}>
              <Text style={estilos.rotulo} numberOfLines={1}>
                {g.rotulo}
              </Text>
              <Text style={estilos.valor}>
                {g.ingressos} {g.ingressos === 1 ? 'ingresso' : 'ingressos'} · {formatarPreco(g.receita)}
              </Text>
            </View>
            <View style={estilos.trilha}>
              <View style={[estilos.barra, { width: `${larguraTotal}%` }]}>
                {g.app.ingressos > 0 && <View style={[estilos.segmento, estilos.app, { flex: fracaoApp }]} />}
                {g.balcao.ingressos > 0 && <View style={[estilos.segmento, estilos.balcao, { flex: 1 - fracaoApp }]} />}
              </View>
            </View>
            <Text style={estilos.divisao}>
              App {g.app.ingressos} ({formatarPreco(g.app.receita)}) · Balcão {g.balcao.ingressos} ({formatarPreco(g.balcao.receita)})
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espacos.md },
  legenda: { flexDirection: 'row', gap: espacos.lg },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: espacos.xs },
  quadrado: { width: 12, height: 12, borderRadius: 3 },
  textoLegenda: { ...tipografia.legenda, color: cores.texto },
  resumo: { ...tipografia.legenda, color: cores.textoSecundario },
  grupo: { gap: espacos.xs },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', gap: espacos.md },
  rotulo: { ...tipografia.corpoForte, color: cores.texto, flexShrink: 1 },
  valor: { ...tipografia.legenda, color: cores.texto, fontVariant: ['tabular-nums'] },
  trilha: { height: 14, borderRadius: raios.sm, backgroundColor: cores.grafico.trilha, overflow: 'hidden' },
  // 2 px de "respiro" entre os segmentos (gap da cor da superfície).
  barra: { flexDirection: 'row', height: '100%', gap: 2 },
  segmento: { height: '100%' },
  app: { backgroundColor: cores.grafico.app },
  balcao: { backgroundColor: cores.grafico.balcao, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  divisao: { ...tipografia.legenda, color: cores.textoSecundario },
});
