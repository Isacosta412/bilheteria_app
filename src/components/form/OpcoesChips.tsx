import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

export interface OpcaoChip<T extends string> {
  valor: T;
  rotulo: string;
  /** Conteúdo extra antes do rótulo (ex.: o selo da classificação). */
  icone?: ReactNode;
}

interface OpcoesChipsProps<T extends string> {
  opcoes: OpcaoChip<T>[];
  valor: T | null;
  aoMudar: (valor: T) => void;
  /** Rótulo do grupo (aparece em cima e é lido pelo leitor de tela). */
  rotulo?: string;
  erro?: string;
}

/** Escolha única em chips (classificação, agrupamento, atalhos de período). */
export function OpcoesChips<T extends string>({ opcoes, valor, aoMudar, rotulo, erro }: OpcoesChipsProps<T>) {
  return (
    <View style={estilos.container}>
      {rotulo !== undefined && <Text style={estilos.rotulo}>{rotulo}</Text>}
      <View style={estilos.lista} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
        {opcoes.map((opcao) => {
          const ativa = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => aoMudar(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativa }}
              aria-checked={ativa}
              accessibilityLabel={opcao.rotulo}
              style={({ pressed }) => [estilos.chip, ativa && estilos.chipAtivo, pressed && estilos.pressionado]}
            >
              {opcao.icone}
              <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{opcao.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
      {erro !== undefined && (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erro}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espacos.xs },
  rotulo: { ...tipografia.corpoForte, color: cores.texto },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
  chip: {
    minHeight: AREA_TOQUE_MINIMA - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  pressionado: { opacity: 0.8 },
  texto: { ...tipografia.corpoForte, color: cores.texto },
  textoAtivo: { color: cores.sobrePrimaria },
  erro: { ...tipografia.legenda, color: cores.erro },
});
