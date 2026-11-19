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
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { Poster } from '@/components/Poster';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { diaIso, formatarDuracao, rotuloDia } from '@/lib/formatacao';
import { cores, espacos, tipografia } from '@/theme';
import type { Sessao } from '@/types';

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

export default function DetalheFilme() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id: string }>();
  const filmeId = Number(params.id);
  const idValido = Number.isInteger(filmeId) && filmeId > 0;
  const [atualizando, setAtualizando] = useState(false);

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

  const grupos = useMemo(() => agruparPorDia(sessoesQuery.data ?? []), [sessoesQuery.data]);
  const larga = width >= 640;

  async function atualizar() {
    setAtualizando(true);
    try {
      await Promise.all([filmeQuery.refetch(), sessoesQuery.refetch()]);
    } finally {
      setAtualizando(false);
    }
  }

  const naoEncontrado =
    !idValido || (isAxiosError(filmeQuery.error) && filmeQuery.error.response?.status === 404);

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

  return (
    <Tela rolavel={false}>
      <Stack.Screen options={{ title: filme.titulo }} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void atualizar()} tintColor={cores.primaria} />}
        contentContainerStyle={estilos.rolagem}
      >
        <View style={[estilos.cabecalho, larga && estilos.cabecalhoLargo]}>
          <View style={[estilos.poster, larga && estilos.posterLargo]}>
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
            <Text style={estilos.sinopse}>{filme.sinopse}</Text>
          </View>
        </View>

        <Text style={estilos.secao} accessibilityRole="header">
          Sessões
        </Text>

        {sessoesQuery.isPending ? (
          <Carregando mensagem="Carregando sessões…" />
        ) : sessoesQuery.error ? (
          <MensagemErro mensagem={traduzirErro(sessoesQuery.error)} aoTentarNovamente={() => void sessoesQuery.refetch()} />
        ) : grupos.length === 0 ? (
          <EstadoVazio icone="📅" titulo="Nenhuma sessão programada" descricao="Ainda não há sessões futuras para este filme." />
        ) : (
          grupos.map((grupo) => (
            <View key={grupo.dia} style={estilos.grupo}>
              <Text style={estilos.dia} accessibilityRole="header">
                {grupo.rotulo}
              </Text>
              <View style={estilos.sessoes}>
                {grupo.sessoes.map((sessao) => (
                  <CardSessao key={sessao.id} sessao={sessao} onPress={() => router.push({ pathname: '/sessao/[id]', params: { id: String(sessao.id) } })}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  rolagem: { paddingBottom: espacos.xxl },
  cabecalho: { gap: espacos.lg, marginBottom: espacos.xl },
  cabecalhoLargo: { flexDirection: 'row', alignItems: 'flex-start' },
  poster: { width: 180, alignSelf: 'center' },
  posterLargo: { width: 220, alignSelf: 'flex-start' },
  info: { flex: 1, gap: espacos.md },
  titulo: { ...tipografia.titulo, color: cores.texto },
  meta: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  metaTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  sinopse: { ...tipografia.corpo, color: cores.texto, lineHeight: 24 },
  secao: { ...tipografia.subtitulo, color: cores.texto, marginBottom: espacos.md },
  grupo: { marginBottom: espacos.xl, gap: espacos.sm },
  dia: { ...tipografia.corpoForte, color: cores.textoSecundario, textTransform: 'capitalize' },
  sessoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
});
