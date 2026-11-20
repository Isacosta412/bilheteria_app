import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';

const ETAPAS = ['Sessão', 'Assentos', 'Pagamento'];

/** "1 Sessão › 2 Assentos › 3 Pagamento", com a etapa atual destacada. */
export function IndicadorEtapas({ atual }: { atual: number }) {
  return (
    <View style={estilos.linha} accessibilityRole="progressbar" accessibilityLabel={`Etapa ${atual + 1} de 3: ${ETAPAS[atual] ?? 'concluída'}`}>
      {ETAPAS.map((nome, i) => (
        <View key={nome} style={estilos.item}>
          <View style={[estilos.numero, i <= atual && estilos.numeroAtivo]}>
            <Text style={[estilos.numeroTexto, i <= atual && estilos.numeroTextoAtivo]}>{i < atual ? '✓' : i + 1}</Text>
          </View>
          <Text style={[estilos.nome, i === atual && estilos.nomeAtual]}>{nome}</Text>
          {i < ETAPAS.length - 1 && (
            <Text style={estilos.seta} aria-hidden>
              ›
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacos.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: espacos.xs },
  numero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  numeroTexto: { ...tipografia.legenda, fontWeight: '800', color: cores.textoSecundario },
  numeroTextoAtivo: { color: cores.sobrePrimaria },
  nome: { ...tipografia.corpo, color: cores.textoSecundario },
  nomeAtual: { color: cores.texto, fontWeight: '700' },
  seta: { ...tipografia.corpo, color: cores.textoSecundario, marginHorizontal: espacos.xs },
});
