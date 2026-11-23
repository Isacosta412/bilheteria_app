import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import QRCode from 'react-native-qrcode-svg';
import { chaves } from '@/api/chaves';
import { codigoDoErro, traduzirErro } from '@/api/client';
import { buscarReserva, cancelarReserva, pagarReserva } from '@/api/reservas';
import { Botao } from '@/components/Botao';
import { FaixaListrada } from '@/components/Cabecalho';
import { Carregando } from '@/components/Carregando';
import { useCortinaPipoca } from '@/components/CortinaPipoca';
import { Dialogo } from '@/components/Dialogo';
import { EstadoVazio } from '@/components/EstadoVazio';
import { FundoCinema } from '@/components/FundoCinema';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { useContagemRegressiva } from '@/hooks/useContagemRegressiva';
import { invalidarAposCompra } from '@/lib/invalidacoes';
import { formatarDiaHora, formatarPreco } from '@/lib/formatacao';
import { explicacaoReserva } from '@/lib/reserva';
import { AREA_TOQUE_MINIMA, LARGURA_MAXIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { Compra } from '@/types';

type Metodo = 'PIX' | 'CARTAO';

export default function Checkout() {
  const router = useRouter();
  const toast = useToast();
  const cortina = useCortinaPipoca();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ reservaId: string }>();
  const reservaId = Number(params.reservaId);
  const idValido = Number.isInteger(reservaId) && reservaId > 0;

  const [metodo, setMetodo] = useState<Metodo>('PIX');
  const [compra, setCompra] = useState<Compra | null>(null);
  const [expiradaPelaApi, setExpiradaPelaApi] = useState(false);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);

  const consulta = useQuery({ queryKey: chaves.reserva(reservaId), queryFn: () => buscarReserva(reservaId), enabled: idValido });
  const reserva = consulta.data;
  const contagem = useContagemRegressiva(reserva?.status === 'PENDENTE' && !compra ? reserva.expiraEm : undefined);

  const voltarAoMapa = async () => {
    if (!reserva) return;
    await invalidarAposCompra(queryClient, reserva.sessao.id);
    router.replace({ pathname: '/sessao/[id]', params: { id: String(reserva.sessao.id) } });
  };

  const pagamento = useMutation({
    mutationFn: () => pagarReserva(reservaId, metodo),
    onSuccess: (resultado) => {
      // Cortina de comemoração: a tela escurece, o balde estoura e, com tudo coberto, a tela de
      // "pagamento aprovado" entra por baixo (as listas são atualizadas nesse mesmo momento).
      cortina.mostrar({
        texto: 'Pagamento aprovado! 🍿',
        aoCobrir: () => {
          setCompra(resultado);
          void invalidarAposCompra(queryClient, resultado.reserva.sessao.id);
        },
      });
    },
    onError: async (erro) => {
      const codigo = codigoDoErro(erro);
      if (codigo === 'RESERVA_EXPIRADA') {
        setExpiradaPelaApi(true);
        return;
      }
      if (codigo === 'RESERVA_JA_PAGA') {
        await consulta.refetch();
        return;
      }
      toast.mostrar(traduzirErro(erro), 'erro');
    },
  });

  const cancelamento = useMutation({
    mutationFn: () => cancelarReserva(reservaId),
    onSuccess: async () => {
      setConfirmarCancelamento(false);
      toast.mostrar('Reserva cancelada. Os assentos foram liberados.', 'sucesso');
      await voltarAoMapa();
    },
    onError: (erro) => {
      setConfirmarCancelamento(false);
      toast.mostrar(traduzirErro(erro), 'erro');
      void consulta.refetch();
    },
  });

  // ─── Estados ───────────────────────────────────────────────────────────────
  if (!idValido || (isAxiosError(consulta.error) && consulta.error.response?.status === 404)) {
    return (
      <Tela centralizar>
        <EstadoVazio
          icone="🎟️"
          titulo="Reserva não encontrada"
          acao={{ titulo: 'Ver filmes em cartaz', onPress: () => router.replace('/') }}
        />
      </Tela>
    );
  }
  if (consulta.isPending) return <Carregando telaCheia mensagem="Carregando sua reserva…" />;
  if (consulta.error || !reserva) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />
      </Tela>
    );
  }

  // Pagou (agora, ou a reserva já estava paga)
  if (compra || reserva.status === 'PAGA') {
    const quantidade = compra?.ingressos.length ?? reserva.assentos.length;
    return (
      <View style={estilos.raiz}>
        <FundoCinema />
        <Tela centralizar>
          <View style={estilos.sucesso}>
            <Text style={estilos.sucessoSelo}>Pagamento aprovado</Text>
            <Text style={estilos.sucessoTitulo} accessibilityRole="header">
              Escolheu, pipocou, sentou.
            </Text>
            <View
              style={estilos.assentosPagos}
              accessible
              accessibilityLabel={`Assentos: ${reserva.assentos.map((x) => `fila ${x.fila}, assento ${x.numero}`).join('; ')}`}
            >
              {reserva.assentos.map((x) => (
                <Text key={`${x.fila}${x.numero}`} style={estilos.assentoPago}>
                  {x.fila}
                  {x.numero}
                </Text>
              ))}
            </View>
            <Text style={estilos.sucessoTexto}>
              {quantidade} {quantidade === 1 ? 'ingresso emitido' : 'ingressos emitidos'} para {reserva.sessao.filmeTitulo}.
            </Text>
            <Text style={estilos.sucessoTexto}>
              {formatarDiaHora(reserva.sessao.dataHora)} · {reserva.sessao.salaNome}
            </Text>
            <Botao
              titulo="Ver meus ingressos"
              onPress={() => {
                if (router.canDismiss()) router.dismissAll();
                router.navigate('/ingressos');
              }}
              estilo={estilos.sucessoBotao}
            />
          </View>
        </Tela>
      </View>
    );
  }

  if (reserva.status === 'CANCELADA') {
    return (
      <Tela centralizar>
        <EstadoVazio
          icone="🚫"
          titulo="Esta reserva foi cancelada"
          descricao="Os assentos foram liberados."
          acao={{ titulo: 'Escolher assentos novamente', onPress: () => void voltarAoMapa() }}
        />
      </Tela>
    );
  }

  const expirou = expiradaPelaApi || reserva.status === 'EXPIRADA' || contagem.expirou;
  const assentos = reserva.assentos.map((a) => `${a.fila}${a.numero}`).join(', ');

  return (
    <View style={estilos.raiz}>
      <FundoCinema />
      <ScrollView contentContainerStyle={estilos.rolagem}>
        <View style={estilos.conteudo}>
          {/* Contagem regressiva */}
          <View style={[estilos.cronometro, contagem.urgente && estilos.cronometroUrgente]}>
            <FaixaListrada altura={6} estilo={estilos.faixaTopo} />
            <Text style={estilos.cronometroRotulo}>Tempo para pagar</Text>
            <Text
              style={[estilos.cronometroTempo, contagem.urgente && estilos.textoUrgente]}
              accessibilityLabel={`Restam ${contagem.minutos} minutos`}
            >
              {contagem.texto}
            </Text>
            {/* anuncia só a cada minuto (não a cada segundo) */}
            <Text style={estilos.oculto} accessibilityLiveRegion="polite" aria-live="polite">
              {contagem.urgente ? 'Menos de 1 minuto para pagar' : `${contagem.minutos} minutos restantes`}
            </Text>
            {!expirou && reserva.assentos.length > 0 && <Text style={estilos.cronometroExplicacao}>{explicacaoReserva(reserva)}</Text>}
          </View>

          {/* Resumo (tudo vindo da API) */}
          <View style={estilos.cartao}>
            <Text style={estilos.filme} accessibilityRole="header">
              {reserva.sessao.filmeTitulo}
            </Text>
            <Text style={estilos.detalhe}>
              {formatarDiaHora(reserva.sessao.dataHora)} · {reserva.sessao.salaNome}
            </Text>
            <Text style={estilos.detalhe}>
              {reserva.assentos.length === 1 ? 'Assento' : 'Assentos'}: <Text style={estilos.destaque}>{assentos}</Text>
            </Text>
            <View style={estilos.totalLinha}>
              <Text style={estilos.totalRotulo}>Total</Text>
              <Text style={estilos.totalValor}>{formatarPreco(reserva.total)}</Text>
            </View>
          </View>

          {/* Forma de pagamento */}
          <Text style={estilos.secao} accessibilityRole="header">
            Forma de pagamento
          </Text>
          <View style={estilos.metodos} accessibilityRole="radiogroup">
            {(['PIX', 'CARTAO'] as const).map((m) => {
              const ativo = metodo === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMetodo(m)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: ativo }}
                  style={[estilos.metodo, ativo && estilos.metodoAtivo]}
                >
                  <Text style={[estilos.metodoTexto, ativo && estilos.metodoTextoAtivo]}>{m === 'PIX' ? 'PIX' : 'Cartão'}</Text>
                </Pressable>
              );
            })}
          </View>

          {metodo === 'PIX' ? (
            <View style={estilos.cartao}>
              <View style={estilos.qr} accessibilityLabel="QR code PIX de demonstração">
                <QRCode
                  value={`PIX-SIMULADO-BILHETERIA-${reserva.reservaId}`}
                  size={168}
                  backgroundColor={cores.qr.fundo}
                  color={cores.qr.tinta}
                />
              </View>
              <Text style={estilos.legendaQr}>QR de demonstração – nenhum valor é cobrado.</Text>
            </View>
          ) : (
            <View style={estilos.avisoCartao} accessibilityRole="alert">
              <Text style={estilos.avisoTitulo}>⚠ Pagamento simulado – não digite dados reais</Text>
              <Text style={estilos.avisoTexto}>Este é um trabalho acadêmico: nenhum dado de cartão é pedido nem cobrado.</Text>
            </View>
          )}

          <Botao
            titulo={metodo === 'PIX' ? 'Já paguei' : 'Pagar'}
            onPress={() => pagamento.mutate()}
            carregando={pagamento.isPending}
            desabilitado={expirou || cancelamento.isPending}
            accessibilityLabel={`${metodo === 'PIX' ? 'Já paguei' : 'Pagar'} ${formatarPreco(reserva.total)}`}
          />
          <Botao
            titulo="Cancelar reserva"
            variante="texto"
            onPress={() => setConfirmarCancelamento(true)}
            desabilitado={pagamento.isPending || expirou}
          />
        </View>
      </ScrollView>

      <Dialogo
        visivel={confirmarCancelamento}
        titulo="Cancelar a reserva?"
        icone="🪑"
        aoFechar={() => setConfirmarCancelamento(false)}
        acoes={
          <>
            <Botao titulo="Sim, cancelar" onPress={() => cancelamento.mutate()} carregando={cancelamento.isPending} />
            <Botao titulo="Voltar" variante="texto" onPress={() => setConfirmarCancelamento(false)} />
          </>
        }
      >
        <Text style={estilos.dialogoTexto}>Os assentos {assentos} serão liberados para outras pessoas.</Text>
      </Dialogo>

      <Dialogo
        visivel={expirou}
        titulo="Tempo esgotado"
        icone="⌛"
        acoes={<Botao titulo="Escolher novamente" onPress={() => void voltarAoMapa()} />}
      >
        <Text style={estilos.dialogoTexto}>Sua reserva expirou e os assentos foram liberados.</Text>
      </Dialogo>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { paddingBottom: espacos.xxl },
  conteudo: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: espacos.lg, gap: espacos.lg },
  cronometro: {
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: espacos.lg,
    paddingTop: espacos.lg + 6,
    overflow: 'hidden',
  },
  faixaTopo: { position: 'absolute', top: 0, left: 0, right: 0 },
  cronometroUrgente: { borderColor: cores.erro, backgroundColor: cores.fundoErro },
  cronometroRotulo: { ...tipografia.legenda, color: cores.textoSecundario, textTransform: 'uppercase', letterSpacing: 1 },
  cronometroTempo: { fontSize: 48, fontWeight: '800', color: cores.texto, fontVariant: ['tabular-nums'] },
  cronometroExplicacao: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.sm,
    paddingHorizontal: espacos.lg,
    maxWidth: 440,
  },
  textoUrgente: { color: cores.erro },
  oculto: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.xs,
  },
  filme: { ...tipografia.subtitulo, color: cores.texto },
  detalhe: { ...tipografia.corpo, color: cores.textoSecundario },
  destaque: { color: cores.texto, fontWeight: '700' },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: espacos.md,
    paddingTop: espacos.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  totalRotulo: { ...tipografia.corpoForte, color: cores.texto },
  totalValor: { ...tipografia.titulo, color: cores.primaria },
  secao: { ...tipografia.corpoForte, color: cores.texto },
  metodos: { flexDirection: 'row', gap: espacos.sm },
  metodo: {
    flex: 1,
    minHeight: AREA_TOQUE_MINIMA,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
  },
  metodoAtivo: { borderColor: cores.primaria, backgroundColor: cores.superficieElevada },
  metodoTexto: { ...tipografia.corpoForte, color: cores.textoSecundario },
  metodoTextoAtivo: { color: cores.texto },
  qr: { alignSelf: 'center', padding: espacos.md, backgroundColor: cores.qr.fundo, borderRadius: raios.md },
  legendaQr: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center', marginTop: espacos.sm },
  avisoCartao: {
    backgroundColor: cores.aviso,
    borderRadius: raios.lg,
    padding: espacos.lg,
    gap: espacos.xs,
  },
  avisoTitulo: { ...tipografia.corpoForte, color: cores.sobreAviso },
  avisoTexto: { ...tipografia.corpo, color: cores.sobreAviso },
  dialogoTexto: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  sucesso: { width: '100%', maxWidth: LARGURA_MAXIMA / 2, alignSelf: 'center', alignItems: 'center', gap: espacos.md },
  sucessoSelo: {
    ...tipografia.legenda,
    fontWeight: '700',
    color: cores.sobreSucesso,
    backgroundColor: cores.sucesso,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.xs,
    borderRadius: raios.lg,
    overflow: 'hidden',
  },
  assentosPagos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espacos.sm },
  assentoPago: {
    ...tipografia.corpoForte,
    color: cores.sobrePrimaria,
    backgroundColor: cores.primaria,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.xs,
    borderRadius: raios.md,
    overflow: 'hidden',
  },
  sucessoTitulo: { ...tipografia.titulo, color: cores.texto, textAlign: 'center' },
  sucessoTexto: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  sucessoBotao: { marginTop: espacos.lg, alignSelf: 'stretch' },
});
