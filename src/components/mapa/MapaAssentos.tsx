import { useMemo, useState, type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';
import type { MapaAssentos as Mapa } from '@/types';
import { Assento } from './Assento';
import { LegendaAssentos } from './LegendaAssentos';

export const MAX_SELECAO_PADRAO = 10;

interface MapaAssentosProps {
  mapa: Mapa;
  selecionados: number[];
  onAlternar: (assentoId: number) => void;
  maxSelecao?: number;
}

const TAMANHO_MOBILE = 32; // área de toque mínima do CLAUDE.md
const TAMANHO_MAX_WEB = 36;
const TAMANHO_MIN_WEB = 20;
/** Filas com mais assentos que isto ganham um corredor central. */
const LIMITE_CORREDOR = 8;

function medidas(tamanho: number) {
  const espaco = Math.max(3, Math.round(tamanho * 0.18));
  return { espaco, letra: Math.round(tamanho * 0.9), corredor: Math.round(tamanho * 0.8) };
}

/** Largura total do mapa para um tamanho de assento. */
function larguraNatural(tamanho: number, colunas: number, temCorredor: boolean): number {
  const m = medidas(tamanho);
  return 2 * m.letra + colunas * (tamanho + m.espaco) + (temCorredor ? m.corredor : 0);
}

/**
 * Mapa de assentos reutilizável (cliente e balcão).
 * "TELA" no topo, números em cima, letras nas laterais e corredor central em filas longas.
 * Na web o tamanho do assento se ajusta para caber na largura; no celular fica fixo (32 px)
 * com rolagem horizontal.
 */
export function MapaAssentos({ mapa, selecionados, onAlternar, maxSelecao = MAX_SELECAO_PADRAO }: MapaAssentosProps) {
  const [largura, setLargura] = useState(0);
  const web = Platform.OS === 'web';

  const colunas = useMemo(
    () => Math.max(0, ...mapa.filas.flatMap((f) => f.assentos.map((a) => a.numero))),
    [mapa.filas],
  );
  const corredorApos = colunas > LIMITE_CORREDOR ? Math.ceil(colunas / 2) : null;
  const numeros = useMemo(() => Array.from({ length: colunas }, (_, i) => i + 1), [colunas]);
  const conjuntoSelecionados = useMemo(() => new Set(selecionados), [selecionados]);
  const limiteAtingido = selecionados.length >= maxSelecao;

  let tamanho = TAMANHO_MOBILE;
  if (web && largura > 0) {
    tamanho = TAMANHO_MAX_WEB;
    while (tamanho > TAMANHO_MIN_WEB && larguraNatural(tamanho, colunas, corredorApos !== null) > largura) tamanho--;
  }
  const m = medidas(tamanho);

  function celulas(render: (numero: number) => ReactNode) {
    return numeros.map((numero) => (
      <View key={numero} style={{ flexDirection: 'row' }}>
        <View style={{ width: tamanho, marginRight: m.espaco, alignItems: 'center' }}>{render(numero)}</View>
        {corredorApos === numero && <View style={{ width: m.corredor }} />}
      </View>
    ));
  }

  const grade = (
    <View style={estilos.grade}>
      {/* números em cima */}
      <View style={[estilos.linha, { marginBottom: m.espaco }]}>
        <View style={{ width: m.letra }} />
        {celulas((numero) => (
          <Text style={[estilos.numero, { fontSize: Math.max(10, tamanho * 0.36) }]} aria-hidden>
            {numero}
          </Text>
        ))}
        <View style={{ width: m.letra }} />
      </View>

      {mapa.filas.map(({ fila, assentos }) => {
        const porNumero = new Map(assentos.map((a) => [a.numero, a]));
        return (
          <View key={fila} style={[estilos.linha, { marginBottom: m.espaco }]} accessibilityLabel={`Fila ${fila}`}>
            <Text style={[estilos.letra, { width: m.letra, fontSize: Math.max(11, tamanho * 0.42) }]} aria-hidden>
              {fila}
            </Text>
            {celulas((numero) => {
              const assento = porNumero.get(numero);
              return assento ? (
                <Assento
                  assento={assento}
                  fila={fila}
                  selecionado={conjuntoSelecionados.has(assento.assentoId)}
                  tamanho={tamanho}
                  limiteAtingido={limiteAtingido}
                  onAlternar={onAlternar}
                />
              ) : (
                <View style={{ width: tamanho, height: tamanho }} />
              );
            })}
            <Text style={[estilos.letra, { width: m.letra, fontSize: Math.max(11, tamanho * 0.42) }]} aria-hidden>
              {fila}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View onLayout={(e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width)} style={estilos.container}>
      {/* TELA: barra curva com brilho */}
      <View style={estilos.telaArea} accessible accessibilityLabel="Tela do cinema (frente da sala)">
        <View style={estilos.telaCurva} />
        <Text style={estilos.telaTexto}>TELA</Text>
      </View>

      {web ? (
        <View style={estilos.centro}>{grade}</View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={estilos.rolagem}>
          {grade}
        </ScrollView>
      )}

      <LegendaAssentos mostrarTipos={mapa.filas.some((f) => f.assentos.some((a) => a.tipo !== 'PADRAO'))} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { width: '100%' },
  telaArea: { alignItems: 'center', marginBottom: espacos.xl },
  telaCurva: {
    width: '80%',
    height: 22,
    borderTopWidth: 4,
    borderColor: cores.primaria,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
    shadowColor: cores.primaria,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -2 },
  },
  telaTexto: { ...tipografia.legenda, color: cores.textoSecundario, letterSpacing: 6, fontWeight: '700', marginTop: -6 },
  centro: { alignItems: 'center' },
  rolagem: { paddingHorizontal: espacos.sm, minWidth: '100%', justifyContent: 'center' },
  grade: { alignItems: 'flex-start' },
  linha: { flexDirection: 'row', alignItems: 'center' },
  numero: { color: cores.textoSecundario, fontWeight: '600' },
  letra: { color: cores.textoSecundario, fontWeight: '700', textAlign: 'center' },
});
