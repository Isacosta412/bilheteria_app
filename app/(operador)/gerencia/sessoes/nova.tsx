import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMinutes, parseISO, subMinutes } from 'date-fns';
import { chaves } from '@/api/chaves';
import { codigoDoErro, detalhesDoErro, mensagemDaApi, traduzirErro } from '@/api/client';
import { listarFilmes } from '@/api/filmes';
import { listarSalas } from '@/api/salas';
import { criarSessao } from '@/api/sessoes';
import { Botao } from '@/components/Botao';
import { voltarOuIr } from '@/lib/rotas';
import { Campo } from '@/components/Campo';
import { CampoDataHora } from '@/components/form/CampoDataHora';
import { Seletor } from '@/components/form/Seletor';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { mascararReais, reaisDaMascara } from '@/lib/dinheiro';
import { formatarDuracao, formatarHora, rotuloDia } from '@/lib/formatacao';
import { invalidarAposCompra } from '@/lib/invalidacoes';
import { sessaoSchema, type FormSessao } from '@/schemas/sessao';
import { cores, espacos, raios, tipografia } from '@/theme';

/** Mesmo intervalo de limpeza da API (LIMPEZA_MINUTOS). */
const LIMPEZA_MINUTOS = 15;

function textoString(valor: unknown, campo: string): string | null {
  if (typeof valor === 'object' && valor !== null && campo in valor) {
    const v = (valor as Record<string, unknown>)[campo];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

/** "A Sala 2 já tem sessão das 19:00 às 21:15 (O Último Bonde). Ela fica livre às 21:30, depois da limpeza." */
function textoSobreposicao(erro: unknown, nomeSala: string): string {
  const detalhes = detalhesDoErro(erro);
  const inicio = textoString(detalhes, 'inicio');
  const liberada = textoString(detalhes, 'salaLiberadaEm');
  const filme = /"(.+)"/.exec(mensagemDaApi(erro) ?? '')?.[1];
  if (!inicio || !liberada) return traduzirErro(erro);
  const fimFilme = subMinutes(parseISO(liberada), LIMPEZA_MINUTOS).toISOString();
  const dia = rotuloDia(parseISO(inicio));
  return (
    `A ${nomeSala} já tem sessão das ${formatarHora(inicio)} às ${formatarHora(fimFilme)}` +
    `${dia === 'Hoje' ? ' de hoje' : dia === 'Amanhã' ? ' de amanhã' : ` (${dia})`}${filme ? ` – ${filme}` : ''}. ` +
    `Ela fica livre às ${formatarHora(liberada)}, depois de ${LIMPEZA_MINUTOS} minutos de limpeza.`
  );
}

export default function NovaSessao() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);

  const filmesQuery = useQuery({ queryKey: chaves.filmes({ ativo: true }), queryFn: () => listarFilmes({ ativo: true }) });
  const salasQuery = useQuery({ queryKey: chaves.salas(), queryFn: listarSalas });

  const opcoesFilmes = useMemo(
    () => (filmesQuery.data ?? []).map((f) => ({ id: f.id, rotulo: f.titulo, descricao: `${f.genero} · ${formatarDuracao(f.duracaoMinutos)}` })),
    [filmesQuery.data],
  );
  const salasAtivas = useMemo(() => (salasQuery.data ?? []).filter((s) => s.ativa), [salasQuery.data]);
  const opcoesSalas = useMemo(
    () => salasAtivas.map((s) => ({ id: s.id, rotulo: s.nome, descricao: `${s.capacidade} lugares` })),
    [salasAtivas],
  );

  const { control, handleSubmit, setError } = useForm<FormSessao>({
    resolver: zodResolver(sessaoSchema),
    mode: 'onTouched',
    defaultValues: { filmeId: null, salaId: null, dataHora: null, preco: '' },
  });
  const [filmeId, dataHora] = useWatch({ control, name: ['filmeId', 'dataHora'] });
  const filme = filmesQuery.data?.find((f) => f.id === filmeId);

  const criar = useMutation({
    mutationFn: criarSessao,
    onSuccess: (sessao) => {
      toast.mostrar(`Sessão criada: ${sessao.filme.titulo}, ${rotuloDia(parseISO(sessao.dataHora)).toLowerCase()} às ${formatarHora(sessao.dataHora)}.`, 'sucesso');
      void invalidarAposCompra(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['relatorios'] });
      voltarOuIr(router, '/gerencia/sessoes' as Href);
    },
    onError: (erro, dados) => {
      const codigo = codigoDoErro(erro);
      if (codigo === 'SESSAO_SOBREPOSTA') {
        const sala = salasQuery.data?.find((s) => s.id === dados.salaId)?.nome ?? 'sala';
        setAviso(textoSobreposicao(erro, sala));
      } else if (codigo === 'SESSAO_NO_PASSADO') {
        setError('dataHora', { message: traduzirErro(erro) });
      } else if (codigo === 'FILME_INATIVO' || codigo === 'FILME_NAO_ENCONTRADO') {
        setError('filmeId', { message: traduzirErro(erro) });
      } else if (codigo === 'SALA_INATIVA' || codigo === 'SALA_SEM_ASSENTOS' || codigo === 'SALA_NAO_ENCONTRADA') {
        setError('salaId', { message: traduzirErro(erro) });
      } else {
        toast.mostrar(traduzirErro(erro), 'erro');
      }
    },
  });

  const enviar = handleSubmit((dados) => {
    if (dados.filmeId === null || dados.salaId === null || dados.dataHora === null) return;
    setAviso(null);
    criar.mutate({
      filmeId: dados.filmeId,
      salaId: dados.salaId,
      dataHora: dados.dataHora.toISOString(),
      preco: reaisDaMascara(dados.preco) ?? 0,
    });
  });

  const erroListas = filmesQuery.error ?? salasQuery.error;

  return (
    <Tela>
      <View style={estilos.cartao}>
        {erroListas && (
          <MensagemErro
            mensagem={traduzirErro(erroListas)}
            aoTentarNovamente={() => {
              void filmesQuery.refetch();
              void salasQuery.refetch();
            }}
          />
        )}

        <Controller
          control={control}
          name="filmeId"
          render={({ field, fieldState }) => (
            <Seletor
              rotulo="Filme"
              placeholder="Escolha o filme"
              opcoes={opcoesFilmes}
              valor={field.value}
              aoMudar={(v) => {
                field.onChange(v);
                setAviso(null);
              }}
              erro={fieldState.error?.message}
              carregando={filmesQuery.isPending}
            />
          )}
        />
        <Controller
          control={control}
          name="salaId"
          render={({ field, fieldState }) => (
            <Seletor
              rotulo="Sala"
              placeholder="Escolha a sala"
              opcoes={opcoesSalas}
              valor={field.value}
              aoMudar={(v) => {
                field.onChange(v);
                setAviso(null);
              }}
              erro={fieldState.error?.message}
              carregando={salasQuery.isPending}
            />
          )}
        />
        <Controller
          control={control}
          name="dataHora"
          render={({ field, fieldState }) => (
            <CampoDataHora
              rotulo="Data e hora de início"
              valor={field.value}
              aoMudar={(v) => {
                field.onChange(v);
                setAviso(null);
              }}
              erro={fieldState.error?.message}
            />
          )}
        />
        <Campo
          control={control}
          name="preco"
          rotulo="Preço do ingresso"
          keyboardType="number-pad"
          mascara={mascararReais}
          placeholder="R$ 0,00"
        />

        <View style={estilos.info} accessibilityLiveRegion="polite" aria-live="polite">
          <Text style={estilos.infoRotulo}>Término previsto</Text>
          <Text style={estilos.infoValor}>
            {filme && dataHora
              ? `${formatarHora(addMinutes(dataHora, filme.duracaoMinutos).toISOString())} (${formatarDuracao(filme.duracaoMinutos)} de filme)`
              : 'Escolha o filme e o horário'}
          </Text>
          <Text style={estilos.infoDica}>A sala fica reservada por mais {LIMPEZA_MINUTOS} minutos para a limpeza.</Text>
        </View>

        {aviso && (
          <View style={estilos.aviso} accessibilityRole="alert">
            <Text style={estilos.avisoTitulo}>⚠ Horário ocupado</Text>
            <Text style={estilos.avisoTexto}>{aviso}</Text>
          </View>
        )}

        <Botao titulo="Criar sessão" onPress={() => void enviar()} carregando={criar.isPending} />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.xl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  info: {
    backgroundColor: cores.superficieElevada,
    borderRadius: raios.md,
    padding: espacos.md,
    marginBottom: espacos.lg,
    gap: espacos.xxs,
  },
  infoRotulo: { ...tipografia.legenda, color: cores.textoSecundario },
  infoValor: { ...tipografia.corpoForte, color: cores.texto },
  infoDica: { ...tipografia.legenda, color: cores.textoSecundario },
  aviso: {
    borderWidth: 1.5,
    borderColor: cores.aviso,
    borderRadius: raios.md,
    padding: espacos.md,
    marginBottom: espacos.lg,
    gap: espacos.xs,
  },
  avisoTitulo: { ...tipografia.corpoForte, color: cores.aviso },
  avisoTexto: { ...tipografia.corpo, color: cores.texto },
});
