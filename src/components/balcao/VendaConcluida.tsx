import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { IngressoEmitido } from '@/components/IngressoEmitido';
import { emCentavos } from '@/lib/dinheiro';
import { formatarPreco } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { Compra, MetodoPagamento } from '@/types';

const ROTULO_METODO: Record<MetodoPagamento, string> = { DINHEIRO: 'Dinheiro', CARTAO: 'Cartão', PIX: 'PIX' };

/**
 * CSS de impressão (só na web): imprime apenas a área dos ingressos, em fundo branco,
 * sem quebrar um ingresso no meio da página.
 */
const CSS_IMPRESSAO = `
@media print {
  @page { margin: 12mm; }
  html, body { background: ${cores.impressao.papel} !important; }
  body * { visibility: hidden !important; }
  #area-impressao, #area-impressao * { visibility: visible !important; color: ${cores.impressao.tinta} !important; }
  #area-impressao { position: absolute; left: 0; top: 0; width: 100%; background: ${cores.impressao.papel} !important; }
  [id^="ingresso-impresso"] { break-inside: avoid; page-break-inside: avoid; margin-bottom: 8mm; }
}`;

function useCssDeImpressao() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('estilo-impressao-ingressos')) return;
    const estilo = document.createElement('style');
    estilo.id = 'estilo-impressao-ingressos';
    estilo.textContent = CSS_IMPRESSAO;
    document.head.appendChild(estilo);
  }, []);
}

interface VendaConcluidaProps {
  compra: Compra;
  metodo: MetodoPagamento;
  recebidoCentavos: number | null;
  aoNovaVendaMesmaSessao: () => void;
  aoOutraSessao: () => void;
}

/** Etapa final do balcão: ingressos emitidos (QR + código), troco, nova venda e impressão. */
export function VendaConcluida({ compra, metodo, recebidoCentavos, aoNovaVendaMesmaSessao, aoOutraSessao }: VendaConcluidaProps) {
  useCssDeImpressao();
  const totalCentavos = emCentavos(compra.reserva.total);
  const troco = recebidoCentavos !== null && recebidoCentavos > totalCentavos ? recebidoCentavos - totalCentavos : null;
  const web = Platform.OS === 'web';

  return (
    <View style={estilos.raiz}>
      <View style={estilos.cabecalho} accessibilityLiveRegion="polite" aria-live="polite">
        <Text style={estilos.titulo} accessibilityRole="header">
          ✓ Venda concluída
        </Text>
        <Text style={estilos.resumo}>
          {ROTULO_METODO[metodo]} · {formatarPreco(compra.reserva.total)} · {compra.ingressos.length}{' '}
          {compra.ingressos.length === 1 ? 'ingresso' : 'ingressos'}
          {compra.reserva.nomeComprador ? ` · ${compra.reserva.nomeComprador}` : ''}
        </Text>
        {troco !== null && <Text style={estilos.troco}>Troco: {formatarPreco(troco / 100)}</Text>}
      </View>

      <View style={estilos.acoes}>
        <Botao titulo="Nova venda nesta sessão" onPress={aoNovaVendaMesmaSessao} estilo={estilos.acao} />
        <Botao titulo="Outra sessão" variante="secundaria" onPress={aoOutraSessao} estilo={estilos.acao} />
        {web && (
          <Botao
            titulo="Imprimir"
            variante="secundaria"
            onPress={() => globalThis.print?.()}
            accessibilityLabel="Imprimir os ingressos"
            estilo={estilos.acao}
          />
        )}
      </View>

      <View nativeID="area-impressao" style={estilos.ingressos}>
        {compra.ingressos.map((ingresso, i) => (
          <IngressoEmitido key={ingresso.codigo} ingresso={ingresso} indice={i} />
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { gap: espacos.lg },
  cabecalho: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.sucesso,
    padding: espacos.lg,
    gap: espacos.xs,
  },
  titulo: { ...tipografia.subtitulo, color: cores.sucesso },
  resumo: { ...tipografia.corpo, color: cores.texto },
  troco: { ...tipografia.subtitulo, color: cores.texto },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
  acao: { flexGrow: 1 },
  ingressos: { gap: espacos.md },
});
