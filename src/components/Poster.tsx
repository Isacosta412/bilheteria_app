import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { cores, raios } from '@/theme';

interface PosterProps {
  url: string | null;
  titulo: string;
  estilo?: StyleProp<ViewStyle>;
}

/** Pôster 2:3. Sem URL (ou se a imagem falhar), mostra um bloco com a inicial do título. */
export function Poster({ url, titulo, estilo }: PosterProps) {
  const [falhou, setFalhou] = useState(false);
  const semImagem = !url || falhou;

  return (
    <View style={[estilos.moldura, estilo]}>
      {semImagem ? (
        <View style={estilos.substituto} accessibilityLabel={`Pôster de ${titulo} indisponível`}>
          <Text style={estilos.inicial} aria-hidden>
            {titulo.trim().charAt(0).toUpperCase() || '🎬'}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessibilityLabel={`Pôster de ${titulo}`}
          onError={() => setFalhou(true)}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  moldura: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: raios.md,
    overflow: 'hidden',
    backgroundColor: cores.superficieElevada,
  },
  substituto: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.superficieElevada },
  inicial: { fontSize: 48, fontWeight: '800', color: cores.textoSecundario },
});
