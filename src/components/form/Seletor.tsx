import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { CampoBusca } from '@/components/CampoBusca';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';

export interface OpcaoSeletor {
  id: number;
  rotulo: string;
  descricao?: string;
}

interface SeletorProps {
  rotulo: string;
  opcoes: OpcaoSeletor[];
  valor: number | null;
  aoMudar: (id: number | null) => void;
  placeholder?: string;
  /** Se informado, a lista ganha uma primeira opção "nenhum" com este texto (ex.: "Todos os filmes"). */
  rotuloNenhum?: string;
  erro?: string;
  carregando?: boolean;
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Campo de escolha por NOME (filme, sala): abre uma lista pesquisável e devolve o id.
 * O usuário nunca vê nem digita o id.
 */
export function Seletor({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  placeholder = 'Escolher…',
  rotuloNenhum,
  erro,
  carregando = false,
}: SeletorProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const escolhida = opcoes.find((o) => o.id === valor);
  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    return termo ? opcoes.filter((o) => semAcento(o.rotulo).includes(termo)) : opcoes;
  }, [opcoes, busca]);

  function escolher(id: number | null) {
    aoMudar(id);
    setAberto(false);
    setBusca('');
  }

  let texto = placeholder;
  if (escolhida) texto = escolhida.rotulo;
  else if (valor === null && rotuloNenhum !== undefined) texto = rotuloNenhum;
  else if (carregando) texto = 'Carregando…';
  const vazio = !escolhida && rotuloNenhum === undefined;

  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Pressable
        onPress={() => setAberto(true)}
        disabled={carregando}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${vazio ? 'nenhum escolhido' : texto}`}
        accessibilityHint="Abre a lista de opções"
        style={[estilos.caixa, erro !== undefined && estilos.caixaErro]}
      >
        <Text style={[estilos.valor, vazio && estilos.placeholder]} numberOfLines={1}>
          {texto}
        </Text>
        <Text style={estilos.seta} aria-hidden>
          ▾
        </Text>
      </Pressable>
      {erro !== undefined && (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erro}
        </Text>
      )}

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={estilos.fundo}>
          <View style={estilos.janela} accessibilityViewIsModal aria-modal>
            <Text style={estilos.titulo} accessibilityRole="header">
              {rotulo}
            </Text>
            {opcoes.length > 6 && (
              <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar" rotulo={`Buscar ${rotulo.toLowerCase()}`} />
            )}
            <ScrollView style={estilos.lista} contentContainerStyle={estilos.listaConteudo}>
              {rotuloNenhum !== undefined && busca.trim() === '' && (
                <Opcao rotulo={rotuloNenhum} ativa={valor === null} aoEscolher={() => escolher(null)} />
              )}
              {filtradas.map((o) => (
                <Opcao key={o.id} rotulo={o.rotulo} descricao={o.descricao} ativa={o.id === valor} aoEscolher={() => escolher(o.id)} />
              ))}
              {filtradas.length === 0 && <Text style={estilos.vazio}>Nada encontrado.</Text>}
            </ScrollView>
            <Botao titulo="Fechar" variante="secundaria" onPress={() => setAberto(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface OpcaoProps {
  rotulo: string;
  descricao?: string;
  ativa: boolean;
  aoEscolher: () => void;
}

function Opcao({ rotulo, descricao, ativa, aoEscolher }: OpcaoProps) {
  return (
    <Pressable
      onPress={aoEscolher}
      accessibilityRole="radio"
      accessibilityState={{ checked: ativa }}
      aria-checked={ativa}
      accessibilityLabel={descricao ? `${rotulo}, ${descricao}` : rotulo}
      style={({ pressed }) => [estilos.opcao, ativa && estilos.opcaoAtiva, pressed && estilos.pressionada]}
    >
      <View style={estilos.opcaoTextos}>
        <Text style={estilos.opcaoTexto}>{rotulo}</Text>
        {descricao !== undefined && <Text style={estilos.opcaoDescricao}>{descricao}</Text>}
      </View>
      {ativa && (
        <Text style={estilos.check} aria-hidden>
          ✓
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espacos.xs, marginBottom: espacos.lg },
  rotulo: { ...tipografia.corpoForte, color: cores.texto },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AREA_TOQUE_MINIMA + 4,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacos.md,
  },
  caixaErro: { borderColor: cores.erro },
  valor: { flex: 1, ...tipografia.corpo, color: cores.texto },
  placeholder: { color: cores.textoSecundario },
  seta: { color: cores.textoSecundario, fontSize: 16 },
  erro: { ...tipografia.legenda, color: cores.erro },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: espacos.lg },
  janela: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.md,
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto },
  lista: { flexGrow: 0 },
  listaConteudo: { gap: espacos.xs },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AREA_TOQUE_MINIMA,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: cores.superficieElevada,
  },
  opcaoAtiva: { borderColor: cores.primaria },
  pressionada: { opacity: 0.8 },
  opcaoTextos: { flex: 1 },
  opcaoTexto: { ...tipografia.corpoForte, color: cores.texto },
  opcaoDescricao: { ...tipografia.legenda, color: cores.textoSecundario },
  check: { color: cores.primaria, fontSize: 18, fontWeight: '800' },
  vazio: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center', padding: espacos.lg },
});
