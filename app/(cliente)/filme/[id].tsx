import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { parseISO } from 'date-fns';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { buscarFilme } from '@/api/filmes';
import { listarSessoes } from '@/api/sessoes';
import { Carregando } from '@/components/Carregando';
import { CardSessao } from '@/components/CardSessao';
import { ChipsDatas, type OpcaoData } from '@/components/ChipsDatas';
import { EnderecoCinema } from '@/components/EnderecoCinema';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { Poster } from '@/components/Poster';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { diaIso, formatarDuracao, formatarPreco, rotuloDia } from '@/lib/formatacao';
import { ROTULO_FORMATO, ROTULO_IDIOMA } from '@/lib/sessao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { FormatoSessao, IdiomaSessao, Sessao } from '@/types';

/** A partir desta largura, filme à esquerda e sessões à direita (tudo numa tela só). */
const LARGURA_DUAS_COLUNAS = 900;

interface GrupoDia {
  dia: string;
  rotulo: string;
  sessoes: Sessao[];
}

function agruparPorDia(sessoes: Sessao[]): GrupoDia[] {
  const hoje = new Date();
  const grupos = new Map<string, GrupoDia>();
  for (const sessao of [...sessoes].sort((a, b) => a.dataHora.localeCompare(b.dataHora))) {
    const data = parseISO(sessao.dataHora);
    const dia = diaIso(data);
    const grupo = grupos.get(dia) ?? { dia, rotulo: rotuloDia(data, hoje), sessoes: [] };
    grupo.sessoes.push(sessao);
    grupos.set(dia, grupo);
  }
  return [...grupos.values()];
}

/** Opções de filtro só com o que existe nas sessões do filme ("Todos" + valores presentes). Vazio se só há um valor. */
function opcoesFiltro<T extends string>(valores: T[], rotulos: Record<T, string>, ordem: T[]): OpcaoData[] {
  const presentes = ordem.filter((v) => valores.includes(v));
  if (presentes.length < 2) return [];
  return [{ valor: null, rotulo: 'Todos' }, ...presentes.map((v) => ({ valor: v, rotulo: rotulos[v] }))];
}

export default function DetalheFilme() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id: string }>();
  const filmeId = Number(params.id);
  const idValido = Number.isInteger(filmeId) && filmeId > 0;
  const [atualizando, setAtualizando] = useState(false);
  const [dia, setDia] = useState<string | null>(null);
  const [formato, setFormato] = useState<FormatoSessao | null>(null);
  const [idioma, setIdioma] = useState<IdiomaSessao | null>(null);

  const filmeQuery = useQuery({
    queryKey: chaves.filme(filmeId),
    queryFn: () => buscarFilme(filmeId),
    enabled: idValido,
  });
  const sessoesQuery = useQuery({
    queryKey: chaves.sessoes(filmeId, null),
    queryFn: () => listarSessoes({ filmeId }),
    enabled: idValido,
  });

  const sessoes = useMemo(() => sessoesQuery.data ?? [], [sessoesQuery.data]);
  const filtradas = useMemo(
    () => sessoes.filter((s) => (formato === null || s.formato === formato) && (idioma === null || s.idioma === idioma)),
    [sessoes, formato, idioma],
  );
  const grupos = useMemo(() => agruparPorDia(filtradas), [filtradas]);

  // Começa no primeiro dia com sessão; se o filtro tirar o dia escolhido, mostra o primeiro.
  const grupoAtual = grupos.find((g) => g.dia === dia) ?? grupos[0];

  const opcoesFormato = opcoesFiltro(sessoes.map((s) => s.formato), ROTULO_FORMATO, ['DOIS_D', 'TRES_D']);
  const opcoesIdioma = opcoesFiltro(sessoes.map((s) => s.idioma), ROTULO_IDIOMA, ['DUBLADO', 'LEGENDADO']);
  const versoes = [...new Set(sessoes.map((s) => `${ROTULO_FORMATO[s.formato]} ${ROTULO_IDIOMA[s.idioma].toLowerCase()}`))];
  const menorPreco = sessoes.length > 0 ? Math.min(...sessoes.map((s) => Number(s.preco))) : null;

  const duasColunas = width >= LARGURA_DUAS_COLUNAS;
  const posterPequeno = width < 520;

  async function atualizar() {
    setAtualizando(true);
    try {
      await Promise.all([filmeQuery.refetch(), sessoesQuery.refetch()]);
    } finally {
      setAtualizando(false);
    }
  }

  const naoEncontrado = !idValido || (isAxiosError(filmeQuery.error) && filmeQuery.error.response?.status === 404);

  if (naoEncontrado) {
    return (
      <Tela centralizar>
        <Stack.Screen options={{ title: 'Filme não encontrado' }} />
        <EstadoVazio
          icone="🎞️"
          titulo="Filme não encontrado"
          descricao="Ele pode ter saído de cartaz."
          acao={{ titulo: 'Ver filmes em cartaz', onPress: () => router.replace('/') }}
        />
      </Tela>
    );
  }

  if (filmeQuery.isPending) {
    return <Carregando telaCheia mensagem="Carregando filme…" />;
  }

  if (filmeQuery.error) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(filmeQuery.error)} aoTentarNovamente={() => void atualizar()} />
      </Tela>
    );
  }

  const filme = filmeQuery.data;

  function limparFiltros() {
    setFormato(null);
    setIdioma(null);
  }

  const blocoFilme = (
    <View style={[estilos.colunaFilme, duasColunas && estilos.colunaFilmeLarga]}>
      <View style={estilos.cabecalho}>
        <View style={[estilos.poster, posterPequeno && estilos.posterPequeno]}>
          <Poster url={filme.posterUrl} titulo={filme.titulo} />
        </View>
        <View style={estilos.info}>
          <Text style={estilos.titulo} accessibilityRole="header">
            {filme.titulo}
          </Text>
          <View style={estilos.meta}>
            <SeloClassificacao classificacao={filme.classificacao} tamanho={28} />
            <Text style={estilos.metaTexto}>
              {formatarDuracao(filme.duracaoMinutos)} · {filme.genero}
            </Text>
          </View>
          {versoes.length > 0 && (
            <View style={estilos.versoes} accessibilityLabel={`Versões: ${versoes.join(', ')}`}>
              {versoes.map((v) => (
                <Text key={v} style={estilos.versao}>
                  {v}
                </Text>
              ))}
            </View>
          )}
          {menorPreco !== null && (
            <Text style={estilos.aPartir}>A partir de {formatarPreco(menorPreco)} · meia-entrada pela metade</Text>
          )}
        </View>
      </View>
      <Text style={estilos.sinopse}>{filme.sinopse}</Text>
      <EnderecoCinema />
    </View>
  );

  let conteudoSessoes;
  if (sessoesQuery.isPending) {
    conteudoSessoes = <Carregando mensagem="Carregando sessões…" />;
  } else if (sessoesQuery.error) {
    conteudoSessoes = (
      <MensagemErro mensagem={traduzirErro(sessoesQuery.error)} aoTentarNovamente={() => void sessoesQuery.refetch()} />
    );
  } else if (sessoes.length === 0) {
    conteudoSessoes = (
      <EstadoVazio icone="📅" titulo="Nenhuma sessão programada" descricao="Ainda não há sessões futuras para este filme." />
    );
  } else {
    conteudoSessoes = (
      <>
        {(opcoesFormato.length > 0 || opcoesIdioma.length > 0) && (
          <View style={estilos.filtros}>
            {opcoesFormato.length > 0 && (
              <View>
                <Text style={estilos.rotuloFiltro}>Formato</Text>
                <ChipsDatas
                  rotulo="Filtrar por formato"
                  opcoes={opcoesFormato}
                  selecionada={formato}
                  aoSelecionar={(v) => setFormato(v as FormatoSessao | null)}
                />
              </View>
            )}
            {opcoesIdioma.length > 0 && (
              <View>
                <Text style={estilos.rotuloFiltro}>Áudio</Text>
                <ChipsDatas
                  rotulo="Filtrar por áudio"
                  opcoes={opcoesIdioma}
                  selecionada={idioma}
                  aoSelecionar={(v) => setIdioma(v as IdiomaSessao | null)}
                />
              </View>
            )}
          </View>
        )}

        {grupos.length === 0 ? (
          <EstadoVazio
            icone="🔎"
            titulo="Nenhuma sessão nessa versão"
            descricao="Tente outra combinação de formato e áudio."
            acao={{ titulo: 'Limpar filtros', onPress: limparFiltros }}
          />
        ) : (
          <>
            <View>
              <Text style={estilos.rotuloFiltro}>Dia</Text>
              <ChipsDatas
                opcoes={grupos.map((g) => ({ valor: g.dia, rotulo: g.rotulo }))}
                selecionada={grupoAtual?.dia ?? null}
                aoSelecionar={setDia}
              />
            </View>
            <View style={estilos.sessoes}>
              {grupoAtual?.sessoes.map((sessao) => (
                <CardSessao
                  key={sessao.id}
                  sessao={sessao}
                  onPress={() => router.push({ pathname: '/sessao/[id]', params: { id: String(sessao.id) } })}
                />
              ))}
            </View>
          </>
        )}
      </>
    );
  }

  return (
    <Tela rolavel={false} estiloConteudo={estilos.conteudo}>
      <Stack.Screen options={{ title: filme.titulo }} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void atualizar()} tintColor={cores.primaria} />}
        contentContainerStyle={[estilos.rolagem, duasColunas && estilos.rolagemLarga]}
      >
        {blocoFilme}
        <View style={[estilos.painel, duasColunas && estilos.painelLargo]}>
          <Text style={estilos.secao} accessibilityRole="header">
            Sessões
          </Text>
          {conteudoSessoes}
        </View>
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { maxWidth: 1200 },
  rolagem: { paddingBottom: espacos.xxl, gap: espacos.xl },
  rolagemLarga: { flexDirection: 'row', alignItems: 'flex-start' },
  colunaFilme: { gap: espacos.md },
  colunaFilmeLarga: { width: 440 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacos.lg },
  poster: { width: 160 },
  posterPequeno: { width: 110 },
  info: { flex: 1, gap: espacos.sm },
  titulo: { ...tipografia.titulo, color: cores.texto },
  meta: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  metaTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  versoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.xs },
  versao: {
    ...tipografia.legenda,
    color: cores.texto,
    borderWidth: 1,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.pilula,
    paddingHorizontal: espacos.sm,
    paddingVertical: 2,
  },
  aPartir: { ...tipografia.legenda, color: cores.textoSecundario },
  sinopse: { ...tipografia.corpo, color: cores.texto, lineHeight: 24 },
  painel: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.sm,
  },
  painelLargo: { flex: 1 },
  secao: { ...tipografia.subtitulo, color: cores.texto },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espacos.xl },
  rotuloFiltro: { ...tipografia.legenda, color: cores.textoSecundario, textTransform: 'uppercase', letterSpacing: 0.5 },
  sessoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm, marginTop: espacos.xs },
});
