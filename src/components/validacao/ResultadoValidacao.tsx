import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';

export type TipoResultado = 'liberado' | 'utilizado' | 'recusado';

export interface Resultado {
  tipo: TipoResultado;
  titulo: string;
  linhas: string[];
}

/**
 * Cor E ícone (nunca só cor). Contraste do texto sobre o fundo:
 * verde/branco 5,0:1 · laranja/escuro 9,1:1 · vermelho/branco 6,5:1 (tokens em cores.validacao).
 */
const VISUAL: Record<TipoResultado, { fundo: string; texto: string; icone: string }> = {
  liberado: { ...cores.validacao.liberado, icone: '✓' },
  utilizado: { ...cores.validacao.utilizado, icone: '⚠' },
  recusado: { ...cores.validacao.recusado, icone: '✕' },
};

export const DURACAO_RESULTADO_MS = 3000;

/** Resultado da validação em tela cheia. Fecha sozinho em 3 s (ou com um toque). */
export function ResultadoValidacao({ resultado, aoFechar }: { resultado: Resultado; aoFechar: () => void }) {
  const v = VISUAL[resultado.tipo];
  const [progresso] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animacao = Animated.timing(progresso, {
      toValue: 0,
      duration: DURACAO_RESULTADO_MS,
      useNativeDriver: Platform.OS !== 'web',
    });
    animacao.start();
    const timer = setTimeout(aoFechar, DURACAO_RESULTADO_MS);
    return () => {
      animacao.stop();
      clearTimeout(timer);
    };
  }, [progresso, aoFechar]);

  return (
    <Pressable
      onPress={aoFechar}
      style={[StyleSheet.absoluteFill, estilos.camada, { backgroundColor: v.fundo }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      aria-live="assertive"
      accessibilityLabel={[resultado.titulo, ...resultado.linhas].join('. ')}
      accessibilityHint="Toque para validar o próximo"
    >
      <Text style={[estilos.icone, { color: v.texto }]} aria-hidden>
        {v.icone}
      </Text>
      <Text style={[estilos.titulo, { color: v.texto }]}>{resultado.titulo}</Text>
      {resultado.linhas.map((linha) => (
        <Text key={linha} style={[estilos.linha, { color: v.texto }]}>
          {linha}
        </Text>
      ))}
      <View style={[estilos.trilha, { borderColor: v.texto }]}>
        <Animated.View
          style={[
            estilos.barra,
            { backgroundColor: v.texto, transform: [{ scaleX: progresso }] },
          ]}
        />
      </View>
      <Text style={[estilos.dica, { color: v.texto }]}>Toque para continuar</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  camada: { zIndex: 50, alignItems: 'center', justifyContent: 'center', padding: espacos.xxl, gap: espacos.md },
  icone: { fontSize: 96, fontWeight: '900' },
  titulo: { fontSize: 34, lineHeight: 40, fontWeight: '800', textAlign: 'center' },
  linha: { ...tipografia.subtitulo, textAlign: 'center' },
  trilha: { width: '60%', maxWidth: 320, height: 8, borderRadius: 4, borderWidth: 1, overflow: 'hidden', marginTop: espacos.xl },
  barra: { height: '100%', width: '100%', transformOrigin: 'left' },
  dica: { ...tipografia.legenda, opacity: 0.9 },
});
