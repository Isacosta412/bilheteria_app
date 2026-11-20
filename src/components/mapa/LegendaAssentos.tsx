import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';
import { VISUAL, type EstadoVisual } from './visual';

const ESTADOS: EstadoVisual[] = ['livre', 'selecionado', 'reservado', 'vendido', 'minhaReserva'];

function MiniAssento({ fundo, borda, espessura, icone, corIcone }: { fundo: string; borda: string; espessura: number; icone: string; corIcone: string }) {
  return (
    <View style={[estilos.mini, { backgroundColor: fundo, borderColor: borda, borderWidth: espessura }]}>
      {icone !== '' && <Text style={[estilos.miniIcone, { color: corIcone }]}>{icone}</Text>}
    </View>
  );
}

/** Legenda com cor + ícone (nunca só cor), igual aos assentos do mapa. */
export function LegendaAssentos({ mostrarTipos = true, modo = 'selecao' }: { mostrarTipos?: boolean; modo?: 'selecao' | 'editor' }) {
  if (modo === 'editor') {
    const pcd = VISUAL.selecionado;
    return (
      <View style={estilos.legenda} accessibilityRole="summary" accessibilityLabel="Legenda da prévia da sala">
        <View style={estilos.item}>
          <MiniAssento fundo="transparent" borda={cores.assento.livreBorda} espessura={1.5} icone="" corIcone={cores.textoSecundario} />
          <Text style={estilos.texto}>Comum</Text>
        </View>
        <View style={estilos.item}>
          <MiniAssento fundo={pcd.fundo} borda={pcd.borda} espessura={1.5} icone="♿" corIcone={pcd.corIcone} />
          <Text style={estilos.texto}>PCD (toque para marcar)</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={estilos.legenda} accessibilityRole="summary" accessibilityLabel="Legenda do mapa de assentos">
      {ESTADOS.map((estado) => {
        const v = VISUAL[estado];
        return (
          <View key={estado} style={estilos.item}>
            <MiniAssento fundo={v.fundo} borda={v.borda} espessura={estado === 'minhaReserva' ? 2.5 : 1.5} icone={v.icone} corIcone={v.corIcone} />
            <Text style={estilos.texto}>{v.rotulo}</Text>
          </View>
        );
      })}
      {mostrarTipos && (
        <>
          <View style={estilos.item}>
            <MiniAssento fundo="transparent" borda={cores.assento.livreBorda} espessura={1.5} icone="♿" corIcone={cores.textoSecundario} />
            <Text style={estilos.texto}>PCD</Text>
          </View>
          <View style={estilos.item}>
            <MiniAssento fundo="transparent" borda={cores.assento.livreBorda} espessura={1.5} icone="★" corIcone={cores.textoSecundario} />
            <Text style={estilos.texto}>VIP</Text>
          </View>
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  legenda: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: espacos.lg, rowGap: espacos.sm, marginTop: espacos.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: espacos.xs },
  mini: { width: 20, height: 20, borderRadius: 5, borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniIcone: { fontSize: 11, fontWeight: '800' },
  texto: { ...tipografia.legenda, color: cores.textoSecundario },
});
