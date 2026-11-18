import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

type Variante = 'primaria' | 'secundaria' | 'texto';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  carregando?: boolean;
  desabilitado?: boolean;
  /** Descrição para leitores de tela, quando o título sozinho não basta. */
  accessibilityLabel?: string;
  estilo?: StyleProp<ViewStyle>;
}

export function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  carregando = false,
  desabilitado = false,
  accessibilityLabel,
  estilo,
}: BotaoProps) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'primaria' ? cores.sobrePrimaria : cores.primaria;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        variante === 'primaria' && estilos.primaria,
        variante === 'primaria' && pressed && estilos.primariaPressionada,
        variante === 'secundaria' && estilos.secundaria,
        variante === 'texto' && estilos.texto,
        pressed && variante !== 'primaria' && estilos.pressionado,
        inativo && estilos.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} accessibilityLabel="Carregando" />
      ) : (
        <Text style={[estilos.rotulo, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: AREA_TOQUE_MINIMA,
    paddingHorizontal: espacos.xl,
    paddingVertical: espacos.md,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaria: { backgroundColor: cores.primaria },
  primariaPressionada: { backgroundColor: cores.primariaPressionada },
  secundaria: { borderWidth: 1.5, borderColor: cores.primaria, backgroundColor: 'transparent' },
  texto: { backgroundColor: 'transparent', paddingHorizontal: espacos.md },
  pressionado: { opacity: 0.75 },
  inativo: { opacity: 0.5 },
  rotulo: { ...tipografia.botao },
});
