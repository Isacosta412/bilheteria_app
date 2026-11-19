import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { listarFilmes } from '@/api/filmes';
import { listarSessoes } from '@/api/sessoes';
import { CampoBusca } from '@/components/CampoBusca';
import { CardFilme } from '@/components/CardFilme';
import { ChipsDatas, type OpcaoData } from '@/components/ChipsDatas';
import { EsqueletoCardFilme } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useDebounce } from '@/hooks/useDebounce';
import { diaIso, formatarDiaHora, formatarHora, rotuloDia } from '@/lib/formatacao';
import { LARGURA_MAXIMA, cores, espacos } from '@/theme';
import type { Sessao } from '@/types';

const DIAS_NO_FILTRO = 7;

/** 2 colunas no celular, até 5 na web larga (dentro da largura máxima do conteúdo). */
function colunasPara(largura: number): number {
  const util = Math.min(largura, LARGURA_MAXIMA);
  if (util >= 900) return 5;
  if (util >= 700) return 4;
  if (util >= 520) return 3;
  return 2;
}

export default function EmCartaz() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colunas = colunasPara(width);

  const [busca, setBusca] = useState('');
  const buscaAtrasada = useDebounce(busca.trim(), 300);
  const [dia, setDia] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  const opcoesDias = useMemo<OpcaoData[]>(() => {
    const hoje = new Date();
    return [
      { valor: null, rotulo: 'Todos' },
      ...Array.from({ length: DIAS_NO_FILTRO }, (_, i) => {
        const data = addDays(hoje, i);
        return { valor: diaIso(data), rotulo: rotuloDia(data, hoje) };
      }),
    ];
  }, []);

  const filmesQuery = useQuery({
    queryKey: chaves.filmes({ ativo: true, busca: buscaAtrasada }),
    queryFn: () => listarFilmes({ ativo: true, busca: buscaAtrasada }),
  });
  const sessoesQuery = useQuery({
    queryKey: chaves.sessoes(null, dia),
    queryFn: () => listarSessoes({ data: dia ?? undefined }),
  });

  // Só aparecem os filmes ativos que têm sessão no dia escolhido (ou alguma sessão futura, em "Todos").
  const sessoesPorFilme = useMemo(() => {
    const mapa = new Map<number, Sessao[]>();
    for (const sessao of sessoesQuery.data ?? []) {
      const lista = mapa.get(sessao.filme.id) ?? [];
      lista.push(sessao);
      mapa.set(sessao.filme.id, lista);
    }
    return mapa;
  }, [sessoesQuery.data]);

  const filmes = useMemo(
    () => (filmesQuery.data ?? []).filter((filme) => sessoesPorFilme.has(filme.id)),
    [filmesQuery.data, sessoesPorFilme],
  );

  function destaque(filmeId: number): string | undefined {
    const sessoes = sessoesPorFilme.get(filmeId);
    const primeira = sessoes?.[0];
    if (!sessoes || !primeira) return undefined;
    if (dia === null) return `Próxima: ${formatarDiaHora(primeira.dataHora)}`;
    const horarios = sessoes.slice(0, 3).map((s) => formatarHora(s.dataHora)).join(' · ');
    return sessoes.length > 3 ? `${horarios} +${sessoes.length - 3}` : horarios;
  }

  async function atualizar() {
    setAtualizando(true);
    try {
      await Promise.all([filmesQuery.refetch(), sessoesQuery.refetch()]);
    } finally {
      setAtualizando(false);
    }
  }

  const carregando = filmesQuery.isPending || sessoesQuery.isPending;
  const erro = filmesQuery.error ?? sessoesQuery.error;
  const rotuloDiaEscolhido = opcoesDias.find((o) => o.valor === dia)?.rotulo.toLowerCase();

  let conteudo;
  if (carregando) {
    conteudo = (
      <FlatList
        key={`esqueleto-${colunas}`}
        data={Array.from({ length: colunas * 2 }, (_, i) => i)}
        keyExtractor={(i) => String(i)}
        numColumns={colunas}
        renderItem={() => <EsqueletoCardFilme />}
        columnWrapperStyle={estilos.linhaGrade}
        accessibilityLabel="Carregando filmes"
      />
    );
  } else if (erro) {
    conteudo = <MensagemErro mensagem={traduzirErro(erro)} aoTentarNovamente={() => void atualizar()} />;
  } else {
    conteudo = (
      <FlatList
        key={`grade-${colunas}`}
        data={filmes}
        keyExtractor={(filme) => String(filme.id)}
        numColumns={colunas}
        columnWrapperStyle={estilos.linhaGrade}
        contentContainerStyle={filmes.length === 0 && estilos.listaVazia}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void atualizar()} tintColor={cores.primaria} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / colunas }}>
            <CardFilme filme={item} destaque={destaque(item.id)} onPress={() => router.push({ pathname: '/filme/[id]', params: { id: String(item.id) } })}
            />
          </View>
        )}
        ListEmptyComponent={
          <EstadoVazio
            icone={buscaAtrasada ? '🔎' : '🍿'}
            titulo={
              buscaAtrasada
                ? `Nada encontrado para "${buscaAtrasada}"`
                : dia
                  ? `Nenhum filme com sessão ${rotuloDiaEscolhido === 'hoje' || rotuloDiaEscolhido === 'amanhã' ? rotuloDiaEscolhido : `em ${rotuloDiaEscolhido}`}`
                  : 'Nenhum filme em cartaz no momento'
            }
            descricao={buscaAtrasada || dia ? 'Tente outro dia ou outra busca.' : 'Volte mais tarde para ver a programação.'}
            acao={buscaAtrasada || dia ? { titulo: 'Limpar filtros', onPress: () => { setBusca(''); setDia(null); } } : undefined}
          />
        }
      />
    );
  }

  return (
    <Tela rolavel={false}>
      <View style={estilos.topo}>
        <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar filme pelo título" rotulo="Buscar filme pelo título" />
        <ChipsDatas opcoes={opcoesDias} selecionada={dia} aoSelecionar={setDia} />
      </View>
      <View style={estilos.lista}>{conteudo}</View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: { gap: espacos.xs, marginBottom: espacos.sm },
  lista: { flex: 1 },
  linhaGrade: { gap: espacos.sm, marginBottom: espacos.md },
  listaVazia: { flexGrow: 1, justifyContent: 'center' },
});
