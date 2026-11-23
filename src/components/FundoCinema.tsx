import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Polygon, Rect } from 'react-native-svg';
import { cores } from '@/theme';

/** Lado do ladrilho que se repete no fundo (px). */
const LADO = 240;
/** Transparência dos desenhos: aparecem como uma estampa, sem atrapalhar a leitura. */
const OPACIDADE = 0.11;

const COR = cores.desenhoFundo;
const TRACO = { stroke: COR, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Balde de pipoca listrado com pipocas em cima. (x, y) = canto superior esquerdo, ~44×56. */
function Balde({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${giro} 22 28)`}>
      <Circle cx={12} cy={16} r={7} fill={COR} />
      <Circle cx={22} cy={11} r={8} fill={COR} />
      <Circle cx={33} cy={16} r={7} fill={COR} />
      <Polygon points="4,20 40,20 34,56 10,56" {...TRACO} />
      <Line x1={16} y1={20} x2={18} y2={56} {...TRACO} />
      <Line x1={28} y1={20} x2={26} y2={56} {...TRACO} />
    </G>
  );
}

/** Rolo de filme. (cx, cy) = centro. */
function Rolo({ cx, cy, r = 20 }: { cx: number; cy: number; r?: number }) {
  const furos = [0, 72, 144, 216, 288].map((graus) => {
    const rad = (graus * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r * 0.55, y: cy + Math.sin(rad) * r * 0.55 };
  });
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} {...TRACO} />
      <Circle cx={cx} cy={cy} r={r * 0.15} fill={COR} />
      {furos.map((f) => (
        <Circle key={`${f.x}-${f.y}`} cx={f.x} cy={f.y} r={r * 0.18} fill={COR} />
      ))}
      {/* fita saindo do rolo */}
      <Path d={`M ${cx + r * 0.7} ${cy + r * 0.7} Q ${cx + r * 1.6} ${cy + r * 1.2} ${cx + r * 2.2} ${cy + r * 0.6}`} {...TRACO} />
    </G>
  );
}

/** Claquete. (x, y) = canto superior esquerdo, ~48×40. */
function Claquete({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${giro} 24 20)`}>
      <Rect x={2} y={14} width={44} height={26} rx={3} {...TRACO} />
      <Polygon points="2,12 44,4 46,12 4,20" {...TRACO} />
      <Line x1={14} y1={10} x2={18} y2={17} {...TRACO} />
      <Line x1={26} y1={8} x2={30} y2={15} {...TRACO} />
      <Line x1={38} y1={6} x2={42} y2={13} {...TRACO} />
      <Line x1={8} y1={24} x2={32} y2={24} {...TRACO} />
      <Line x1={8} y1={31} x2={24} y2={31} {...TRACO} />
    </G>
  );
}

/** Ingresso com os recortes laterais. (x, y) = canto superior esquerdo, ~56×28. */
function Ingresso({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${giro} 28 14)`}>
      <Path d="M 0 0 H 56 V 9 A 5 5 0 0 0 56 19 V 28 H 0 V 19 A 5 5 0 0 0 0 9 Z" {...TRACO} />
      <Line x1={40} y1={4} x2={40} y2={24} {...TRACO} strokeDasharray="3 4" />
      <Line x1={8} y1={10} x2={30} y2={10} {...TRACO} />
      <Line x1={8} y1={18} x2={24} y2={18} {...TRACO} />
    </G>
  );
}

/** Pedaço de película com os furinhos. (x, y) = canto superior esquerdo, ~64×22. */
function Pelicula({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${giro} 32 11)`}>
      <Rect x={0} y={0} width={64} height={22} rx={2} {...TRACO} />
      {[6, 18, 30, 42, 54].map((px) => (
        <G key={px}>
          <Rect x={px} y={3} width={5} height={3} fill={COR} />
          <Rect x={px} y={16} width={5} height={3} fill={COR} />
        </G>
      ))}
    </G>
  );
}

/** Estrelinha de 4 pontas (brilho de holofote). */
function Brilho({ cx, cy, t = 6 }: { cx: number; cy: number; t?: number }) {
  return (
    <Path
      d={`M ${cx} ${cy - t} Q ${cx} ${cy} ${cx + t} ${cy} Q ${cx} ${cy} ${cx} ${cy + t} Q ${cx} ${cy} ${cx - t} ${cy} Q ${cx} ${cy} ${cx} ${cy - t} Z`}
      fill={COR}
    />
  );
}

/** Pipoca solta (três bolinhas). */
function Pipoca({ cx, cy }: { cx: number; cy: number }) {
  return (
    <G>
      <Circle cx={cx - 3} cy={cy + 1} r={3.5} fill={COR} />
      <Circle cx={cx + 3} cy={cy + 1} r={3.5} fill={COR} />
      <Circle cx={cx} cy={cy - 3} r={3.8} fill={COR} />
    </G>
  );
}

/**
 * Estampa de fundo das telas: baldes de pipoca, rolos de filme, claquetes, ingressos e brilhos,
 * repetidos num ladrilho e bem transparentes. Puramente decorativa (escondida do leitor de tela
 * e sem receber toques). Fica atrás do conteúdo: use como primeiro filho de um container com
 * fundo `cores.fundo`.
 */
export const FundoCinema = memo(function FundoCinema() {
  // Cada tela empilhada fica montada ao mesmo tempo na web: o id do padrão precisa ser único,
  // senão o url(#...) aponta para o de uma tela escondida e a estampa some.
  const id = `estampa-cinema-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={LADO} height={LADO}>
            <G opacity={OPACIDADE}>
              <Balde x={14} y={12} giro={-10} />
              <Rolo cx={150} cy={44} />
              <Brilho cx={98} cy={22} />
              <Pipoca cx={210} cy={18} />
              <Ingresso x={84} y={96} giro={-14} />
              <Pipoca cx={40} cy={108} />
              <Claquete x={168} y={112} giro={8} />
              <Pelicula x={16} y={170} giro={6} />
              <Brilho cx={124} cy={168} t={5} />
              <Balde x={148} y={176} giro={12} />
              <Pipoca cx={104} cy={214} />
              <Brilho cx={224} cy={232} t={4} />
            </G>
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
});
