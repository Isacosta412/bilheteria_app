import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ExplosaoPipoca } from '@/components/ExplosaoPipoca';
import { DesenhoLogo } from '@/components/LogoPipocou';
import { cores, espacos } from '@/theme';

/**
 * Linha do tempo da cortina (ms):
 *   0      a tela escurece em vinho forte
 *   150    o balde aparece no meio (mola)
 *   600    o balde treme, "enchendo"
 *   1050   ESTOURA: pipocas voam do balde, aparece o texto, e a próxima tela é montada por baixo
 *   2150   a cortina some e revela a tela nova
 */
const T_BALDE = 150;
const T_TREME = 600;
const T_ESTOURO = 1050;
const T_SAIDA = 2150;
const DURACAO_SAIDA = 380;
/** Com "reduzir movimento": só escurece, mostra o texto e abre (sem balde tremendo nem partículas). */
const T_REDUZIDO_TROCA = 350;
const T_REDUZIDO_SAIDA = 1100;

const TAMANHO_BALDE = 150;

interface OpcoesCortina {
  /** Texto que aparece no estouro (ex.: "Pipocou! 🍿"). */
  texto?: string;
  /** Chamado com a tela já coberta, no momento do estouro: troque a tela aqui (navegar, ativar a sessão...). */
  aoCobrir?: () => void;
}

interface ValorCortina {
  mostrar: (opcoes: OpcoesCortina) => void;
}

const CortinaContext = createContext<ValorCortina | null>(null);

/** Use dentro do CortinaProvider (app/_layout.tsx). */
export function useCortinaPipoca(): ValorCortina {
  const valor = useContext(CortinaContext);
  if (!valor) throw new Error('useCortinaPipoca precisa estar dentro do CortinaProvider.');
  return valor;
}

interface Execucao extends OpcoesCortina {
  id: number;
}

/**
 * Cortina de comemoração por cima do app INTEIRO (fica no layout raiz, então continua na tela
 * enquanto a navegação troca a tela de baixo): escurece em vinho, um balde de pipoca treme e
 * estoura, e a cortina se abre mostrando a próxima tela. Bloqueia toques enquanto está visível.
 */
export function CortinaProvider({ children }: { children: ReactNode }) {
  const [atual, setAtual] = useState<Execucao | null>(null);
  const contador = useRef(0);

  const mostrar = useCallback((opcoes: OpcoesCortina) => {
    contador.current += 1;
    setAtual({ id: contador.current, ...opcoes });
  }, []);

  const encerrar = useCallback((id: number) => {
    setAtual((agora) => (agora?.id === id ? null : agora));
  }, []);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <CortinaContext.Provider value={valor}>
      <View style={estilos.raiz}>
        {children}
        {atual && <Cortina key={atual.id} execucao={atual} aoTerminar={encerrar} />}
      </View>
    </CortinaContext.Provider>
  );
}

function Cortina({ execucao, aoTerminar }: { execucao: Execucao; aoTerminar: (id: number) => void }) {
  const reduzirMovimento = useReducedMotion();
  const [estourou, setEstourou] = useState(false);

  const opacidadeFundo = useSharedValue(0);
  const escalaBalde = useSharedValue(0);
  const giroBalde = useSharedValue(0);
  const opacidadeBalde = useSharedValue(1);

  // `execucao` não muda durante a vida da cortina (cada execução tem a própria key).
  const { aoCobrir, id } = execucao;

  useEffect(() => {
    const tEstouro = reduzirMovimento ? T_REDUZIDO_TROCA : T_ESTOURO;
    const tSaida = reduzirMovimento ? T_REDUZIDO_SAIDA : T_SAIDA;

    opacidadeFundo.set(
      withSequence(
        withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
        withDelay(tSaida - 260, withTiming(0, { duration: DURACAO_SAIDA, easing: Easing.in(Easing.quad) })),
      ),
    );

    if (!reduzirMovimento) {
      // Aparece com mola, treme "enchendo" e estoura (cresce e some num piscar).
      escalaBalde.set(
        withSequence(
          withDelay(T_BALDE, withTiming(1.08, { duration: 260, easing: Easing.out(Easing.back(2)) })),
          withTiming(1, { duration: 120 }),
          withDelay(T_TREME - T_BALDE - 380, withTiming(1.12, { duration: T_ESTOURO - T_TREME })),
          withTiming(1.45, { duration: 140, easing: Easing.out(Easing.quad) }),
        ),
      );
      giroBalde.set(
        withDelay(
          T_TREME,
          withSequence(
            withTiming(-9, { duration: 60 }),
            withTiming(9, { duration: 70 }),
            withTiming(-11, { duration: 70 }),
            withTiming(11, { duration: 70 }),
            withTiming(-7, { duration: 70 }),
            withTiming(7, { duration: 60 }),
            withTiming(0, { duration: 50 }),
          ),
        ),
      );
      opacidadeBalde.set(withDelay(T_ESTOURO + 60, withTiming(0, { duration: 160 })));
    }

    const ids = [
      setTimeout(() => {
        setEstourou(true);
        aoCobrir?.();
      }, tEstouro),
      setTimeout(() => aoTerminar(id), tSaida + DURACAO_SAIDA),
    ];
    return () => ids.forEach(clearTimeout);
  }, [reduzirMovimento, opacidadeFundo, escalaBalde, giroBalde, opacidadeBalde, aoTerminar, aoCobrir, id]);

  const estiloFundo = useAnimatedStyle(() => ({ opacity: opacidadeFundo.get() }));
  const estiloBalde = useAnimatedStyle(() => ({
    opacity: opacidadeBalde.get(),
    transform: [{ scale: escalaBalde.get() }, { rotate: `${giroBalde.get()}deg` }],
  }));

  return (
    <Animated.View style={[estilos.cortina, estiloFundo]} accessibilityViewIsModal>
      {!reduzirMovimento && (
        <Animated.View style={[estilos.centro, estiloBalde]} aria-hidden accessibilityElementsHidden>
          <DesenhoLogo tamanho={TAMANHO_BALDE} />
        </Animated.View>
      )}
      {/* O ExplosaoPipoca já cuida do "reduzir movimento" (mostra só o texto). */}
      <ExplosaoPipoca
        ativo={estourou}
        quantidade={45}
        duracaoMs={T_SAIDA - T_ESTOURO + DURACAO_SAIDA}
        alcance={0.95}
        texto={execucao.texto}
      />
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  cortina: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.cortina,
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { alignItems: 'center', justifyContent: 'center', padding: espacos.lg },
});
