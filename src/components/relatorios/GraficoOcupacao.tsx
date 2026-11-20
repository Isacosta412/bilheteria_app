import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { formatarDataHoraCurta, formatarPercentual, formatarPreco } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { RelatorioSessao } from '@/types';

const MAX_BARRAS = 30;
const ALTURA_LINHA = 30;
const ALTURA_BARRA = 14;
const TOPO = 22; // espaço para o eixo 0–100%
const RAIO = 4;
const MARCAS = [0, 25, 50, 75, 100];

/** Barra horizontal ancorada no zero, com só a ponta (direita) arredondada. */
function caminhoBarra(x: number, y: number, largura: number, altura: number): string {
  const r = Math.min(RAIO, largura, altura / 2);
  return [
    `M${x},${y}`,
    `H${x + largura - r}`,
    `Q${x + largura},${y} ${x + largura},${y + r}`,
    `V${y + altura - r}`,
    `Q${x + largura},${y + altura} ${x + largura - r},${y + altura}`,
    `H${x}`,
    'Z',
  ].join(' ');
}

function cortar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

/**
 * Ocupação (%) por sessão em barras horizontais (react-native-svg, sem biblioteca de gráficos).
 * Série única: uma cor, sem legenda (o título diz o que é). Passar o mouse/tocar mostra o detalhe.
 * A tabela abaixo é a visão em texto dos mesmos dados.
 */
export function GraficoOcupacao({ sessoes }: { sessoes: RelatorioSessao[] }) {
  const [largura, setLargura] = useState(0);
  const [ativa, setAtiva] = useState<number | null>(null);
  const visiveis = sessoes.slice(0, MAX_BARRAS);

  const larguraRotulo = Math.min(230, Math.max(120, largura * 0.38));
  const larguraValor = 52;
  const area = Math.max(40, largura - larguraRotulo - larguraValor);
  const altura = TOPO + visiveis.length * ALTURA_LINHA;
  const caracteres = Math.floor(larguraRotulo / 7.2);
  const detalhe = ativa !== null ? visiveis[ativa] : undefined;

  return (
    <View onLayout={(e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width)}>
      <View style={estilos.detalhe} accessibilityLiveRegion="polite" aria-live="polite">
        {detalhe ? (
          <>
            <Text style={estilos.detalheTitulo}>
              {detalhe.filmeTitulo} · {detalhe.salaNome} · {formatarDataHoraCurta(detalhe.dataHora)}
            </Text>
            <Text style={estilos.detalheTexto}>
              {formatarPercentual(detalhe.taxaOcupacao)} ocupada · {detalhe.vendidos} de {detalhe.capacidade} lugares ·{' '}
              {formatarPreco(detalhe.receita)}
            </Text>
          </>
        ) : (
          <Text style={estilos.detalheTexto}>
            {Platform.OS === 'web' ? 'Passe o mouse' : 'Toque'} numa barra para ver os detalhes da sessão.
          </Text>
        )}
      </View>

      {largura > 0 && (
        <View style={{ height: altura }}>
          {/* O desenho é decorativo para o leitor de tela: os alvos abaixo (e a tabela) dizem os valores. */}
          <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Svg width={largura} height={altura}>
              {MARCAS.map((m) => {
                const x = larguraRotulo + (area * m) / 100;
                return (
                  <Line key={`g${m}`} x1={x} x2={x} y1={TOPO - 4} y2={altura} stroke={cores.grafico.grade} strokeWidth={1} />
                );
              })}
              {MARCAS.map((m) => (
                <SvgText
                  key={`t${m}`}
                  x={larguraRotulo + (area * m) / 100}
                  y={12}
                  fontSize={11}
                  fill={cores.textoSecundario}
                  textAnchor={m === 0 ? 'start' : m === 100 ? 'end' : 'middle'}
                >
                  {`${m}%`}
                </SvgText>
              ))}
              {visiveis.map((s, i) => {
                const y = TOPO + i * ALTURA_LINHA;
                const taxa = Math.min(100, Math.max(0, Number(s.taxaOcupacao)));
                const w = (area * taxa) / 100;
                const yBarra = y + (ALTURA_LINHA - ALTURA_BARRA) / 2;
                const destaque = ativa === i;
                return (
                  <G key={s.sessaoId}>
                    {destaque && <Rect x={0} y={y} width={largura} height={ALTURA_LINHA} fill={cores.superficieElevada} rx={4} />}
                    <SvgText
                      x={0}
                      y={y + ALTURA_LINHA / 2 + 4}
                      fontSize={12}
                      fill={destaque ? cores.texto : cores.textoSecundario}
                    >
                      {cortar(`${s.filmeTitulo} · ${formatarDataHoraCurta(s.dataHora)}`, caracteres)}
                    </SvgText>
                    {w > 0 && <Path d={caminhoBarra(larguraRotulo, yBarra, w, ALTURA_BARRA)} fill={cores.grafico.serie} />}
                    <SvgText
                      x={larguraRotulo + w + 6}
                      y={y + ALTURA_LINHA / 2 + 4}
                      fontSize={12}
                      fontWeight="600"
                      fill={cores.texto}
                    >
                      {formatarPercentual(s.taxaOcupacao)}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </View>

          {/* Alvos de toque/hover maiores que a barra: a linha inteira. */}
          {visiveis.map((s, i) => (
            <Pressable
              key={s.sessaoId}
              onPress={() => setAtiva(i)}
              onHoverIn={() => setAtiva(i)}
              onHoverOut={() => setAtiva((atual) => (atual === i ? null : atual))}
              onFocus={() => setAtiva(i)}
              accessibilityLabel={`${s.filmeTitulo}, ${s.salaNome}, ${formatarDataHoraCurta(s.dataHora)}: ${formatarPercentual(s.taxaOcupacao)} de ocupação`}
              style={[estilos.alvo, { top: TOPO + i * ALTURA_LINHA, height: ALTURA_LINHA }]}
            />
          ))}
        </View>
      )}

      {sessoes.length > MAX_BARRAS && (
        <Text style={estilos.nota}>
          Mostrando as {MAX_BARRAS} primeiras de {sessoes.length} sessões. A tabela abaixo tem todas.
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  detalhe: {
    minHeight: 52,
    justifyContent: 'center',
    backgroundColor: cores.superficieElevada,
    borderRadius: raios.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    marginBottom: espacos.md,
  },
  detalheTitulo: { ...tipografia.corpoForte, color: cores.texto },
  detalheTexto: { ...tipografia.legenda, color: cores.textoSecundario },
  alvo: { position: 'absolute', left: 0, right: 0 },
  nota: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    marginTop: espacos.sm,
  },
});
