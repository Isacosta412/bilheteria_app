import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatarDataHoraCurta, formatarPercentual, formatarPreco } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { RelatorioSessao } from '@/types';

type Coluna = 'filme' | 'sala' | 'dataHora' | 'vendidos' | 'ocupacao' | 'receita';

const COLUNAS: { chave: Coluna; titulo: string; largura: number; numerica?: boolean }[] = [
  { chave: 'filme', titulo: 'Filme', largura: 200 },
  { chave: 'sala', titulo: 'Sala', largura: 110 },
  { chave: 'dataHora', titulo: 'Data/hora', largura: 110 },
  { chave: 'vendidos', titulo: 'Vendidos', largura: 100, numerica: true },
  { chave: 'ocupacao', titulo: 'Ocupação', largura: 150 },
  { chave: 'receita', titulo: 'Receita', largura: 110, numerica: true },
];

function valorDe(s: RelatorioSessao, coluna: Coluna): string | number {
  switch (coluna) {
    case 'filme':
      return s.filmeTitulo.toLocaleLowerCase('pt-BR');
    case 'sala':
      return s.salaNome.toLocaleLowerCase('pt-BR');
    case 'dataHora':
      return s.dataHora;
    case 'vendidos':
      return s.vendidos;
    case 'ocupacao':
      return Number(s.taxaOcupacao);
    case 'receita':
      return Number(s.receita);
  }
}

/** Tabela por sessão; o cabeçalho ordena (toque de novo inverte). Rola na horizontal no celular. */
export function TabelaSessoes({ sessoes }: { sessoes: RelatorioSessao[] }) {
  const [ordem, setOrdem] = useState<{ coluna: Coluna; asc: boolean }>({ coluna: 'dataHora', asc: true });

  const ordenadas = useMemo(() => {
    const fator = ordem.asc ? 1 : -1;
    return [...sessoes].sort((a, b) => {
      const va = valorDe(a, ordem.coluna);
      const vb = valorDe(b, ordem.coluna);
      const comparacao = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR');
      return comparacao * fator || a.dataHora.localeCompare(b.dataHora);
    });
  }, [sessoes, ordem]);

  function ordenarPor(coluna: Coluna) {
    setOrdem((atual) => (atual.coluna === coluna ? { coluna, asc: !atual.asc } : { coluna, asc: coluna === 'filme' || coluna === 'sala' || coluna === 'dataHora' }));
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={estilos.rolagem}>
      <View style={estilos.tabela} accessibilityRole="list" accessibilityLabel="Sessões do período">
        <View style={[estilos.linha, estilos.cabecalho]}>
          {COLUNAS.map((c) => {
            const ativa = ordem.coluna === c.chave;
            return (
              <Pressable
                key={c.chave}
                onPress={() => ordenarPor(c.chave)}
                accessibilityRole="button"
                accessibilityLabel={`Ordenar por ${c.titulo}${ativa ? (ordem.asc ? ', crescente' : ', decrescente') : ''}`}
                accessibilityState={{ selected: ativa }}
                style={[estilos.celula, estilos.celulaCabecalho, { width: c.largura }, c.numerica && estilos.direita]}
              >
                <Text style={[estilos.textoCabecalho, ativa && estilos.textoCabecalhoAtivo]}>
                  {c.titulo}
                  {ativa ? (ordem.asc ? ' ▲' : ' ▼') : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {ordenadas.map((s, i) => {
          const taxa = Math.min(100, Math.max(0, Number(s.taxaOcupacao)));
          return (
            <View
              key={s.sessaoId}
              style={[estilos.linha, i % 2 === 1 && estilos.linhaAlternada]}
              accessible
              accessibilityLabel={`${s.filmeTitulo}, ${s.salaNome}, ${formatarDataHoraCurta(s.dataHora)}${s.cancelada ? ', cancelada' : ''}: ${s.vendidos} de ${s.capacidade} vendidos, ${formatarPercentual(s.taxaOcupacao)}, receita ${formatarPreco(s.receita)}`}
            >
              <View style={[estilos.celula, { width: 200 }]}>
                <Text style={estilos.texto} numberOfLines={2}>
                  {s.filmeTitulo}
                </Text>
                {s.cancelada && <Text style={estilos.cancelada}>Cancelada</Text>}
              </View>
              <Text style={[estilos.celula, estilos.texto, { width: 110 }]}>{s.salaNome}</Text>
              <Text style={[estilos.celula, estilos.texto, { width: 110 }]}>{formatarDataHoraCurta(s.dataHora)}</Text>
              <Text style={[estilos.celula, estilos.texto, estilos.direita, estilos.numero, { width: 100 }]}>
                {s.vendidos}/{s.capacidade}
              </Text>
              <View style={[estilos.celula, estilos.ocupacao, { width: 150 }]}>
                <View style={estilos.trilha}>
                  <View style={[estilos.barra, { width: `${taxa}%` }]} />
                </View>
                <Text style={[estilos.texto, estilos.numero, estilos.pct]}>{formatarPercentual(s.taxaOcupacao)}</Text>
              </View>
              <Text style={[estilos.celula, estilos.texto, estilos.direita, estilos.numero, { width: 110 }]}>
                {formatarPreco(s.receita)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { minWidth: '100%' },
  tabela: { flexGrow: 1, borderWidth: 1, borderColor: cores.borda, borderRadius: raios.md, overflow: 'hidden' },
  linha: { flexDirection: 'row', alignItems: 'center', minHeight: AREA_TOQUE_MINIMA },
  linhaAlternada: { backgroundColor: cores.superficie },
  cabecalho: { backgroundColor: cores.superficieElevada },
  celula: { paddingHorizontal: espacos.md, paddingVertical: espacos.sm, justifyContent: 'center' },
  celulaCabecalho: { minHeight: AREA_TOQUE_MINIMA },
  direita: { textAlign: 'right', alignItems: 'flex-end' },
  textoCabecalho: { ...tipografia.legenda, color: cores.textoSecundario, fontWeight: '700' },
  textoCabecalhoAtivo: { color: cores.texto },
  texto: { ...tipografia.legenda, color: cores.texto },
  numero: { fontVariant: ['tabular-nums'] },
  cancelada: { ...tipografia.legenda, color: cores.erro, fontWeight: '700' },
  ocupacao: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  trilha: { flex: 1, height: 8, borderRadius: 4, backgroundColor: cores.grafico.trilha, overflow: 'hidden' },
  barra: { height: '100%', backgroundColor: cores.grafico.serie, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  pct: { width: 44, textAlign: 'right' },
});
