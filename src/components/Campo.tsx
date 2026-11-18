import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

type PropsDoInput = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'secureTextEntry' | 'style'>;

interface CampoProps<T extends FieldValues> extends PropsDoInput {
  name: FieldPath<T>;
  control: Control<T>;
  rotulo: string;
  /** Campo de senha: esconde o texto e mostra o botão Mostrar/Ocultar. */
  senha?: boolean;
  dica?: string;
}

/**
 * Campo de texto ligado ao react-hook-form, com rótulo, erro e acessibilidade.
 * Usa <Controller> (render prop) em vez de useController: compatível com as regras do React Compiler.
 */
export function Campo<T extends FieldValues>({ name, control, rotulo, senha = false, dica, ...inputProps }: CampoProps<T>) {
  const [visivel, setVisivel] = useState(false);
  const [focado, setFocado] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, onChange, onBlur }, fieldState: { error } }) => {
        const erro = error?.message;
        return (
          <View style={estilos.container}>
            <Text style={estilos.rotulo} nativeID={`rotulo-${name}`}>
              {rotulo}
            </Text>
            <View style={[estilos.caixa, focado && estilos.caixaFocada, erro !== undefined && estilos.caixaErro]}>
              <TextInput
                ref={ref}
                value={typeof value === 'string' ? value : ''}
                onChangeText={onChange}
                onBlur={() => {
                  setFocado(false);
                  onBlur();
                }}
                onFocus={() => setFocado(true)}
                secureTextEntry={senha && !visivel}
                placeholderTextColor={cores.textoSecundario}
                accessibilityLabel={rotulo}
                aria-labelledby={`rotulo-${name}`}
                aria-invalid={erro !== undefined}
                style={estilos.input}
                {...inputProps}
              />
              {senha && (
                <Pressable
                  onPress={() => setVisivel((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                  style={estilos.mostrar}
                  hitSlop={8}
                >
                  <Text style={estilos.mostrarTexto}>{visivel ? 'Ocultar' : 'Mostrar'}</Text>
                </Pressable>
              )}
            </View>
            {erro !== undefined ? (
              <Text style={estilos.erro} accessibilityRole="alert">
                {erro}
              </Text>
            ) : dica !== undefined ? (
              <Text style={estilos.dica}>{dica}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const estilos = StyleSheet.create({
  container: { gap: espacos.xs, marginBottom: espacos.lg },
  rotulo: { ...tipografia.corpoForte, color: cores.texto },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AREA_TOQUE_MINIMA + 4,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
  },
  caixaFocada: { borderColor: cores.primaria },
  caixaErro: { borderColor: cores.erro },
  input: {
    flex: 1,
    ...tipografia.corpo,
    color: cores.texto,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md,
  },
  mostrar: { paddingHorizontal: espacos.md, minHeight: AREA_TOQUE_MINIMA, justifyContent: 'center' },
  mostrarTexto: { ...tipografia.legenda, color: cores.primaria, fontWeight: '600' },
  erro: { ...tipografia.legenda, color: cores.erro },
  dica: { ...tipografia.legenda, color: cores.textoSecundario },
});
