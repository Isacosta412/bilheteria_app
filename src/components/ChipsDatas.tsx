import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

export interface OpcaoData {
  /** null = todos os dias. */
  valor: string | null;
  rotulo: string;
}

interface ChipsDatasProps {
  opcoes: OpcaoData[];
  selecionada: string | null;
  aoSelecionar: (valor: string | null) => void;
}

/** Filtro de dias em chips com rolagem horizontal ("Todos", "Hoje", "Amanhã", ...). */
export function ChipsDatas({ opcoes, selecionada, aoSelecionar }: ChipsDatasProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.lista}
      accessibilityRole="tablist"
      accessibilityLabel="Filtrar por dia"
    >
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === selecionada;
        return (
          <Pressable
            key={opcao.valor ?? 'todos'}
            onPress={() => aoSelecionar(opcao.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={opcao.rotulo}
            style={[estilos.chip, ativa && estilos.chipAtivo]}
          >
            <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{opcao.rotulo}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: espacos.sm, paddingVertical: espacos.sm },
  chip: {
    minHeight: AREA_TOQUE_MINIMA - 8,
    justifyContent: 'center',
    paddingHorizontal: espacos.lg,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { ...tipografia.corpoForte, color: cores.texto },
  textoAtivo: { color: cores.sobrePrimaria },
});
