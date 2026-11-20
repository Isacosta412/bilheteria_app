import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { atualizarSala, listarSalas } from '@/api/salas';
import { Botao } from '@/components/Botao';
import { Dialogo } from '@/components/Dialogo';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ItemLista, Selo } from '@/components/gerencia/ItemLista';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useToast } from '@/components/Toast';
import { cores, espacos, tipografia } from '@/theme';
import type { Sala } from '@/types';

export default function ListaSalas() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [alvo, setAlvo] = useState<Sala | null>(null);
  const consulta = useQuery({ queryKey: chaves.salas(), queryFn: listarSalas });

  const alternar = useMutation({
    mutationFn: (sala: Sala) => atualizarSala(sala.id, { nome: sala.nome, ativa: !sala.ativa }),
    onSuccess: (sala) => {
      toast.mostrar(sala.ativa ? `${sala.nome} reativada.` : `${sala.nome} desativada.`, 'sucesso');
      void queryClient.invalidateQueries({ queryKey: chaves.salas() });
    },
    onError: (erro) => toast.mostrar(traduzirErro(erro), 'erro'),
    onSettled: () => setAlvo(null),
  });

  let conteudo;
  if (consulta.isPending) {
    conteudo = [0, 1, 2].map((i) => <Esqueleto key={i} altura={72} />);
  } else if (consulta.isError) {
    conteudo = <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />;
  } else if (consulta.data.length === 0) {
    conteudo = <EstadoVazio icone="🏛️" titulo="Nenhuma sala cadastrada" descricao="Cadastre a primeira sala para criar sessões." />;
  } else {
    conteudo = consulta.data.map((sala) => {
      const porFila = sala.qtdFilas > 0 ? Math.round(sala.capacidade / sala.qtdFilas) : 0;
      return (
        <ItemLista
          key={sala.id}
          titulo={sala.nome}
          apagado={!sala.ativa}
          selos={!sala.ativa ? <Selo texto="Inativa" /> : undefined}
          linhas={[`${sala.capacidade} lugares · ${sala.qtdFilas} ${sala.qtdFilas === 1 ? 'fila' : 'filas'} × ${porFila} assentos`]}
          aoTocar={() => router.push({ pathname: '/gerencia/salas/[id]', params: { id: String(sala.id) } })}
          acoes={
            <Botao
              titulo={sala.ativa ? 'Desativar' : 'Ativar'}
              variante="texto"
              onPress={() => setAlvo(sala)}
              accessibilityLabel={`${sala.ativa ? 'Desativar' : 'Ativar'} ${sala.nome}`}
            />
          }
        />
      );
    });
  }

  return (
    <Tela>
      <View style={estilos.topo}>
        <Botao titulo="+ Nova sala" onPress={() => router.push({ pathname: '/gerencia/salas/[id]', params: { id: 'nova' } })} />
      </View>
      <View style={estilos.lista}>{conteudo}</View>

      <Dialogo
        visivel={alvo !== null}
        icone={alvo?.ativa ? '⏸' : '▶'}
        titulo={alvo?.ativa ? `Desativar ${alvo.nome}?` : `Ativar ${alvo?.nome ?? ''}?`}
        aoFechar={() => setAlvo(null)}
        acoes={
          <>
            <Botao titulo="Voltar" variante="secundaria" onPress={() => setAlvo(null)} desabilitado={alternar.isPending} />
            <Botao titulo={alvo?.ativa ? 'Desativar' : 'Ativar'} onPress={() => alvo && alternar.mutate(alvo)} carregando={alternar.isPending} />
          </>
        }
      >
        <Text style={estilos.textoDialogo}>
          {alvo?.ativa
            ? 'A sala deixa de receber novas sessões. As sessões já marcadas continuam.'
            : 'A sala volta a poder receber novas sessões.'}
        </Text>
      </Dialogo>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: { marginBottom: espacos.lg, alignItems: 'flex-start' },
  lista: { gap: espacos.md },
  textoDialogo: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
});
