import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chaves } from '@/api/chaves';
import { codigoDoErro, traduzirErro } from '@/api/client';
import { listarMinhasReservas, reservar } from '@/api/reservas';
import { Botao } from '@/components/Botao';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { FundoCinema } from '@/components/FundoCinema';
import { MapaAssentos } from '@/components/MapaAssentos';
import { MensagemErro } from '@/components/MensagemErro';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { useMapaAssentos } from '@/hooks/useMapaAssentos';
import { useSelecaoAssentos } from '@/hooks/useSelecaoAssentos';
import { invalidarAposCompra } from '@/lib/invalidacoes';
import { descreverVersao } from '@/lib/sessao';
import { formatarDiaHora, formatarPreco } from '@/lib/formatacao';
import { mensagemReservaFeita } from '@/lib/reserva';
import { LARGURA_MAXIMA, cores, espacos, raios, tipografia } from '@/theme';

export default function TelaSessao() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const sessaoId = Number(params.id);
  const idValido = Number.isInteger(sessaoId) && sessaoId > 0;

  const mapaQuery = useMapaAssentos(sessaoId, idValido);
  const mapa = mapaQuery.data;

  // ─── Seleção (lógica compartilhada com o balcão) ──────────────────────────
  const { selecionados, nomesSelecionados, alternar, limpar, marcarConflito } = useSelecaoAssentos(mapa);

  // ─── Reserva pendente do próprio usuário nesta sessão ──────────────────────
  const temMinhaReserva = mapa?.filas.some((f) => f.assentos.some((a) => a.minhaReserva)) ?? false;
  const minhasQuery = useQuery({
    queryKey: chaves.reservasMinhas(),
    queryFn: listarMinhasReservas,
    enabled: temMinhaReserva,
  });
  const reservaPendente = minhasQuery.data?.find((r) => r.sessao.id === sessaoId && r.status === 'PENDENTE');

  // ─── Reservar ──────────────────────────────────────────────────────────────
  const reservaMutation = useMutation({
    mutationFn: () => reservar({ sessaoId, assentoIds: selecionados }),
    onSuccess: async (reserva) => {
      // Limpa a seleção ANTES de recarregar o mapa: os assentos que a própria pessoa reservou
      // deixam de estar livres e não podem disparar o aviso de "reservado por outra pessoa".
      limpar();
      toast.mostrar(mensagemReservaFeita(reserva), 'sucesso');
      await invalidarAposCompra(queryClient, sessaoId);
      router.replace({ pathname: '/checkout/[reservaId]', params: { reservaId: String(reserva.reservaId) } });
    },
    onError: (erro) => {
      const codigo = codigoDoErro(erro);
      if (codigo === 'ASSENTO_INDISPONIVEL') {
        // CLAUDE.md: mostra a mensagem, recarrega o mapa e mantém os demais selecionados.
        marcarConflito();
        toast.mostrar(traduzirErro(erro), 'aviso');
        void mapaQuery.refetch();
        return;
      }
      if (codigo === 'RESERVA_PENDENTE_EXISTENTE') {
        void mapaQuery.refetch();
        void queryClient.invalidateQueries({ queryKey: chaves.reservasMinhas() });
      }
      toast.mostrar(traduzirErro(erro), 'erro');
    },
  });

  // ─── Estados da tela ───────────────────────────────────────────────────────
  if (!idValido || (isAxiosError(mapaQuery.error) && mapaQuery.error.response?.status === 404)) {
    return (
      <Tela centralizar>
        <EstadoVazio icone="🎞️" titulo="Sessão não encontrada" acao={{ titulo: 'Ver filmes em cartaz', onPress: () => router.replace('/') }} />
      </Tela>
    );
  }
  if (mapaQuery.isPending) {
    return (
      <Tela>
        <Esqueleto altura={60} estilo={{ marginBottom: espacos.xl }} />
        <Esqueleto largura="80%" altura={20} estilo={{ alignSelf: 'center', marginBottom: espacos.xl }} />
        {Array.from({ length: 6 }, (_, i) => (
          <Esqueleto key={i} altura={28} estilo={{ marginBottom: espacos.sm }} />
        ))}
      </Tela>
    );
  }
  if (mapaQuery.error || !mapa) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(mapaQuery.error)} aoTentarNovamente={() => void mapaQuery.refetch()} />
      </Tela>
    );
  }

  const { sessao } = mapa;
  const quantidade = selecionados.length;
  const previa = formatarPreco(Number(sessao.preco) * quantidade);
  const esgotada = mapa.resumo.livres === 0;

  return (
    <View style={estilos.raiz}>
      <FundoCinema />
      <ScrollView contentContainerStyle={estilos.rolagem}>
        <View style={estilos.conteudo}>
          <View style={estilos.cabecalho}>
            <View style={estilos.linha}>
              <SeloClassificacao classificacao={sessao.filme.classificacao} />
              <Text style={estilos.titulo} accessibilityRole="header" numberOfLines={2}>
                {sessao.filme.titulo}
              </Text>
            </View>
            <Text style={estilos.detalhe}>
              {formatarDiaHora(sessao.dataHora)} · {sessao.sala.nome} · {descreverVersao(sessao)}
            </Text>
            <Text style={estilos.detalhe}>
              Inteira {formatarPreco(sessao.preco)} · Meia {formatarPreco(sessao.precoMeia)}
            </Text>
          </View>

          {reservaPendente && (
            <View style={estilos.banner} accessibilityRole="alert">
              <Text style={estilos.bannerTexto}>⏱ Você tem uma reserva pendente nesta sessão.</Text>
              <Botao
                titulo="Continuar pagamento"
                variante="secundaria"
                onPress={() =>
                  router.push({ pathname: '/checkout/[reservaId]', params: { reservaId: String(reservaPendente.reservaId) } })
                }
              />
            </View>
          )}

          {esgotada && (
            <View style={estilos.banner}>
              <Text style={estilos.bannerTexto}>Sessão esgotada no momento. Reservas que expirarem liberam lugares.</Text>
            </View>
          )}

          <MapaAssentos mapa={mapa} selecionados={selecionados} onAlternar={alternar} />
        </View>
      </ScrollView>

      {/* Rodapé fixo: resumo da seleção (prévia) + Reservar */}
      <View style={[estilos.rodape, { paddingBottom: insets.bottom + espacos.md }]}>
        <View style={estilos.rodapeConteudo}>
          <View style={estilos.resumo} accessibilityLiveRegion="polite" aria-live="polite">
            {quantidade === 0 ? (
              <Text style={estilos.resumoVazio}>Toque nos assentos livres para escolher.</Text>
            ) : (
              <>
                <Text style={estilos.resumoTexto} numberOfLines={1}>
                  {quantidade} {quantidade === 1 ? 'assento' : 'assentos'} · {nomesSelecionados}
                </Text>
                <Text style={estilos.resumoPreco}>
                  {previa} <Text style={estilos.previa}>(prévia em inteira; a meia-entrada você escolhe na próxima tela)</Text>
                </Text>
              </>
            )}
          </View>
          <Botao
            titulo="Reservar"
            onPress={() => reservaMutation.mutate()}
            carregando={reservaMutation.isPending}
            desabilitado={quantidade === 0}
            accessibilityLabel={quantidade > 0 ? `Reservar ${quantidade} assentos: ${nomesSelecionados}` : 'Reservar'}
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { paddingBottom: espacos.xxl },
  conteudo: { width: '100%', maxWidth: LARGURA_MAXIMA, alignSelf: 'center', padding: espacos.lg, gap: espacos.lg },
  cabecalho: { gap: espacos.xs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.texto, flexShrink: 1 },
  detalhe: { ...tipografia.corpo, color: cores.textoSecundario },
  banner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderColor: cores.aviso,
    borderWidth: 1,
    borderRadius: raios.md,
    padding: espacos.md,
  },
  bannerTexto: { ...tipografia.corpo, color: cores.texto, flexShrink: 1 },
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
  resumo: { flex: 1 },
  resumoVazio: { ...tipografia.corpo, color: cores.textoSecundario },
  resumoTexto: { ...tipografia.corpoForte, color: cores.texto },
  resumoPreco: { ...tipografia.corpoForte, color: cores.primaria },
  previa: { ...tipografia.legenda, color: cores.textoSecundario, fontWeight: '400' },
});
