import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

interface CampoBuscaProps {
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder?: string;
  rotulo?: string;
}

/** Campo de busca simples (sem react-hook-form), com botão de limpar. */
export function CampoBusca({ valor, aoMudar, placeholder = 'Buscar', rotulo = 'Buscar' }: CampoBuscaProps) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.icone} aria-hidden>
        🔍
      </Text>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        accessibilityLabel={rotulo}
        autoCorrect={false}
        returnKeyType="search"
        style={estilos.input}
      />
      {valor.length > 0 && (
        <Pressable
          onPress={() => aoMudar('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
          style={estilos.limpar}
        >
          <Text style={estilos.limparTexto}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AREA_TOQUE_MINIMA,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    backgroundColor: cores.superficie,
    paddingLeft: espacos.md,
  },
  icone: { fontSize: 16, marginRight: espacos.sm },
  input: { flex: 1, ...tipografia.corpo, color: cores.texto, paddingVertical: espacos.sm },
  limpar: { minWidth: AREA_TOQUE_MINIMA, minHeight: AREA_TOQUE_MINIMA, alignItems: 'center', justifyContent: 'center' },
  limparTexto: { fontSize: 16, color: cores.textoSecundario },
});
