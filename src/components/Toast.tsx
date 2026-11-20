import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, espacos, raios, tipografia } from '@/theme';

export type TipoToast = 'info' | 'sucesso' | 'aviso' | 'erro';

interface ValorToast {
  mostrar: (texto: string, tipo?: TipoToast) => void;
}

const ToastContext = createContext<ValorToast | null>(null);

const VISUAL: Record<TipoToast, { icone: string; borda: string }> = {
  info: { icone: 'ℹ', borda: cores.bordaInterativa },
  sucesso: { icone: '✓', borda: cores.sucesso },
  aviso: { icone: '⚠', borda: cores.aviso },
  erro: { icone: '✕', borda: cores.erro },
};

const DURACAO_MS = 4000;

interface ToastAtual {
  id: number;
  texto: string;
  tipo: TipoToast;
}

/** Avisos curtos no rodapé da tela (some em 4 s). Anunciados por leitores de tela. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [atual, setAtual] = useState<ToastAtual | null>(null);
  const [opacidade] = useState(() => new Animated.Value(0));
  const contador = useRef(0);
  const insets = useSafeAreaInsets();

  const mostrar = useCallback((texto: string, tipo: TipoToast = 'info') => {
    contador.current += 1;
    setAtual({ id: contador.current, texto, tipo });
  }, []);

  useEffect(() => {
    if (!atual) return;
    const nativo = Platform.OS !== 'web';
    Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: nativo }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacidade, { toValue: 0, duration: 220, useNativeDriver: nativo }).start(() =>
        setAtual((agora) => (agora?.id === atual.id ? null : agora)),
      );
    }, DURACAO_MS);
    return () => clearTimeout(timer);
  }, [atual, opacidade]);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      {atual && (
        <View pointerEvents="none" style={[estilos.camada, { bottom: insets.bottom + 96 }]}>
          <Animated.View
            style={[estilos.toast, { borderLeftColor: VISUAL[atual.tipo].borda, opacity: opacidade }]}
            accessibilityLiveRegion="polite"
            aria-live="polite"
            accessibilityRole="alert"
          >
            <Text style={[estilos.icone, { color: VISUAL[atual.tipo].borda }]} aria-hidden>
              {VISUAL[atual.tipo].icone}
            </Text>
            <Text style={estilos.texto}>{atual.texto}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ValorToast {
  const valor = useContext(ToastContext);
  if (!valor) throw new Error('useToast() precisa estar dentro do <ToastProvider> (app/_layout.tsx).');
  return valor;
}

const estilos = StyleSheet.create({
  camada: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: espacos.lg },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    maxWidth: 480,
    width: '100%',
    backgroundColor: cores.superficieElevada,
    borderRadius: raios.md,
    borderLeftWidth: 5,
    paddingVertical: espacos.md,
    paddingHorizontal: espacos.lg,
    shadowColor: cores.sombra,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  icone: { fontSize: 18, fontWeight: '800' },
  texto: { ...tipografia.corpo, color: cores.texto, flexShrink: 1 },
});
