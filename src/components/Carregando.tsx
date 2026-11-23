import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FundoCinema } from '@/components/FundoCinema';
import { cores, espacos, tipografia } from '@/theme';

interface CarregandoProps {
  mensagem?: string;
  /** Ocupa a tela inteira (ex.: restaurando a sessão ao abrir o app). */
  telaCheia?: boolean;
}

export function Carregando({ mensagem = 'Carregando…', telaCheia = false }: CarregandoProps) {
  return (
    <View
      style={[estilos.container, telaCheia && estilos.telaCheia]}
      accessibilityRole="progressbar"
      accessibilityLabel={mensagem}
      aria-busy
    >
      {telaCheia && <FundoCinema />}
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: espacos.xl, gap: espacos.md },
  telaCheia: { flex: 1, backgroundColor: cores.fundo },
  texto: { ...tipografia.corpo, color: cores.textoSecundario },
});
