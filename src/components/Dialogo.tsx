import type { ReactNode } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raios, tipografia } from '@/theme';

interface DialogoProps {
  visivel: boolean;
  titulo: string;
  icone?: string;
  children?: ReactNode;
  /** Botões (componentes Botao). */
  acoes: ReactNode;
  /** Chamado pelo botão "voltar" do Android / Esc. Se omitido, o diálogo só fecha pelas ações. */
  aoFechar?: () => void;
}

/** Diálogo modal simples (funciona na web e no celular). */
export function Dialogo({ visivel, titulo, icone, children, acoes, aoFechar }: DialogoProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar ?? (() => undefined)}>
      <View style={estilos.fundo}>
        <View style={estilos.caixa} accessibilityViewIsModal aria-modal accessibilityRole="alert">
          {icone !== undefined && (
            <Text style={estilos.icone} aria-hidden>
              {icone}
            </Text>
          )}
          <Text style={estilos.titulo} accessibilityRole="header">
            {titulo}
          </Text>
          {children}
          <View style={estilos.acoes}>{acoes}</View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.sobreposicao, alignItems: 'center', justifyContent: 'center', padding: espacos.xl },
  caixa: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.xl,
    gap: espacos.md,
  },
  icone: { fontSize: 40, textAlign: 'center' },
  titulo: { ...tipografia.subtitulo, color: cores.texto, textAlign: 'center' },
  acoes: { gap: espacos.sm, marginTop: espacos.sm },
});
