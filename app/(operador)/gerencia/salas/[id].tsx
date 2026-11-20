import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chaves } from '@/api/chaves';
import { codigoDoErro, errosDeCampo, mensagemDaApi, traduzirErro } from '@/api/client';
import { atualizarSala, buscarSala, criarSala, type EstruturaSala } from '@/api/salas';
import { Botao } from '@/components/Botao';
import { voltarOuIr } from '@/lib/rotas';
import { Campo } from '@/components/Campo';
import { Carregando } from '@/components/Carregando';
import { Dialogo } from '@/components/Dialogo';
import { MapaAssentos } from '@/components/MapaAssentos';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { plural, primeiroNumero } from '@/lib/formatacao';
import { dentroDaGrade, estruturaDaSala, iguais, montarPrevia, posicaoDaChave } from '@/lib/salas';
import { MAX_ASSENTOS_POR_FILA, MAX_FILAS, salaSchema, type FormSala } from '@/schemas/sala';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { SalaDetalhe } from '@/types';

/** Erros em que a API recusa trocar o layout (mas aceitaria salvar só o nome). */
const LAYOUT_BLOQUEADO = new Set(['SALA_COM_SESSOES_FUTURAS', 'SALA_COM_HISTORICO']);

/** /gerencia/salas/nova cria; /gerencia/salas/7 edita. */
export default function FormularioSala() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nova = id === 'nova';
  const salaId = Number(id);

  const consulta = useQuery({
    queryKey: chaves.sala(salaId),
    queryFn: () => buscarSala(salaId),
    enabled: !nova && Number.isInteger(salaId) && salaId > 0,
  });

  if (nova) return <Formulario />;
  if (consulta.isPending) return <Carregando telaCheia mensagem="Carregando a sala…" />;
  if (consulta.isError) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />
      </Tela>
    );
  }
  return <Formulario sala={consulta.data} />;
}

function numeroValido(texto: string, max: number): number | null {
  const n = Number(texto);
  return /^\d+$/.test(texto.trim()) && n >= 1 && n <= max ? n : null;
}

function Formulario({ sala }: { sala?: SalaDetalhe }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const original = useMemo(() => (sala ? estruturaDaSala(sala) : null), [sala]);

  const { control, handleSubmit, setError } = useForm<FormSala>({
    resolver: zodResolver(salaSchema),
    mode: 'onTouched',
    defaultValues: {
      nome: sala?.nome ?? '',
      qtdFilas: original ? String(original.qtdFilas) : '',
      assentosPorFila: original ? String(original.assentosPorFila) : '',
    },
  });
  const [textoFilas, textoPorFila] = useWatch({ control, name: ['qtdFilas', 'assentosPorFila'] });
  const qtdFilas = numeroValido(textoFilas, MAX_FILAS);
  const porFila = numeroValido(textoPorFila, MAX_ASSENTOS_POR_FILA);

  const [pcd, setPcd] = useState<Set<string>>(() => new Set(original?.pcd));
  // Os VIP de salas antigas são mantidos como estão (o formulário não pede VIP).
  const vip = useMemo(() => original?.vip ?? new Set<string>(), [original]);
  const [bloqueio, setBloqueio] = useState<{ mensagem: string; nome: string } | null>(null);

  const previa = useMemo(
    () => (qtdFilas && porFila ? montarPrevia(qtdFilas, porFila, pcd, vip) : null),
    [qtdFilas, porFila, pcd, vip],
  );
  const pcdNaGrade = qtdFilas && porFila ? dentroDaGrade(pcd, qtdFilas, porFila) : [];
  const vipNaGrade = qtdFilas && porFila ? dentroDaGrade(vip, qtdFilas, porFila) : [];

  const alternarPcd = useCallback(
    (assentoId: number) => {
      const chave = previa?.chavePorId.get(assentoId);
      if (!chave) return;
      setPcd((atual) => {
        const novo = new Set(atual);
        if (novo.has(chave)) novo.delete(chave);
        else novo.add(chave);
        return novo;
      });
    },
    [previa],
  );

  const salvar = useMutation({
    mutationFn: async ({ nome, estrutura }: { nome: string; estrutura?: EstruturaSala }) => {
      if (!sala) {
        if (!estrutura) throw new Error('estrutura obrigatória');
        return criarSala({ nome, ...estrutura });
      }
      return atualizarSala(sala.id, { nome, ativa: sala.ativa, estrutura });
    },
    onSuccess: (salva) => {
      toast.mostrar(sala ? `${salva.nome} atualizada.` : `${salva.nome} cadastrada com ${salva.capacidade} lugares.`, 'sucesso');
      void queryClient.invalidateQueries({ queryKey: chaves.salas() });
      void queryClient.invalidateQueries({ queryKey: chaves.todasSessoes() });
      voltarOuIr(router, '/gerencia/salas' as Href);
    },
    onError: (erro, variaveis) => {
      const codigo = codigoDoErro(erro);
      if (codigo && LAYOUT_BLOQUEADO.has(codigo)) {
        const futuras = codigo === 'SALA_COM_SESSOES_FUTURAS' ? primeiroNumero(mensagemDaApi(erro)) : null;
        const mensagem =
          futuras !== null
            ? `Esta sala tem ${plural(futuras, 'sessão futura agendada', 'sessões futuras agendadas')}.`
            : 'Esta sala já teve sessões, e os assentos fazem parte do histórico de vendas.';
        setBloqueio({ mensagem, nome: variaveis.nome });
        return;
      }
      if (codigo === 'SALA_NOME_EM_USO') {
        setError('nome', { message: traduzirErro(erro) });
        return;
      }
      const porCampo = errosDeCampo(erro);
      if (porCampo.nome) setError('nome', { message: porCampo.nome });
      else toast.mostrar(traduzirErro(erro), 'erro');
    },
  });

  const enviar = handleSubmit((dados) => {
    const estrutura: EstruturaSala = {
      qtdFilas: Number(dados.qtdFilas),
      assentosPorFila: Number(dados.assentosPorFila),
      assentosPcd: pcdNaGrade.map(posicaoDaChave),
      assentosVip: vipNaGrade.map(posicaoDaChave),
    };
    // Na edição, o layout só vai para a API se mudou (trocar só o nome é sempre permitido).
    const mudou =
      !original ||
      original.qtdFilas !== estrutura.qtdFilas ||
      original.assentosPorFila !== estrutura.assentosPorFila ||
      !iguais(original.pcd, new Set(pcdNaGrade));
    salvar.mutate({ nome: dados.nome, estrutura: mudou ? estrutura : undefined });
  });

  const capacidade = qtdFilas && porFila ? qtdFilas * porFila : 0;

  return (
    <Tela>
      <Stack.Screen options={{ title: sala ? 'Editar sala' : 'Nova sala' }} />
      <View style={estilos.cartao}>
        <Campo control={control} name="nome" rotulo="Nome da sala" maxLength={60} placeholder="Ex.: Sala 3" />
        <View style={estilos.linha}>
          <View style={estilos.coluna}>
            <Campo
              control={control}
              name="qtdFilas"
              rotulo="Quantidade de filas"
              keyboardType="number-pad"
              maxLength={2}
              mascara={(t) => t.replace(/\D/g, '')}
              dica={`De 1 a ${MAX_FILAS} (A, B, C…)`}
            />
          </View>
          <View style={estilos.coluna}>
            <Campo
              control={control}
              name="assentosPorFila"
              rotulo="Assentos por fila"
              keyboardType="number-pad"
              maxLength={2}
              mascara={(t) => t.replace(/\D/g, '')}
              dica={`De 1 a ${MAX_ASSENTOS_POR_FILA}`}
            />
          </View>
        </View>

        <Text style={estilos.subtitulo} accessibilityRole="header">
          Prévia da sala
        </Text>
        {previa ? (
          <>
            <Text style={estilos.resumo}>
              Capacidade: {capacidade} lugares · {pcdNaGrade.length} PCD. Toque nos assentos para marcar os lugares PCD.
            </Text>
            <View style={estilos.mapa}>
              <MapaAssentos mapa={previa} selecionados={[]} onAlternar={alternarPcd} modo="editor" />
            </View>
          </>
        ) : (
          <Text style={estilos.resumo}>Informe as filas e os assentos por fila para ver a prévia.</Text>
        )}

        <Botao titulo={sala ? 'Salvar alterações' : 'Cadastrar sala'} onPress={() => void enviar()} carregando={salvar.isPending} />
      </View>

      <Dialogo
        visivel={bloqueio !== null}
        icone="🔒"
        titulo="O mapa desta sala não pode mudar agora"
        aoFechar={() => setBloqueio(null)}
        acoes={
          <>
            <Botao titulo="Voltar e revisar" variante="secundaria" onPress={() => setBloqueio(null)} />
            <Botao
              titulo="Salvar só o nome"
              carregando={salvar.isPending}
              onPress={() => {
                if (!bloqueio) return;
                // O diálogo fica aberto (com o botão carregando) até a resposta; o sucesso já volta para a lista.
                salvar.mutate({ nome: bloqueio.nome }, { onSettled: () => setBloqueio(null) });
              }}
            />
          </>
        }
      >
        <Text style={estilos.textoDialogo}>{bloqueio?.mensagem}</Text>
        <Text style={estilos.textoDialogo}>
          Os assentos fazem parte das sessões e dos ingressos já vendidos, então filas, assentos e PCD só mudam numa sala
          sem sessões. Cancele as sessões futuras ou cadastre uma nova sala com o novo layout.
        </Text>
      </Dialogo>
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
    gap: espacos.xs,
  },
  linha: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espacos.lg },
  coluna: { flexGrow: 1, flexBasis: 200 },
  subtitulo: { ...tipografia.subtitulo, color: cores.texto },
  resumo: { ...tipografia.corpo, color: cores.textoSecundario, marginBottom: espacos.md },
  mapa: { backgroundColor: cores.fundo, borderRadius: raios.md, padding: espacos.lg, marginBottom: espacos.xl },
  textoDialogo: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
});
