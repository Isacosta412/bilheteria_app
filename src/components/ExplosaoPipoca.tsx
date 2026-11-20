import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { cores, espacos, tipografia } from '@/theme';

export interface Ponto {
  x: number;
  y: number;
}

interface ExplosaoPipocaProps {
  /** Ao virar `true`, dispara uma explosão (e o `onFim` ao terminar). */
  ativo: boolean;
  /** De onde as pipocas saem, relativo à área do componente. Padrão: o centro. */
  origem?: Ponto;
  /** As pipocas saem de pontos espalhados pela base da área (em vez de um ponto só). */
  deBaixo?: boolean;
  quantidade?: number;
  duracaoMs?: number;
  onFim?: () => void;
  /** Texto que aparece junto com a explosão (com movimento reduzido, só ele aparece, com fade). */
  texto?: string;
  /** Até que altura (fração da distância até o topo) as pipocas sobem. */
  alcance?: number;
}

/** 3 formatos de pipoca: grupos de "bolinhas" [cx, cy, r] num quadro 28×26. */
const FORMATOS: readonly (readonly (readonly [number, number, number])[])[] = [
  [
    [10, 13, 7],
    [17, 9, 6],
    [16, 17, 6],
  ],
  [
    [9, 10, 6],
    [17, 12, 7],
    [11, 18, 6],
  ],
  [
    [11, 12, 6.5],
    [18, 16, 6],
    [9, 19, 5],
    [17, 8, 5],
  ],
];

/** Gravidade em px/s² (as pipocas sobem, perdem velocidade e caem). */
const GRAVIDADE = 1800;
const ATRASO_MAXIMO_MS = 300;

function DesenhoPipoca({ formato, tamanho }: { formato: number; tamanho: number }) {
  const bolinhas = FORMATOS[formato] ?? FORMATOS[0] ?? [];
  return (
    <Svg width={tamanho} height={tamanho * (26 / 28)} viewBox="0 0 28 26">
      {bolinhas.map(([cx, cy, r]) => (
        <Circle key={`s${cx}-${cy}`} cx={cx + 1.3} cy={cy + 1.3} r={r} fill={cores.pipoca.sombra} />
      ))}
      {bolinhas.map(([cx, cy, r]) => (
        <Circle key={`c${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={cores.pipoca.corpo} />
      ))}
    </Svg>
  );
}

interface Sorteio {
  formato: number;
  tamanho: number;
  /** Deslocamento do ponto de saída (só no modo 'de baixo'). */
  dx: number;
  vx: number;
  vy: number;
  giro: number;
  atraso: number;
}

/** Sorteia, uma única vez por pipoca, o formato, o tamanho, a velocidade, o giro e o atraso. */
function sortear(area: { largura: number; altura: number }, origem: Ponto, alcance: number, deBaixo: boolean): Sorteio {
  const subida = Math.max(80, origem.y * alcance) * (0.45 + Math.random() * 0.55);
  return {
    formato: Math.floor(Math.random() * FORMATOS.length),
    tamanho: 20 + Math.random() * 16,
    dx: deBaixo ? (Math.random() - 0.5) * area.largura * 0.9 : 0,
    vx: (Math.random() * 2 - 1) * Math.max(deBaixo ? 60 : 160, area.largura * (deBaixo ? 0.15 : 0.45)),
    vy: -Math.sqrt(2 * GRAVIDADE * subida),
    giro: (Math.random() * 2 - 1) * 540,
    atraso: Math.random() * ATRASO_MAXIMO_MS,
  };
}

/**
 * Uma pipoca. Todo o movimento roda no UI thread: o tempo `t` (0→1) e a escala são shared values
 * animados uma vez, e a posição é calculada no worklet do useAnimatedStyle (sem setState por frame).
 */
function Pipoca({
  area,
  origem,
  alcance,
  deBaixo,
  duracaoMs,
}: {
  area: { largura: number; altura: number };
  origem: Ponto;
  alcance: number;
  deBaixo: boolean;
  duracaoMs: number;
}) {
  const [p] = useState(() => sortear(area, origem, alcance, deBaixo));
  const t = useSharedValue(0);
  const escala = useSharedValue(0);
  const duracaoVoo = Math.max(300, duracaoMs - p.atraso);

  useEffect(() => {
    escala.set(
      withDelay(
        p.atraso,
        withSequence(
          withSpring(1.2, { damping: 14, stiffness: 420, overshootClamping: true }),
          withSpring(1, { damping: 12, stiffness: 220 }),
        ),
      ),
    );
    t.set(withDelay(p.atraso, withTiming(1, { duration: duracaoVoo, easing: Easing.linear })));
  }, [escala, t, p.atraso, duracaoVoo]);

  const estilo = useAnimatedStyle(() => {
    const progresso = t.get();
    const s = (progresso * duracaoVoo) / 1000;
    const x = origem.x + p.dx + p.vx * s - p.tamanho / 2;
    const y = origem.y + p.vy * s + 0.5 * GRAVIDADE * s * s - p.tamanho / 2;
    return {
      opacity: progresso < 0.65 ? 1 : Math.max(0, (1 - progresso) / 0.35),
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${p.giro * progresso}deg` }, { scale: escala.get() }],
    };
  });

  return (
    <Animated.View style={[estilos.pipoca, estilo]}>
      <DesenhoPipoca formato={p.formato} tamanho={p.tamanho} />
    </Animated.View>
  );
}

/** Texto da comemoração: entra com fade e um leve "pulo". */
function TextoComemoracao({ texto, duracaoMs }: { texto: string; duracaoMs: number }) {
  const opacidade = useSharedValue(0);
  const escala = useSharedValue(0.8);

  useEffect(() => {
    opacidade.set(
      withSequence(withTiming(1, { duration: 250 }), withDelay(Math.max(0, duracaoMs - 650), withTiming(0, { duration: 400 }))),
    );
    escala.set(withSpring(1, { damping: 8, stiffness: 180 }));
  }, [opacidade, escala, duracaoMs]);

  const estilo = useAnimatedStyle(() => ({ opacity: opacidade.get(), transform: [{ scale: escala.get() }] }));

  return (
    <Animated.View style={[estilos.textoArea, estilo]}>
      <Text style={estilos.texto} accessibilityRole="alert">
        {texto}
      </Text>
    </Animated.View>
  );
}

/**
 * Explosão de pipocas por cima da tela (não bloqueia toques: pointerEvents "none").
 * Com "reduzir movimento" ligado no sistema, não há partículas: só o texto aparece, com fade.
 */
export function ExplosaoPipoca({
  ativo,
  origem,
  deBaixo = false,
  quantidade = 25,
  duracaoMs = 1500,
  onFim,
  texto,
  alcance = 0.9,
}: ExplosaoPipocaProps) {
  const reduzirMovimento = useReducedMotion();
  const [area, setArea] = useState<{ largura: number; altura: number } | null>(null);

  const [encerrado, setEncerrado] = useState(false);
  // Ao desligar `ativo`, a próxima ativação começa uma explosão nova.
  if (!ativo && encerrado) setEncerrado(false);

  // Um único temporizador no JS para o fim (as partículas terminam todas até duracaoMs):
  // desmonta as partículas e avisa quem usa o componente.
  useEffect(() => {
    if (!ativo) return;
    const id = setTimeout(() => {
      setEncerrado(true);
      onFim?.();
    }, duracaoMs);
    return () => clearTimeout(id);
  }, [ativo, duracaoMs, onFim]);

  const rodando = ativo && !encerrado;

  const medir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((a) => (a && a.largura === width && a.altura === height ? a : { largura: width, altura: height }));
  };

  const pontoDeOrigem = area ? (origem ?? { x: area.largura / 2, y: deBaixo ? area.altura + 10 : area.altura / 2 }) : null;

  return (
    <View style={estilos.sobreposicao} onLayout={medir} aria-hidden={!texto}>
      {rodando &&
        !reduzirMovimento &&
        area &&
        pontoDeOrigem &&
        Array.from({ length: quantidade }, (_, i) => (
          <Pipoca key={i} area={area} origem={pontoDeOrigem} alcance={alcance} deBaixo={deBaixo} duracaoMs={duracaoMs} />
        ))}
      {rodando && texto ? <TextoComemoracao texto={texto} duracaoMs={duracaoMs} /> : null}
    </View>
  );
}

const PREENCHER = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const estilos = StyleSheet.create({
  sobreposicao: { ...PREENCHER, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 },
  pipoca: { position: 'absolute', left: 0, top: 0 },
  textoArea: { ...PREENCHER, alignItems: 'center', justifyContent: 'center', padding: espacos.xl },
  texto: {
    ...tipografia.titulo,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: cores.primaria,
    textAlign: 'center',
    textShadowColor: cores.fundo,
    textShadowRadius: 12,
  },
});
