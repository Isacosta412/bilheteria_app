import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raios, tipografia } from '@/theme';

interface ItemListaProps {
  titulo: string;
  linhas?: string[];
  /** Selos ao lado do título (classificação, "Inativo"...). */
  selos?: ReactNode;
  /** Elemento à esquerda (ex.: pôster pequeno). */
  inicio?: ReactNode;
  /** Botões à direita / embaixo. */
  acoes?: ReactNode;
  /** Toque no corpo do item (abre a edição). */
  aoTocar?: () => void;
  rotuloToque?: string;
  apagado?: boolean;
}

/** Linha das listas da gerência: corpo tocável (editar) + ações. */
export function ItemLista({ titulo, linhas = [], selos, inicio, acoes, aoTocar, rotuloToque, apagado = false }: ItemListaProps) {
  const corpo = (
    <View style={estilos.corpo}>
      {inicio}
      <View style={estilos.textos}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo} numberOfLines={2}>
            {titulo}
          </Text>
          {selos}
        </View>
        {linhas.map((linha) => (
          <Text key={linha} style={estilos.linha}>
            {linha}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[estilos.item, apagado && estilos.apagado]}>
      {aoTocar ? (
        <Pressable
          onPress={aoTocar}
          accessibilityRole="button"
          accessibilityLabel={rotuloToque ?? `Editar ${titulo}`}
          style={({ pressed }) => [estilos.tocavel, pressed && estilos.pressionado]}
        >
          {corpo}
        </Pressable>
      ) : (
        <View style={estilos.tocavel}>{corpo}</View>
      )}
      {acoes !== undefined && <View style={estilos.acoes}>{acoes}</View>}
    </View>
  );
}

type Tom = 'neutro' | 'aviso' | 'erro' | 'sucesso';

const TONS: Record<Tom, { borda: string; texto: string }> = {
  neutro: { borda: cores.bordaInterativa, texto: cores.textoSecundario },
  aviso: { borda: cores.aviso, texto: cores.aviso },
  erro: { borda: cores.erro, texto: cores.erro },
  sucesso: { borda: cores.sucesso, texto: cores.sucesso },
};

/** Selo de texto (nunca só cor): "Inativo", "Cancelada"... */
export function Selo({ texto, tom = 'neutro' }: { texto: string; tom?: Tom }) {
  const t = TONS[tom];
  return (
    <View style={[estilos.selo, { borderColor: t.borda }]}>
      <Text style={[estilos.seloTexto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  item: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
  },
  apagado: { opacity: 0.75 },
  tocavel: { flexGrow: 1, flexShrink: 1, flexBasis: 260, borderRadius: raios.md },
  pressionado: { opacity: 0.8 },
  corpo: { flexDirection: 'row', alignItems: 'center', gap: espacos.md },
  textos: { flex: 1, gap: espacos.xxs },
  cabecalho: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacos.sm },
  titulo: { ...tipografia.corpoForte, color: cores.texto, flexShrink: 1 },
  linha: { ...tipografia.legenda, color: cores.textoSecundario },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm, marginLeft: 'auto' },
  selo: { borderWidth: 1.5, borderRadius: raios.pilula, paddingHorizontal: espacos.sm, paddingVertical: 1 },
  seloTexto: { ...tipografia.legenda, fontWeight: '700' },
});
