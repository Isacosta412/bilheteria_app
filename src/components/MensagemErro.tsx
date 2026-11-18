import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raios, tipografia } from '@/theme';
import { Botao } from './Botao';

interface MensagemErroProps {
  /** Texto já traduzido para o usuário (use traduzirErro). Nunca passe JSON ou stack trace. */
  mensagem: string;
  aoTentarNovamente?: () => void;
  /** Versão compacta para dentro de formulários. */
  compacta?: boolean;
}

export function MensagemErro({ mensagem, aoTentarNovamente, compacta = false }: MensagemErroProps) {
  return (
    <View style={[estilos.container, compacta && estilos.compacta]} accessibilityRole="alert" aria-live="assertive">
      <Text style={estilos.texto}>
        <Text style={estilos.icone} aria-hidden>
          ⚠{' '}
        </Text>
        {mensagem}
      </Text>
      {aoTentarNovamente !== undefined && (
        <Botao titulo="Tentar novamente" onPress={aoTentarNovamente} variante="secundaria" estilo={estilos.botao} />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.fundoErro,
    borderColor: cores.erro,
    borderWidth: 1,
    borderRadius: raios.md,
    padding: espacos.lg,
    gap: espacos.md,
    marginVertical: espacos.md,
  },
  compacta: { padding: espacos.md, marginVertical: espacos.sm },
  texto: { ...tipografia.corpo, color: cores.texto },
  icone: { color: cores.erro },
  botao: { alignSelf: 'flex-start' },
});
