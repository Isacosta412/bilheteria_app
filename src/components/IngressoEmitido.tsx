import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { formatarCodigo, formatarDiaHora, soletrarCodigo } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { Ingresso } from '@/types';

/** "Papel" claro e tinta escura: contraste máximo para o QR e boa impressão. */
const PAPEL = cores.ingresso.papel;
const TINTA = cores.ingresso.tinta;
const TINTA_SECUNDARIA = cores.ingresso.tintaSecundaria;

/** Ingresso compacto (balcão): QR + código + dados. Também é o bloco impresso na web. */
export function IngressoEmitido({ ingresso, indice }: { ingresso: Ingresso; indice: number }) {
  return (
    <View style={estilos.cartao} nativeID={`ingresso-impresso-${indice}`}>
      <View style={estilos.qr} accessible accessibilityRole="image" accessibilityLabel={`QR code do ingresso ${ingresso.fila}${ingresso.numero}`}>
        <QRCode value={ingresso.codigo} size={132} backgroundColor={cores.qr.fundo} color={cores.qr.tinta} />
      </View>
      <View style={estilos.info}>
        <Text style={estilos.filme} numberOfLines={2}>
          {ingresso.filme.titulo}
        </Text>
        <Text style={estilos.detalhe}>{formatarDiaHora(ingresso.dataHora)}</Text>
        <Text style={estilos.detalhe}>
          {ingresso.sala.nome} · Fila {ingresso.fila} · Assento {ingresso.numero}
        </Text>
        <Text style={estilos.codigo} selectable accessibilityLabel={`Código ${soletrarCodigo(ingresso.codigo)}`}>
          {formatarCodigo(ingresso.codigo)}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacos.lg,
    backgroundColor: PAPEL,
    borderRadius: raios.lg,
    padding: espacos.lg,
    borderWidth: 1,
    borderColor: cores.ingresso.borda,
  },
  qr: { padding: espacos.xs, backgroundColor: cores.qr.fundo },
  info: { flex: 1, minWidth: 180, gap: 2 },
  filme: { ...tipografia.corpoForte, fontSize: 18, color: TINTA },
  detalhe: { ...tipografia.corpo, color: TINTA_SECUNDARIA, textTransform: 'capitalize' },
  codigo: { fontSize: 22, fontWeight: '800', letterSpacing: 3, color: TINTA, marginTop: espacos.sm, fontFamily: 'monospace' },
});
