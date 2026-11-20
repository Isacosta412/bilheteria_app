import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { definirFilmeAtivo, listarFilmes } from '@/api/filmes';
import { Botao } from '@/components/Botao';
import { CampoBusca } from '@/components/CampoBusca';
import { Dialogo } from '@/components/Dialogo';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { OpcoesChips } from '@/components/form/OpcoesChips';
import { ItemLista, Selo } from '@/components/gerencia/ItemLista';
import { MensagemErro } from '@/components/MensagemErro';
import { Poster } from '@/components/Poster';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatarDuracao } from '@/lib/formatacao';
import { cores, espacos, tipografia } from '@/theme';
import type { Filme } from '@/types';

type FiltroAtivo = 'todos' | 'ativos' | 'inativos';

const ATIVO_DO_FILTRO: Record<FiltroAtivo, boolean | undefined> = { todos: undefined, ativos: true, inativos: false };

export default function ListaFilmes() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroAtivo>('todos');
  const [alvo, setAlvo] = useState<Filme | null>(null);
  const buscaAtrasada = useDebounce(busca.trim());

  const params = { ativo: ATIVO_DO_FILTRO[filtro], busca: buscaAtrasada || undefined };
  const consulta = useQuery({ queryKey: chaves.filmes(params), queryFn: () => listarFilmes(params) });

  const alternar = useMutation({
    mutationFn: (filme: Filme) => definirFilmeAtivo(filme.id, !filme.ativo),
    onSuccess: (filme) => {
      toast.mostrar(filme.ativo ? `"${filme.titulo}" voltou ao catálogo.` : `"${filme.titulo}" saiu do catálogo.`, 'sucesso');
      void queryClient.invalidateQueries({ queryKey: ['filmes'] });
      void queryClient.invalidateQueries({ queryKey: chaves.filme(filme.id) });
    },
    onError: (erro) => toast.mostrar(traduzirErro(erro), 'erro'),
    onSettled: () => setAlvo(null),
  });

  let conteudo;
  if (consulta.isPending) {
    conteudo = [0, 1, 2].map((i) => <Esqueleto key={i} altura={88} />);
  } else if (consulta.isError) {
    conteudo = <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />;
  } else if (consulta.data.length === 0) {
    conteudo = (
      <EstadoVazio
        icone="🎞️"
        titulo={busca || filtro !== 'todos' ? 'Nenhum filme encontrado' : 'Nenhum filme cadastrado'}
        descricao={busca || filtro !== 'todos' ? 'Tente outra busca ou outro filtro.' : 'Cadastre o primeiro filme do catálogo.'}
      />
    );
  } else {
    conteudo = consulta.data.map((filme) => (
      <ItemLista
        key={filme.id}
        titulo={filme.titulo}
        apagado={!filme.ativo}
        inicio={<Poster url={filme.posterUrl} titulo={filme.titulo} estilo={estilos.poster} />}
        selos={
          <>
            <SeloClassificacao classificacao={filme.classificacao} tamanho={22} />
            {!filme.ativo && <Selo texto="Inativo" />}
          </>
        }
        linhas={[`${filme.genero} · ${formatarDuracao(filme.duracaoMinutos)}`]}
        aoTocar={() => router.push({ pathname: '/gerencia/filmes/[id]', params: { id: String(filme.id) } })}
        acoes={
          <Botao
            titulo={filme.ativo ? 'Desativar' : 'Ativar'}
            variante="texto"
            onPress={() => setAlvo(filme)}
            accessibilityLabel={`${filme.ativo ? 'Desativar' : 'Ativar'} ${filme.titulo}`}
          />
        }
      />
    ));
  }

  return (
    <Tela>
      <View style={estilos.topo}>
        <Botao titulo="+ Novo filme" estilo={estilos.novo} onPress={() => router.push({ pathname: '/gerencia/filmes/[id]', params: { id: 'novo' } })} />
        <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar pelo título" rotulo="Buscar filme" />
        <OpcoesChips<FiltroAtivo>
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: 'ativos', rotulo: 'Ativos' },
            { valor: 'inativos', rotulo: 'Inativos' },
          ]}
          valor={filtro}
          aoMudar={setFiltro}
        />
      </View>
      <View style={estilos.lista}>{conteudo}</View>

      <Dialogo
        visivel={alvo !== null}
        icone={alvo?.ativo ? '⏸' : '▶'}
        titulo={alvo?.ativo ? `Desativar "${alvo.titulo}"?` : `Ativar "${alvo?.titulo ?? ''}"?`}
        aoFechar={() => setAlvo(null)}
        acoes={
          <>
            <Botao titulo="Voltar" variante="secundaria" onPress={() => setAlvo(null)} desabilitado={alternar.isPending} />
            <Botao
              titulo={alvo?.ativo ? 'Desativar' : 'Ativar'}
              onPress={() => alvo && alternar.mutate(alvo)}
              carregando={alternar.isPending}
            />
          </>
        }
      >
        <Text style={estilos.textoDialogo}>
          {alvo?.ativo
            ? 'Ele sai do catálogo e não recebe novas sessões. As sessões já marcadas e os ingressos vendidos continuam valendo.'
            : 'Ele volta a aparecer no catálogo e pode receber novas sessões.'}
        </Text>
      </Dialogo>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  novo: { alignSelf: 'flex-start' },
  topo: { gap: espacos.md, marginBottom: espacos.lg },
  lista: { gap: espacos.md },
  poster: { width: 48, borderRadius: 6 },
  textoDialogo: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
});
