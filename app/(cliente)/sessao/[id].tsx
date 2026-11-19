import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { buscarSessao } from '@/api/sessoes';
import { Carregando } from '@/components/Carregando';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { Tela } from '@/components/Tela';
import { formatarDiaHora, formatarPreco, lugaresLivres } from '@/lib/formatacao';
import { cores, espacos, raios, tipografia } from '@/theme';

/** Resumo da sessão. O mapa de assentos entra aqui na etapa F03. */
export default function TelaSessao() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const sessaoId = Number(params.id);
  const idValido = Number.isInteger(sessaoId) && sessaoId > 0;

  const consulta = useQuery({ queryKey: chaves.sessao(sessaoId), queryFn: () => buscarSessao(sessaoId), enabled: idValido });

  if (!idValido || (isAxiosError(consulta.error) && consulta.error.response?.status === 404)) {
    return (
      <Tela centralizar>
        <EstadoVazio
          icone="🎞️"
          titulo="Sessão não encontrada"
          acao={{ titulo: 'Ver filmes em cartaz', onPress: () => router.replace('/') }}
        />
      </Tela>
    );
  }
  if (consulta.isPending) return <Carregando telaCheia mensagem="Carregando sessão…" />;
  if (consulta.error) {
    return (
      <Tela>
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void consulta.refetch()} />
      </Tela>
    );
  }

  const sessao = consulta.data;
  return (
    <Tela>
      <View style={estilos.cartao}>
        <View style={estilos.linha}>
          <SeloClassificacao classificacao={sessao.filme.classificacao} />
          <Text style={estilos.titulo} accessibilityRole="header">
            {sessao.filme.titulo}
          </Text>
        </View>
        <Text style={estilos.texto}>{formatarDiaHora(sessao.dataHora)}</Text>
        <Text style={estilos.texto}>{sessao.sala.nome}</Text>
        <Text style={estilos.texto}>
          {formatarPreco(sessao.preco)} por ingresso · {lugaresLivres(sessao.assentosLivres)}
        </Text>
      </View>
      <EstadoVazio icone="💺" titulo="Mapa de assentos" descricao="A escolha de assentos chega na próxima etapa (F03)." />
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
    gap: espacos.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.texto, flexShrink: 1 },
  texto: { ...tipografia.corpo, color: cores.textoSecundario },
});
