import type { TextStyle } from 'react-native';

export const tipografia = {
  titulo: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitulo: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  corpo: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  corpoForte: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  legenda: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  botao: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
} satisfies Record<string, TextStyle>;
