import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, parseISO } from 'date-fns';
import { chaves } from '@/api/chaves';
import { codigoDoErro, mensagemDaApi, traduzirErro } from '@/api/client';
import { cancelarSessao, listarSessoes } from '@/api/sessoes';
import { Botao } from '@/components/Botao';
import { ChipsDatas, type OpcaoData } from '@/components/ChipsDatas';
import { Dialogo } from '@/components/Dialogo';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ItemLista, Selo } from '@/components/gerencia/ItemLista';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { invalidarAposCompra } from '@/lib/invalidacoes';
import { diaIso, formatarHora, formatarPreco, lugaresLivres, rotuloDia } from '@/lib/formatacao';
import { cores, espacos, tipografia } from '@/theme';
import type { Sessao } from '@/types';

const DIAS_NO_FILTRO = 14;

interface Grupo {
  rotulo: string;
  sessoes: Sessao[];
}

function agrupar(sessoes: Sessao[]): Grupo[] {
  const hoje = new Date();
  const grupos = new Map<string, Grupo>();
  for (const s of [...sessoes].sort((a, b) => a.dataHora.localeCompare(b.dataHora))) {
    const data = parseISO(s.dataHora);
    const dia = diaIso(data);
    const grupo = grupos.get(dia) ?? { rotulo: rotuloDia(data, hoje), sessoes: [] };
    grupo.sessoes.push(s);
    grupos.set(dia, grupo);
  }
  return [...grupos.values()];
}

export default function ListaSessoes() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dia, setDia] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Sessao | null>(null);

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

  const consulta = useQuery({
    queryKey: chaves.sessoesGerencia(dia),
    queryFn: () => listarSessoes({ data: dia ?? undefined, incluirCanceladas: true }),
  });
  const grupos = useMemo(() => agrupar(consulta.data ?? []), [consulta.data]);

  const cancelar = useMutation({
    mutationFn: (sessao: Sessao) => cancelarSessao(sessao.id),
    onSuccess: (sessao) => {
      toast.mostrar(`Sessão de "${sessao.filme.titulo}" às ${formatarHora(sessao.dataHora)} cancelada.`, 'sucesso');
      void invalidarAposCompra(queryClient, sessao.id);
      void queryClient.invalidateQueries({ queryKey: ['relatorios'] });
    },
    onError: (erro) => {
      // A mensagem da API diz quantos ingressos foram vendidos: mais útil que o texto genérico.
      const especifica = codigoDoErro(erro) === 'SESSAO_COM_INGRESSOS' ? mensagemDaApi(erro) : undefined;
      toast.mostrar(especifica ?? traduzirErro(erro), 'erro');
    },
    onSettled: () => setAlvo(null),
  });

  let conteudo;
  if (consulta.isPending) {
    conteudo = [0, 1, 2].map((i) => <Esqueleto key={i} altura={72} />);
  } else if (consulta.isError) {
    conteudo = <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />;
  } else if (grupos.length === 0) {
    conteudo = (
      <EstadoVazio
        icone="🗓️"
        titulo={dia ? 'Nenhuma sessão neste dia' : 'Nenhuma sessão programada'}
        acao={{ titulo: 'Criar sessão', onPress: () => router.push('/gerencia/sessoes/nova') }}
      />
    );
  } else {
    conteudo = grupos.map((grupo) => (
      <View key={grupo.rotulo} style={estilos.grupo}>
        <Text style={estilos.dia} accessibilityRole="header">
          {grupo.rotulo}
        </Text>
        {grupo.sessoes.map((s) => (
          <ItemLista
            key={s.id}
            titulo={`${formatarHora(s.dataHora)}–${formatarHora(s.terminoPrevisto)} · ${s.filme.titulo}`}
            apagado={s.cancelada}
            selos={s.cancelada ? <Selo texto="Cancelada" tom="erro" /> : undefined}
            linhas={[`${s.sala.nome} · ${formatarPreco(s.preco)}${s.cancelada ? '' : ` · ${lugaresLivres(s.assentosLivres)}`}`]}
            acoes={
              s.cancelada ? undefined : (
                <Botao
                  titulo="Cancelar sessão"
                  variante="texto"
                  onPress={() => setAlvo(s)}
                  accessibilityLabel={`Cancelar a sessão de ${s.filme.titulo} às ${formatarHora(s.dataHora)}`}
                />
              )
            }
          />
        ))}
      </View>
    ));
  }

  return (
    <Tela>
      <View style={estilos.topo}>
        <Botao titulo="+ Nova sessão" estilo={estilos.novo} onPress={() => router.push('/gerencia/sessoes/nova')} />
        <ChipsDatas opcoes={opcoesDias} selecionada={dia} aoSelecionar={setDia} />
      </View>
      <View style={estilos.lista}>{conteudo}</View>

      <Dialogo
        visivel={alvo !== null}
        icone="⚠"
        titulo="Cancelar esta sessão?"
        aoFechar={() => setAlvo(null)}
        acoes={
          <>
            <Botao titulo="Manter sessão" variante="secundaria" onPress={() => setAlvo(null)} desabilitado={cancelar.isPending} />
            <Botao titulo="Cancelar sessão" onPress={() => alvo && cancelar.mutate(alvo)} carregando={cancelar.isPending} />
          </>
        }
      >
        {alvo && (
          <Text style={estilos.textoDialogo}>
            {alvo.filme.titulo} · {alvo.sala.nome} · {rotuloDia(parseISO(alvo.dataHora))} às {formatarHora(alvo.dataHora)}.
            {'\n'}As reservas pendentes são canceladas. Se já houver ingresso vendido, a sessão não pode ser cancelada.
          </Text>
        )}
      </Dialogo>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  novo: { alignSelf: 'flex-start' },
  topo: { gap: espacos.sm, marginBottom: espacos.md, alignItems: 'stretch' },
  lista: { gap: espacos.xl },
  grupo: { gap: espacos.md },
  dia: { ...tipografia.subtitulo, color: cores.texto },
  textoDialogo: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
});
