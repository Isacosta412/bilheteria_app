import { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import QRCode from 'react-native-qrcode-svg';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { buscarIngresso } from '@/api/ingressos';
import { Carregando } from '@/components/Carregando';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { SeloStatusIngresso } from '@/components/SeloStatusIngresso';
import { Tela } from '@/components/Tela';
import { formatarCodigo, formatarDataHoraCurta, formatarDiaHora, soletrarCodigo } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';

/** Cores do "papel" do ingresso: claro para o QR ter contraste máximo. Texto escuro: 15,9:1 e 8,2:1. */
const PAPEL = cores.ingresso.papel;
const TINTA = cores.ingresso.tinta;
const TINTA_SECUNDARIA = cores.ingresso.tintaSecundaria;
const RECORTE = 28;
const TAG_TELA_ACESA = 'ingresso-qr';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' });

export default function DetalheIngresso() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigo = (params.codigo ?? '').toUpperCase();
  const [atualizando, setAtualizando] = useState(false);

  const consulta = useQuery({
    queryKey: chaves.ingresso(codigo),
    queryFn: () => buscarIngresso(codigo),
    enabled: codigo.length > 0,
    refetchOnWindowFocus: true,
  });
  const ingresso = consulta.data;
  const status = ingresso?.status;

  // Celular: mantém a tela acesa enquanto o QR válido estiver aberto (para mostrar na entrada).
  useEffect(() => {
    if (Platform.OS === 'web' || status !== 'VALIDO') return;
    void activateKeepAwakeAsync(TAG_TELA_ACESA);
    return () => {
      void deactivateKeepAwake(TAG_TELA_ACESA);
    };
  }, [status]);

  if (!codigo || (isAxiosError(consulta.error) && consulta.error.response?.status === 404)) {
    return (
      <Tela centralizar>
        <EstadoVazio
          icone="🎟️"
          titulo="Ingresso não encontrado"
          descricao="Confira se o link está correto."
          acao={{ titulo: 'Ver meus ingressos', onPress: () => router.replace('/ingressos') }}
        />
      </Tela>
    );
  }
  if (consulta.isPending) return <Carregando telaCheia mensagem="Carregando ingresso…" />;
  if (consulta.error || !ingresso) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />
      </Tela>
    );
  }

  const tamanhoQr = Math.max(180, Math.min(280, width - 112));
  const esmaecido = ingresso.status !== 'VALIDO';
  const tarja =
    ingresso.status === 'UTILIZADO' && ingresso.utilizadoEm
      ? `UTILIZADO em ${formatarDataHoraCurta(ingresso.utilizadoEm)}`
      : ingresso.status === 'SESSAO_ENCERRADA'
        ? 'SESSÃO ENCERRADA'
        : null;

  async function atualizar() {
    setAtualizando(true);
    try {
      await consulta.refetch();
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <View style={estilos.raiz}>
      <ScrollView
        contentContainerStyle={estilos.rolagem}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void atualizar()} tintColor={cores.primaria} />}
      >
        <View style={estilos.ingresso}>
          {/* Parte de cima: dados da sessão */}
          <View style={estilos.topo}>
            <View style={estilos.linha}>
              <SeloClassificacao classificacao={ingresso.filme.classificacao} />
              <Text style={estilos.filme} accessibilityRole="header">
                {ingresso.filme.titulo}
              </Text>
            </View>
            <Text style={estilos.quando}>{formatarDiaHora(ingresso.dataHora)}</Text>
            <View style={estilos.campos}>
              <View style={estilos.campo}>
                <Text style={estilos.rotulo}>Sala</Text>
                <Text style={estilos.valor}>{ingresso.sala.nome}</Text>
              </View>
              <View style={estilos.campo}>
                <Text style={estilos.rotulo}>Fila</Text>
                <Text style={estilos.valor}>{ingresso.fila}</Text>
              </View>
              <View style={estilos.campo}>
                <Text style={estilos.rotulo}>Assento</Text>
                <Text style={estilos.valor}>
                  {ingresso.numero}
                  {ingresso.tipo !== 'PADRAO' ? (ingresso.tipo === 'PCD' ? ' ♿' : ' ★') : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Picote do canhoto: recortes laterais + linha pontilhada */}
          <View style={estilos.picote} aria-hidden>
            <View style={[estilos.recorte, estilos.recorteEsquerdo]} />
            <View style={estilos.pontilhado} />
            <View style={[estilos.recorte, estilos.recorteDireito]} />
          </View>

          {/* Canhoto: QR + código */}
          <View style={estilos.canhoto}>
            <View style={estilos.qrArea}>
              <View
                style={[estilos.qr, esmaecido && estilos.qrEsmaecido]}
                accessible
                accessibilityRole="image"
                accessibilityLabel={esmaecido ? 'QR code do ingresso (não vale mais para entrada)' : 'QR code do ingresso para apresentar na entrada'}
              >
                <QRCode value={ingresso.codigo} size={tamanhoQr} backgroundColor={cores.qr.fundo} color={cores.qr.tinta} ecl="M" />
              </View>
              {tarja && (
                <View style={estilos.tarja} accessibilityRole="text">
                  <Text style={estilos.tarjaTexto}>{tarja}</Text>
                </View>
              )}
            </View>

            <Text style={estilos.rotuloCodigo}>Código para digitar no balcão</Text>
            <Text style={estilos.codigo} selectable accessibilityLabel={`Código ${soletrarCodigo(ingresso.codigo)}`}>
              {formatarCodigo(ingresso.codigo)}
            </Text>
            <SeloStatusIngresso status={ingresso.status} centralizado />
            {ingresso.status === 'VALIDO' && (
              <Text style={estilos.dica}>Apresente este QR code ou informe o código na entrada da sala.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { padding: espacos.lg, paddingBottom: espacos.xxl, alignItems: 'center' },
  ingresso: { width: '100%', maxWidth: 420, backgroundColor: PAPEL, borderRadius: raios.lg, overflow: 'visible' },
  topo: { padding: espacos.xl, gap: espacos.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  filme: { ...tipografia.subtitulo, color: TINTA, flexShrink: 1 },
  quando: { ...tipografia.corpoForte, color: TINTA, textTransform: 'capitalize' },
  campos: { flexDirection: 'row', gap: espacos.xl, marginTop: espacos.sm },
  campo: { gap: 2 },
  rotulo: { ...tipografia.legenda, color: TINTA_SECUNDARIA, textTransform: 'uppercase', letterSpacing: 0.5 },
  valor: { ...tipografia.subtitulo, color: TINTA },
  picote: { height: RECORTE, flexDirection: 'row', alignItems: 'center' },
  recorte: { position: 'absolute', width: RECORTE, height: RECORTE, borderRadius: RECORTE / 2, backgroundColor: cores.fundo },
  recorteEsquerdo: { left: -RECORTE / 2 },
  recorteDireito: { right: -RECORTE / 2 },
  pontilhado: {
    flex: 1,
    marginHorizontal: RECORTE / 2 + espacos.xs,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: cores.ingresso.borda,
  },
  canhoto: { alignItems: 'center', padding: espacos.xl, paddingTop: espacos.md, gap: espacos.sm },
  qrArea: { alignItems: 'center', justifyContent: 'center' },
  qr: { padding: espacos.md, backgroundColor: cores.qr.fundo, borderRadius: raios.md },
  qrEsmaecido: { opacity: 0.2 },
  tarja: {
    position: 'absolute',
    backgroundColor: TINTA,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.sm,
    transform: [{ rotate: '-12deg' }],
  },
  tarjaTexto: { ...tipografia.corpoForte, color: PAPEL, letterSpacing: 1 },
  rotuloCodigo: { ...tipografia.legenda, color: TINTA_SECUNDARIA, marginTop: espacos.sm },
  codigo: { fontFamily: MONO, fontSize: 28, fontWeight: '700', letterSpacing: 3, color: TINTA },
  dica: { ...tipografia.legenda, color: TINTA_SECUNDARIA, textAlign: 'center', marginTop: espacos.xs },
});
