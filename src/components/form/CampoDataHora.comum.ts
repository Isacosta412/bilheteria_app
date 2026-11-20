import { StyleSheet } from 'react-native';
import { cores, espacos, tipografia } from '@/theme';

/** Compartilhado entre CampoDataHora.tsx (celular) e CampoDataHora.web.tsx. */
export interface CampoDataHoraProps {
  rotulo: string;
  valor: Date | null;
  /** null enquanto a data/hora digitada estiver incompleta ou inválida. */
  aoMudar: (valor: Date | null) => void;
  erro?: string;
}

export const estilosCampoDataHora = StyleSheet.create({
  container: { gap: espacos.xs, marginBottom: espacos.lg },
  rotulo: { ...tipografia.corpoForte, color: cores.texto },
  erro: { ...tipografia.legenda, color: cores.erro },
});
