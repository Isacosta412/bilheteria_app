import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Tela } from '@/components/Tela';
import { cores, espacos, raios, tipografia } from '@/theme';

// O gerador de rotas tipadas lista estas como "/gerencia/x/index"; a URL real é "/gerencia/x".
const AREAS: { rota: Href; icone: string; titulo: string; descricao: string }[] = [
  { rota: '/gerencia/filmes' as Href, icone: '🎞️', titulo: 'Filmes', descricao: 'Cadastrar, editar e tirar do catálogo' },
  { rota: '/gerencia/salas' as Href, icone: '🏛️', titulo: 'Salas', descricao: 'Filas, assentos e lugares PCD' },
  { rota: '/gerencia/sessoes' as Href, icone: '🗓️', titulo: 'Sessões', descricao: 'Programação por dia, novas sessões e cancelamentos' },
];

export default function Gerencia() {
  const router = useRouter();
  return (
    <Tela>
      <View style={estilos.grade}>
        {AREAS.map((area) => (
          <Pressable
            key={area.titulo}
            onPress={() => router.push(area.rota)}
            accessibilityRole="button"
            accessibilityLabel={`${area.titulo}: ${area.descricao}`}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              estilos.cartao,
              (pressed || hovered) && estilos.cartaoAtivo,
            ]}
          >
            <Text style={estilos.icone} aria-hidden>
              {area.icone}
            </Text>
            <Text style={estilos.titulo}>{area.titulo}</Text>
            <Text style={estilos.descricao}>{area.descricao}</Text>
          </Pressable>
        ))}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.lg },
  cartao: {
    flexGrow: 1,
    flexBasis: 240,
    gap: espacos.xs,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.xl,
  },
  cartaoAtivo: { borderColor: cores.primaria },
  icone: { fontSize: 36, marginBottom: espacos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.texto },
  descricao: { ...tipografia.corpo, color: cores.textoSecundario },
});
