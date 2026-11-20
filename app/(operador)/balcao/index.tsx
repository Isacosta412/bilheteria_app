import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { venderNoBalcao } from '@/api/balcao';
import { codigoDoErro, traduzirErro } from '@/api/client';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { EscolhaSessao } from '@/components/balcao/EscolhaSessao';
import { IndicadorEtapas } from '@/components/balcao/IndicadorEtapas';
import { PagamentoBalcao, type ConfirmacaoBalcao } from '@/components/balcao/PagamentoBalcao';
import { VendaConcluida } from '@/components/balcao/VendaConcluida';
import { MapaAssentos } from '@/components/MapaAssentos';
import { MensagemErro } from '@/components/MensagemErro';
import { useToast } from '@/components/Toast';
import { useMapaAssentos } from '@/hooks/useMapaAssentos';
import { useSelecaoAssentos } from '@/hooks/useSelecaoAssentos';
import { formatarDiaHora, formatarPreco } from '@/lib/formatacao';
import { invalidarAposCompra } from '@/lib/invalidacoes';
import { LARGURA_MAXIMA, cores, espacos, tipografia } from '@/theme';
import type { Compra, MetodoPagamento, Sessao } from '@/types';

type Etapa = 'sessao' | 'assentos' | 'pagamento' | 'concluida';
const INDICE: Record<Etapa, number> = { sessao: 0, assentos: 1, pagamento: 2, concluida: 3 };

/**
 * Bilheteria (venda presencial), em etapas numa única tela para ser rápida:
 * 1 sessão → 2 assentos (MapaAssentos, o mesmo do cliente) → 3 pagamento → ingressos emitidos.
 */
export default function Bilheteria() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [etapa, setEtapa] = useState<Etapa>('sessao');
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [venda, setVenda] = useState<{ compra: Compra; metodo: MetodoPagamento; recebidoCentavos: number | null } | null>(null);

  const sessaoId = sessao?.id ?? 0;
  const mapaQuery = useMapaAssentos(sessaoId, sessao !== null && (etapa === 'assentos' || etapa === 'pagamento'));
  const mapa = mapaQuery.data;
  const { selecionados, nomesSelecionados, alternar, limpar, marcarConflito } = useSelecaoAssentos(mapa);

  const vendaMutation = useMutation({
    mutationFn: (dados: ConfirmacaoBalcao) =>
      venderNoBalcao({ sessaoId, assentoIds: selecionados, metodo: dados.metodo, nomeComprador: dados.nomeComprador }),
    onSuccess: async (compra, dados) => {
      setVenda({ compra, metodo: dados.metodo, recebidoCentavos: dados.recebidoCentavos });
      setEtapa('concluida');
      limpar();
      await invalidarAposCompra(queryClient, sessaoId);
    },
    onError: (erro) => {
      if (codigoDoErro(erro) === 'ASSENTO_INDISPONIVEL') {
        // Igual ao cliente: avisa, recarrega o mapa e volta para a escolha mantendo os demais.
        marcarConflito();
        toast.mostrar(traduzirErro(erro), 'aviso');
        setEtapa('assentos');
        void mapaQuery.refetch();
        return;
      }
      toast.mostrar(traduzirErro(erro), 'erro');
    },
  });

  function escolherSessao(nova: Sessao) {
    limpar();
    setSessao(nova);
    setEtapa('assentos');
  }

  function voltar() {
    if (etapa === 'pagamento') setEtapa('assentos');
    else if (etapa === 'assentos') {
      limpar();
      setSessao(null);
      setEtapa('sessao');
    }
  }

  const quantidade = selecionados.length;
  const sessaoAtual = mapa?.sessao ?? sessao;

  return (
    <View style={estilos.raiz}>
      <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled">
        <View style={estilos.conteudo}>
          <View style={estilos.topo}>
            {(etapa === 'assentos' || etapa === 'pagamento') && (
              <Pressable onPress={voltar} accessibilityRole="button" accessibilityLabel="Voltar para a etapa anterior" hitSlop={8} style={estilos.voltar}>
                <Text style={estilos.voltarTexto}>‹ Voltar</Text>
              </Pressable>
            )}
            <IndicadorEtapas atual={Math.min(INDICE[etapa], 2)} />
          </View>

          {sessaoAtual && etapa !== 'sessao' && (
            <Text style={estilos.sessaoResumo}>
              {sessaoAtual.filme.titulo} · {formatarDiaHora(sessaoAtual.dataHora)} · {sessaoAtual.sala.nome}
            </Text>
          )}

          {etapa === 'sessao' && <EscolhaSessao aoEscolher={escolherSessao} />}

          {etapa === 'assentos' &&
            (mapaQuery.isPending ? (
              <Carregando mensagem="Carregando mapa…" />
            ) : mapaQuery.error || !mapa ? (
              <MensagemErro mensagem={traduzirErro(mapaQuery.error)} aoTentarNovamente={() => void mapaQuery.refetch()} />
            ) : (
              <MapaAssentos mapa={mapa} selecionados={selecionados} onAlternar={alternar} />
            ))}

          {etapa === 'pagamento' && mapa && (
            <PagamentoBalcao
              quantidade={quantidade}
              nomesAssentos={nomesSelecionados}
              precoUnitario={mapa.sessao.preco}
              carregando={vendaMutation.isPending}
              aoConfirmar={(dados) => vendaMutation.mutate(dados)}
            />
          )}

          {etapa === 'concluida' && venda && (
            <VendaConcluida
              compra={venda.compra}
              metodo={venda.metodo}
              recebidoCentavos={venda.recebidoCentavos}
              aoNovaVendaMesmaSessao={() => {
                setVenda(null);
                setEtapa('assentos');
              }}
              aoOutraSessao={() => {
                setVenda(null);
                setSessao(null);
                setEtapa('sessao');
              }}
            />
          )}
        </View>
      </ScrollView>

      {etapa === 'assentos' && mapa && (
        <View style={[estilos.rodape, { paddingBottom: insets.bottom + espacos.md }]}>
          <View style={estilos.rodapeConteudo}>
            <Text style={estilos.rodapeTexto} numberOfLines={1} accessibilityLiveRegion="polite" aria-live="polite">
              {quantidade === 0
                ? 'Toque nos assentos livres.'
                : `${quantidade} · ${nomesSelecionados} · ${formatarPreco(Number(mapa.sessao.preco) * quantidade)}`}
            </Text>
            <Botao titulo="Continuar" onPress={() => setEtapa('pagamento')} desabilitado={quantidade === 0} />
          </View>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1, paddingBottom: espacos.xxl },
  conteudo: { flex: 1, width: '100%', maxWidth: LARGURA_MAXIMA, alignSelf: 'center', padding: espacos.lg, gap: espacos.lg },
  topo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: espacos.lg },
  voltar: { minHeight: 36, justifyContent: 'center' },
  voltarTexto: { ...tipografia.corpoForte, color: cores.primaria },
  sessaoResumo: { ...tipografia.corpoForte, color: cores.textoSecundario, textTransform: 'none' },
  rodape: { backgroundColor: cores.superficie, borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: espacos.md },
  rodapeConteudo: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: espacos.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
  },
  rodapeTexto: { ...tipografia.corpoForte, color: cores.texto, flex: 1 },
});
