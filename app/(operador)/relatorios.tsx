import { useMemo, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { listarFilmes } from '@/api/filmes';
import { baixarCsvSessoes, relatorioSessoes, relatorioVendas, type FiltroRelatorio } from '@/api/relatorios';
import { listarSalas } from '@/api/salas';
import { Botao } from '@/components/Botao';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { OpcoesChips } from '@/components/form/OpcoesChips';
import { Seletor } from '@/components/form/Seletor';
import { MensagemErro } from '@/components/MensagemErro';
import { CardsTotais } from '@/components/relatorios/CardsTotais';
import { GraficoOcupacao } from '@/components/relatorios/GraficoOcupacao';
import { TabelaSessoes } from '@/components/relatorios/TabelaSessoes';
import { VendasAgrupadas } from '@/components/relatorios/VendasAgrupadas';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { diaIso } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { AgrupamentoVendas } from '@/types';

/** "proximos" = hoje + 6 dias à frente (sessões programadas, com as vendas antecipadas); os outros olham para trás. */
type Atalho = 'proximos' | 'hoje' | '7' | '30';
const DIAS: Record<Exclude<Atalho, 'proximos'>, number> = { hoje: 1, '7': 7, '30': 30 };

function periodoDo(atalho: Atalho): { inicio: string; fim: string } {
  const hoje = new Date();
  if (atalho === 'proximos') return { inicio: diaIso(hoje), fim: diaIso(addDays(hoje, 6)) };
  return { inicio: diaIso(subDays(hoje, DIAS[atalho] - 1)), fim: diaIso(hoje) };
}

function diaCurto(dia: string): string {
  return format(parseISO(dia), 'dd/MM');
}

function Bloco({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <View style={estilos.bloco}>
      <View style={estilos.blocoTopo}>
        <Text style={estilos.blocoTitulo} accessibilityRole="header">
          {titulo}
        </Text>
        {acao}
      </View>
      {children}
    </View>
  );
}

export default function Relatorios() {
  const toast = useToast();
  const [atalho, setAtalho] = useState<Atalho>('proximos');
  const [filmeId, setFilmeId] = useState<number | null>(null);
  const [salaId, setSalaId] = useState<number | null>(null);
  const [agrupar, setAgrupar] = useState<AgrupamentoVendas>('dia');

  const periodo = useMemo(() => periodoDo(atalho), [atalho]);
  const filtro: FiltroRelatorio = { ...periodo, filmeId: filmeId ?? undefined, salaId: salaId ?? undefined };
  // Vendas olham para trás: em "Próximos 7 dias", mostram as dos últimos 7 dias.
  const periodoVendas = useMemo(() => (atalho === 'proximos' ? periodoDo('7') : periodo), [atalho, periodo]);

  const filmes = useQuery({ queryKey: chaves.filmes({}), queryFn: () => listarFilmes() });
  const salas = useQuery({ queryKey: chaves.salas(), queryFn: listarSalas });
  const sessoes = useQuery({
    queryKey: chaves.relatorioSessoes(filtro),
    queryFn: () => relatorioSessoes(filtro),
    placeholderData: keepPreviousData,
  });
  const vendas = useQuery({
    queryKey: chaves.relatorioVendas(periodoVendas, agrupar),
    queryFn: () => relatorioVendas(periodoVendas, agrupar),
    placeholderData: keepPreviousData,
  });

  const csv = useMutation({
    mutationFn: () => baixarCsvSessoes(filtro),
    onSuccess: () => toast.mostrar('Planilha baixada.', 'sucesso'),
    onError: (erro) => toast.mostrar(traduzirErro(erro), 'erro'),
  });

  const opcoesFilmes = useMemo(() => (filmes.data ?? []).map((f) => ({ id: f.id, rotulo: f.titulo })), [filmes.data]);
  const opcoesSalas = useMemo(() => (salas.data ?? []).map((s) => ({ id: s.id, rotulo: s.nome })), [salas.data]);
  const paraGrafico = useMemo(
    () =>
      (sessoes.data?.sessoes ?? [])
        .filter((s) => !s.cancelada && s.capacidade > 0)
        .sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
    [sessoes.data],
  );

  const textoPeriodo =
    periodo.inicio === periodo.fim ? `Hoje (${diaCurto(periodo.fim)})` : `${diaCurto(periodo.inicio)} a ${diaCurto(periodo.fim)}`;

  let corpoSessoes: ReactNode;
  if (sessoes.isPending) {
    corpoSessoes = (
      <View style={estilos.esqueletos}>
        <Esqueleto altura={96} />
        <Esqueleto altura={220} />
      </View>
    );
  } else if (sessoes.isError) {
    corpoSessoes = <MensagemErro mensagem={traduzirErro(sessoes.error)} aoTentarNovamente={() => void sessoes.refetch()} />;
  } else {
    const dados = sessoes.data;
    corpoSessoes = (
      <View style={[estilos.coluna, sessoes.isPlaceholderData && estilos.atualizando]}>
        <CardsTotais totais={dados.totais} />
        {dados.sessoes.length === 0 ? (
          <EstadoVazio icone="📊" titulo="Nenhuma sessão no período" descricao="Escolha outro período ou tire os filtros." />
        ) : (
          <>
            <Bloco titulo="Ocupação por sessão">
              {paraGrafico.length > 0 ? (
                <GraficoOcupacao sessoes={paraGrafico} />
              ) : (
                <Text style={estilos.nota}>Só há sessões canceladas no período.</Text>
              )}
            </Bloco>
            <Bloco
              titulo="Sessões"
              acao={
                Platform.OS === 'web' ? (
                  <Botao titulo="⬇ Exportar CSV" variante="secundaria" onPress={() => csv.mutate()} carregando={csv.isPending} />
                ) : undefined
              }
            >
              <TabelaSessoes sessoes={dados.sessoes} />
            </Bloco>
          </>
        )}
      </View>
    );
  }

  let corpoVendas: ReactNode;
  if (vendas.isPending) corpoVendas = <Esqueleto altura={160} />;
  else if (vendas.isError) {
    corpoVendas = <MensagemErro mensagem={traduzirErro(vendas.error)} aoTentarNovamente={() => void vendas.refetch()} />;
  } else if (vendas.data.grupos.length === 0) {
    corpoVendas = <EstadoVazio icone="🧾" titulo="Nenhuma venda no período" />;
  } else {
    corpoVendas = (
      <View style={vendas.isPlaceholderData && estilos.atualizando}>
        <VendasAgrupadas relatorio={vendas.data} />
      </View>
    );
  }

  return (
    <Tela>
      <View style={estilos.coluna}>
        <View style={estilos.filtros}>
          <OpcoesChips<Atalho>
            rotulo={`Período: ${textoPeriodo}`}
            opcoes={[
              { valor: 'proximos', rotulo: 'Próximos 7 dias' },
              { valor: 'hoje', rotulo: 'Hoje' },
              { valor: '7', rotulo: '7 dias' },
              { valor: '30', rotulo: '30 dias' },
            ]}
            valor={atalho}
            aoMudar={setAtalho}
          />
          <View style={estilos.seletores}>
            <View style={estilos.seletor}>
              <Seletor
                rotulo="Filme"
                opcoes={opcoesFilmes}
                valor={filmeId}
                aoMudar={setFilmeId}
                rotuloNenhum="Todos os filmes"
                carregando={filmes.isPending}
              />
            </View>
            <View style={estilos.seletor}>
              <Seletor
                rotulo="Sala"
                opcoes={opcoesSalas}
                valor={salaId}
                aoMudar={setSalaId}
                rotuloNenhum="Todas as salas"
                carregando={salas.isPending}
              />
            </View>
          </View>
        </View>

        {corpoSessoes}

        <Bloco titulo="Vendas">
          <Text style={estilos.nota}>
            {atalho === 'proximos'
              ? `Vendas feitas de ${diaCurto(periodoVendas.inicio)} a ${diaCurto(periodoVendas.fim)} (os filtros de filme e sala valem só para as sessões).`
              : 'Todas as vendas do período (os filtros de filme e sala valem só para as sessões).'}
          </Text>
          <OpcoesChips<AgrupamentoVendas>
            rotulo="Agrupar por"
            opcoes={[
              { valor: 'dia', rotulo: 'Dia' },
              { valor: 'filme', rotulo: 'Filme' },
              { valor: 'metodo', rotulo: 'Método' },
            ]}
            valor={agrupar}
            aoMudar={setAgrupar}
          />
          {corpoVendas}
        </Bloco>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  coluna: { gap: espacos.xl },
  filtros: {
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    paddingBottom: 0,
  },
  seletores: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espacos.lg },
  seletor: { flexGrow: 1, flexBasis: 220 },
  esqueletos: { gap: espacos.md },
  atualizando: { opacity: 0.6 },
  bloco: {
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
  },
  blocoTopo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: espacos.md },
  blocoTitulo: { ...tipografia.subtitulo, color: cores.texto },
  nota: { ...tipografia.legenda, color: cores.textoSecundario },
});
