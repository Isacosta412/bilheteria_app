import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { AssentoMapa } from '@/types';
import { DESCRICAO_ESTADO, ICONE_TIPO, VISUAL, estadoVisual } from './visual';

interface AssentoProps {
  assento: AssentoMapa;
  fila: string;
  selecionado: boolean;
  tamanho: number;
  /** Já há o máximo de assentos selecionados (só afeta a dica de acessibilidade). */
  limiteAtingido: boolean;
  onAlternar: (assentoId: number) => void;
  /** Editor de sala: o toque marca/desmarca PCD (os VIP existentes ficam fixos). */
  editor?: boolean;
}

function AssentoBase({ assento, fila, selecionado, tamanho, limiteAtingido, onAlternar, editor = false }: AssentoProps) {
  const pcd = assento.tipo === 'PCD';
  const estado = editor ? (pcd ? 'selecionado' : 'livre') : estadoVisual(assento, selecionado);
  const visual = VISUAL[estado];
  const livre = editor ? assento.tipo !== 'VIP' : assento.status === 'LIVRE';
  const tipo = assento.tipo === 'PADRAO' ? '' : `, ${pcd ? 'para pessoa com deficiência' : 'VIP'}`;
  // Ícone de estado tem prioridade; no assento livre aparece o ícone do tipo (♿ PCD, ★ VIP).
  // No editor, o PCD marcado mostra ♿ (e não ✓).
  const icone = editor ? ICONE_TIPO[assento.tipo] : visual.icone || ICONE_TIPO[assento.tipo];
  const rotulo = editor
    ? `Fila ${fila}, assento ${assento.numero}, ${pcd ? 'PCD' : assento.tipo === 'VIP' ? 'VIP' : 'comum'}`
    : `Fila ${fila}, assento ${assento.numero}, ${DESCRICAO_ESTADO[estado]}${tipo}`;
  let dica: string | undefined;
  if (editor) dica = livre ? (pcd ? 'Toque para tornar comum' : 'Toque para marcar como PCD') : undefined;
  else if (livre && !selecionado && limiteAtingido) dica = 'Limite de 10 assentos atingido';
  const marcado = editor ? pcd : selecionado;

  return (
    <Pressable
      onPress={() => onAlternar(assento.assentoId)}
      disabled={!livre}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado, disabled: !livre }}
      aria-checked={marcado}
      aria-disabled={!livre}
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      hitSlop={2}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        estilos.assento,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: Math.max(4, tamanho * 0.22),
          borderTopLeftRadius: tamanho * 0.4,
          borderTopRightRadius: tamanho * 0.4,
          backgroundColor: visual.fundo,
          borderColor: visual.borda,
          borderWidth: estado === 'minhaReserva' ? 2.5 : 1.5,
        },
        livre && (pressed || hovered) && estilos.destacado,
      ]}
    >
      {icone !== '' && (
        <Text style={[estilos.icone, { color: visual.corIcone, fontSize: tamanho * 0.5 }]} aria-hidden>
          {icone}
        </Text>
      )}
    </Pressable>
  );
}

/** Memoizado: um mapa tem centenas de assentos e só os que mudam re-renderizam. */
export const Assento = memo(
  AssentoBase,
  (a, b) =>
    a.assento.assentoId === b.assento.assentoId &&
    a.assento.status === b.assento.status &&
    a.assento.minhaReserva === b.assento.minhaReserva &&
    a.assento.tipo === b.assento.tipo &&
    a.selecionado === b.selecionado &&
    a.tamanho === b.tamanho &&
    a.limiteAtingido === b.limiteAtingido &&
    a.editor === b.editor &&
    a.onAlternar === b.onAlternar,
);

const estilos = StyleSheet.create({
  assento: { alignItems: 'center', justifyContent: 'center' },
  destacado: { transform: [{ scale: 1.08 }], opacity: 0.9 },
  icone: { fontWeight: '800' },
});
