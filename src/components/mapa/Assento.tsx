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
}

function AssentoBase({ assento, fila, selecionado, tamanho, limiteAtingido, onAlternar }: AssentoProps) {
  const estado = estadoVisual(assento, selecionado);
  const visual = VISUAL[estado];
  const livre = assento.status === 'LIVRE';
  const tipo = assento.tipo === 'PADRAO' ? '' : `, ${assento.tipo === 'PCD' ? 'para pessoa com deficiência' : 'VIP'}`;
  // Ícone de estado tem prioridade; no assento livre aparece o ícone do tipo (♿ PCD, ★ VIP).
  const icone = visual.icone || ICONE_TIPO[assento.tipo];

  return (
    <Pressable
      onPress={() => onAlternar(assento.assentoId)}
      disabled={!livre}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selecionado, disabled: !livre }}
      aria-checked={selecionado}
      aria-disabled={!livre}
      accessibilityLabel={`Fila ${fila}, assento ${assento.numero}, ${DESCRICAO_ESTADO[estado]}${tipo}`}
      accessibilityHint={livre && !selecionado && limiteAtingido ? 'Limite de 10 assentos atingido' : undefined}
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
    a.onAlternar === b.onAlternar,
);

const estilos = StyleSheet.create({
  assento: { alignItems: 'center', justifyContent: 'center' },
  destacado: { transform: [{ scale: 1.08 }], opacity: 0.9 },
  icone: { fontWeight: '800' },
});
