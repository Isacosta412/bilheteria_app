import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chaves } from '@/api/chaves';
import { errosDeCampo, traduzirErro } from '@/api/client';
import { atualizarFilme, buscarFilme, criarFilme, type DadosFilme } from '@/api/filmes';
import { Botao } from '@/components/Botao';
import { voltarOuIr } from '@/lib/rotas';
import { Campo } from '@/components/Campo';
import { Carregando } from '@/components/Carregando';
import { OpcoesChips } from '@/components/form/OpcoesChips';
import { MensagemErro } from '@/components/MensagemErro';
import { Poster } from '@/components/Poster';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { CLASSIFICACOES, filmeSchema, type FormFilme } from '@/schemas/filme';
import { cores, espacos, raios, tipografia } from '@/theme';
import type { Classificacao, Filme } from '@/types';

const ROTULO_CLASSIFICACAO: Record<Classificacao, string> = {
  LIVRE: 'Livre',
  DEZ: '10 anos',
  DOZE: '12 anos',
  CATORZE: '14 anos',
  DEZESSEIS: '16 anos',
  DEZOITO: '18 anos',
};

const CAMPOS: (keyof FormFilme)[] = ['titulo', 'sinopse', 'duracaoMinutos', 'classificacao', 'genero', 'posterUrl'];

/** /gerencia/filmes/novo cria; /gerencia/filmes/12 edita. */
export default function FormularioFilme() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const novo = id === 'novo';
  const filmeId = Number(id);

  const consulta = useQuery({
    queryKey: chaves.filme(filmeId),
    queryFn: () => buscarFilme(filmeId),
    enabled: !novo && Number.isInteger(filmeId) && filmeId > 0,
  });

  if (novo) return <Formulario />;
  if (consulta.isPending) return <Carregando telaCheia mensagem="Carregando o filme…" />;
  if (consulta.isError) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />
      </Tela>
    );
  }
  return <Formulario filme={consulta.data} />;
}

function Formulario({ filme }: { filme?: Filme }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { control, handleSubmit, setError } = useForm<FormFilme>({
    resolver: zodResolver(filmeSchema),
    mode: 'onTouched',
    defaultValues: {
      titulo: filme?.titulo ?? '',
      sinopse: filme?.sinopse ?? '',
      duracaoMinutos: filme ? String(filme.duracaoMinutos) : '',
      classificacao: filme?.classificacao,
      genero: filme?.genero ?? '',
      posterUrl: filme?.posterUrl ?? '',
    },
  });
  const [titulo, posterUrl] = useWatch({ control, name: ['titulo', 'posterUrl'] });
  const posterAtrasado = useDebounce(posterUrl.trim(), 500);
  const posterValido = /^https?:\/\/\S+$/i.test(posterAtrasado);

  const salvar = useMutation({
    mutationFn: (dados: DadosFilme) => (filme ? atualizarFilme(filme.id, dados) : criarFilme(dados)),
    onSuccess: (salvo) => {
      toast.mostrar(filme ? 'Filme atualizado.' : `"${salvo.titulo}" cadastrado.`, 'sucesso');
      void queryClient.invalidateQueries({ queryKey: ['filmes'] });
      void queryClient.invalidateQueries({ queryKey: chaves.filme(salvo.id) });
      void queryClient.invalidateQueries({ queryKey: chaves.todasSessoes() });
      voltarOuIr(router, '/gerencia/filmes' as Href);
    },
    onError: (erro) => {
      const porCampo = errosDeCampo(erro);
      let marcou = false;
      for (const campo of CAMPOS) {
        const mensagem = porCampo[campo];
        if (mensagem) {
          setError(campo, { message: mensagem.charAt(0).toUpperCase() + mensagem.slice(1) + '.' });
          marcou = true;
        }
      }
      if (!marcou) toast.mostrar(traduzirErro(erro), 'erro');
    },
  });

  const enviar = handleSubmit((dados) =>
    salvar.mutate({
      titulo: dados.titulo,
      sinopse: dados.sinopse,
      duracaoMinutos: Number(dados.duracaoMinutos),
      classificacao: dados.classificacao,
      genero: dados.genero,
      posterUrl: dados.posterUrl === '' ? null : dados.posterUrl,
    }),
  );

  return (
    <Tela>
      <Stack.Screen options={{ title: filme ? 'Editar filme' : 'Novo filme' }} />
      <View style={estilos.cartao}>
        <Campo control={control} name="titulo" rotulo="Título" maxLength={200} autoCapitalize="sentences" />
        <Campo
          control={control}
          name="sinopse"
          rotulo="Sinopse"
          multiline
          numberOfLines={5}
          maxLength={5000}
          textAlignVertical="top"
          estiloInput={estilos.sinopse}
        />
        <View style={estilos.linha}>
          <View style={estilos.coluna}>
            <Campo
              control={control}
              name="duracaoMinutos"
              rotulo="Duração (minutos)"
              keyboardType="number-pad"
              maxLength={3}
              mascara={(t) => t.replace(/\D/g, '')}
              placeholder="Ex.: 112"
            />
          </View>
          <View style={estilos.coluna}>
            <Campo control={control} name="genero" rotulo="Gênero" maxLength={60} placeholder="Ex.: Drama" />
          </View>
        </View>

        <Controller
          control={control}
          name="classificacao"
          render={({ field, fieldState }) => (
            <View style={estilos.bloco}>
              <OpcoesChips<Classificacao>
                rotulo="Classificação indicativa"
                opcoes={CLASSIFICACOES.map((c) => ({
                  valor: c,
                  rotulo: ROTULO_CLASSIFICACAO[c],
                  icone: <SeloClassificacao classificacao={c} tamanho={20} />,
                }))}
                valor={field.value ?? null}
                aoMudar={field.onChange}
                erro={fieldState.error?.message}
              />
            </View>
          )}
        />

        <View style={estilos.linhaPoster}>
          <View style={estilos.colunaUrl}>
            <Campo
              control={control}
              name="posterUrl"
              rotulo="URL do pôster (opcional)"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="https://…"
              dica="Se a imagem não aparecer na prévia, confira o endereço."
            />
          </View>
          <View style={estilos.previa} accessibilityLabel="Prévia do pôster">
            <Text style={estilos.rotuloPrevia}>Prévia</Text>
            <Poster key={posterAtrasado} url={posterValido ? posterAtrasado : null} titulo={titulo || '?'} />
          </View>
        </View>

        <Botao titulo={filme ? 'Salvar alterações' : 'Cadastrar filme'} onPress={() => void enviar()} carregando={salvar.isPending} />
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  sinopse: { minHeight: 120 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espacos.lg },
  coluna: { flexGrow: 1, flexBasis: 200 },
  bloco: { marginBottom: espacos.lg },
  linhaPoster: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.lg, marginBottom: espacos.lg },
  colunaUrl: { flexGrow: 1, flexBasis: 260 },
  previa: { width: 110, gap: espacos.xs },
  rotuloPrevia: { ...tipografia.legenda, color: cores.textoSecundario },
});
