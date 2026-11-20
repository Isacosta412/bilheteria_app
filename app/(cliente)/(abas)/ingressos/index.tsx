import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { listarMeusIngressos } from '@/api/ingressos';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { ROTULO_STATUS_INGRESSO, SeloStatusIngresso } from '@/components/SeloStatusIngresso';
import { Tela } from '@/components/Tela';
import { formatarDiaHora } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { IngressosDaSessao } from '@/types';

interface Secao {
  titulo: string;
  data: IngressosDaSessao[];
}

function CardSessao({ grupo, aoAbrir }: { grupo: IngressosDaSessao; aoAbrir: (codigo: string) => void }) {
  const { sessao } = grupo;
  return (
    <View style={estilos.card}>
      <View style={estilos.cardTopo}>
        <SeloClassificacao classificacao={sessao.filme.classificacao} />
        <Text style={estilos.filme} numberOfLines={2} accessibilityRole="header">
          {sessao.filme.titulo}
        </Text>
      </View>
      <Text style={estilos.detalhe}>
        {formatarDiaHora(sessao.dataHora)} · {sessao.sala.nome}
      </Text>
      <View style={estilos.assentos}>
        {grupo.ingressos.map((ingresso) => (
          <Pressable
            key={ingresso.codigo}
            onPress={() => aoAbrir(ingresso.codigo)}
            accessibilityRole="button"
            accessibilityLabel={`Ingresso fila ${ingresso.fila} assento ${ingresso.numero}, ${ROTULO_STATUS_INGRESSO[ingresso.status]}`}
            accessibilityHint="Abre o ingresso com o QR code"
            style={({ pressed }) => [estilos.chip, pressed && estilos.chipPressionado]}
          >
            <Text style={estilos.chipAssento}>
              {ingresso.fila}
              {ingresso.numero}
            </Text>
            <SeloStatusIngresso status={ingresso.status} />
            <Text style={estilos.seta} aria-hidden>
              ›
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function MeusIngressos() {
  const router = useRouter();
  const [atualizando, setAtualizando] = useState(false);
  const consulta = useQuery({
    queryKey: chaves.ingressosMeus(),
    queryFn: listarMeusIngressos,
    refetchOnWindowFocus: true,
  });

  // "Agora" = quando os dados chegaram (puro durante a renderização; atualiza a cada refetch).
  const agora = consulta.dataUpdatedAt;
  const secoes = useMemo<Secao[]>(() => {
    const grupos = consulta.data ?? [];
    const proximos = grupos.filter((g) => Date.parse(g.sessao.terminoPrevisto) >= agora);
    const anteriores = grupos.filter((g) => Date.parse(g.sessao.terminoPrevisto) < agora);
    return [
      ...(proximos.length > 0 ? [{ titulo: 'Próximos', data: proximos }] : []),
      ...(anteriores.length > 0 ? [{ titulo: 'Anteriores', data: anteriores }] : []),
    ];
  }, [consulta.data, agora]);

  async function atualizar() {
    setAtualizando(true);
    try {
      await consulta.refetch();
    } finally {
      setAtualizando(false);
    }
  }

  if (consulta.isPending) {
    return (
      <Tela>
        {Array.from({ length: 3 }, (_, i) => (
          <Esqueleto key={i} altura={120} estilo={{ marginBottom: espacos.md, borderRadius: raios.lg }} />
        ))}
      </Tela>
    );
  }
  if (consulta.error) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void atualizar()} />
      </Tela>
    );
  }

  return (
    <Tela rolavel={false}>
      <SectionList
        sections={secoes}
        keyExtractor={(grupo) => String(grupo.sessao.id)}
        renderSectionHeader={({ section }) => (
          <Text style={estilos.secao} accessibilityRole="header">
            {section.titulo}
          </Text>
        )}
        renderItem={({ item }) => (
          <CardSessao
            grupo={item}
            aoAbrir={(codigo) => router.push({ pathname: '/ingressos/[codigo]', params: { codigo } })}
          />
        )}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void atualizar()} tintColor={cores.primaria} />}
        contentContainerStyle={secoes.length === 0 ? estilos.vazio : estilos.lista}
        ListEmptyComponent={
          <EstadoVazio
            icone="🍿"
            titulo="Nenhum ingresso por aqui ainda."
            descricao="Escolheu, pipocou, sentou."
            acao={{ titulo: 'Ver filmes em cartaz', onPress: () => router.navigate('/') }}
          />
        }
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: { paddingBottom: espacos.xxl },
  vazio: { flexGrow: 1, justifyContent: 'center' },
  secao: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: espacos.md,
    marginBottom: espacos.sm,
  },
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    marginBottom: espacos.md,
    gap: espacos.xs,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  filme: { ...tipografia.corpoForte, fontSize: 18, color: cores.texto, flexShrink: 1 },
  detalhe: { ...tipografia.corpo, color: cores.textoSecundario },
  assentos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm, marginTop: espacos.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    minHeight: AREA_TOQUE_MINIMA,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    backgroundColor: cores.superficieElevada,
  },
  chipPressionado: { borderColor: cores.primaria },
  chipAssento: { ...tipografia.corpoForte, color: cores.texto },
  seta: { fontSize: 20, color: cores.textoSecundario },
});
