import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { StatusIngresso } from '@/types';

/**
 * Selo de status do ingresso: bolinha + texto (nunca só cor).
 * Contraste: Válido = texto escuro sobre verde (10,5:1); Utilizado = texto claro sobre cinza (7,8:1).
 */
const ESTILO: Record<StatusIngresso, { rotulo: string; fundo: string; borda: string; texto: string; bolinha: string }> = {
  VALIDO: { rotulo: 'Válido', fundo: cores.sucesso, borda: cores.sucesso, texto: cores.sobreSucesso, bolinha: cores.sobreSucesso },
  UTILIZADO: { rotulo: 'Utilizado', fundo: cores.assento.vendido, borda: cores.assento.vendido, texto: cores.texto, bolinha: cores.texto },
  SESSAO_ENCERRADA: {
    rotulo: 'Sessão encerrada',
    fundo: 'transparent',
    borda: cores.bordaInterativa,
    texto: cores.textoSecundario,
    bolinha: cores.textoSecundario,
  },
};

export const ROTULO_STATUS_INGRESSO: Record<StatusIngresso, string> = {
  VALIDO: 'válido',
  UTILIZADO: 'utilizado',
  SESSAO_ENCERRADA: 'sessão encerrada',
};

export function SeloStatusIngresso({ status, centralizado = false }: { status: StatusIngresso; centralizado?: boolean }) {
  const e = ESTILO[status];
  return (
    <View style={[estilos.selo, { backgroundColor: e.fundo, borderColor: e.borda }, centralizado && estilos.centralizado]}>
      <View style={[estilos.bolinha, { backgroundColor: status === 'SESSAO_ENCERRADA' ? 'transparent' : e.bolinha, borderColor: e.bolinha }]} />
      <Text style={[estilos.texto, { color: e.texto }]}>{e.rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: 2,
    borderRadius: raios.pilula,
    borderWidth: 1,
  },
  centralizado: { alignSelf: 'center' },
  bolinha: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  texto: { ...tipografia.legenda, fontWeight: '700' },
});
