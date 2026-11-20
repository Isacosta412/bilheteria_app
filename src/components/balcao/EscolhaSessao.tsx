import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { chaves } from '@/api/chaves';
import { traduzirErro } from '@/api/client';
import { listarSessoes } from '@/api/sessoes';
import { Botao } from '@/components/Botao';
import { CampoBusca } from '@/components/CampoBusca';
import { Esqueleto } from '@/components/Esqueleto';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { SeloClassificacao } from '@/components/SeloClassificacao';
import { diaIso, formatarHora, formatarPreco, lugaresLivres, rotuloDia } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { Sessao } from '@/types';

/** Busca sem diferenciar acentos e maiúsculas ("sertao" encontra "Sertão"). */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Etapa 1 do balcão: sessões de agora em diante, agrupadas por dia, com busca por filme. */
export function EscolhaSessao({ aoEscolher }: { aoEscolher: (sessao: Sessao) => void }) {
  const [busca, setBusca] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const consulta = useQuery({ queryKey: chaves.sessoes(null, null), queryFn: () => listarSessoes({}) });

  const secoes = useMemo(() => {
    const termo = normalizar(busca.trim());
    const filtradas = (consulta.data ?? []).filter((s) => !termo || normalizar(s.filme.titulo).includes(termo));
    const grupos = new Map<string, { title: string; data: Sessao[] }>();
    for (const sessao of filtradas) {
      const data = parseISO(sessao.dataHora);
      const dia = diaIso(data);
      const grupo = grupos.get(dia) ?? { title: rotuloDia(data), data: [] };
      grupo.data.push(sessao);
      grupos.set(dia, grupo);
    }
    return [...grupos.values()];
  }, [consulta.data, busca]);

  async function atualizar() {
    setAtualizando(true);
    try {
      await consulta.refetch();
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <View style={estilos.raiz}>
      <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar filme" rotulo="Buscar sessão pelo filme" />
      {consulta.isPending ? (
        <View style={estilos.lista}>
          {Array.from({ length: 5 }, (_, i) => (
            <Esqueleto key={i} altura={64} estilo={{ marginBottom: espacos.sm, borderRadius: raios.md }} />
          ))}
        </View>
      ) : consulta.error ? (
        <MensagemErro mensagem={traduzirErro(consulta.error)} aoTentarNovamente={() => void atualizar()} />
      ) : (
        // Lista simples (a tela do balcão já rola): sem lista virtualizada aninhada num ScrollView.
        <View style={estilos.lista}>
          {secoes.length === 0 && (
            <EstadoVazio
              icone="📅"
              titulo={busca ? `Nenhuma sessão de "${busca}"` : 'Nenhuma sessão programada'}
              descricao={busca ? 'Confira o nome do filme.' : 'Cadastre sessões na aba Gerência.'}
            />
          )}
          {secoes.map((secao) => (
            <View key={secao.title}>
              <Text style={estilos.dia} accessibilityRole="header">
                {secao.title}
              </Text>
              {secao.data.map((item) => {
            const esgotada = item.assentosLivres <= 0;
            return (
              <Pressable
                key={item.id}
                onPress={() => aoEscolher(item)}
                disabled={esgotada}
                accessibilityRole="button"
                accessibilityState={{ disabled: esgotada }}
                accessibilityLabel={`${formatarHora(item.dataHora)}, ${item.filme.titulo}, ${item.sala.nome}, ${lugaresLivres(item.assentosLivres)}`}
                style={({ pressed }) => [estilos.linha, pressed && estilos.pressionado, esgotada && estilos.esgotada]}
              >
                <Text style={estilos.hora}>{formatarHora(item.dataHora)}</Text>
                <View style={estilos.info}>
                  <View style={estilos.tituloLinha}>
                    <SeloClassificacao classificacao={item.filme.classificacao} tamanho={20} />
                    <Text style={estilos.filme} numberOfLines={1}>
                      {item.filme.titulo}
                    </Text>
                  </View>
                  <Text style={estilos.detalhe}>
                    {item.sala.nome} · {formatarPreco(item.preco)} ·{' '}
                    <Text style={esgotada ? estilos.textoEsgotado : estilos.textoLivres}>{lugaresLivres(item.assentosLivres)}</Text>
                  </Text>
                </View>
                <Text style={estilos.seta} aria-hidden>
                  ›
                </Text>
              </Pressable>
            );
              })}
            </View>
          ))}
          <Botao
            titulo={atualizando ? 'Atualizando…' : 'Atualizar lista'}
            variante="texto"
            onPress={() => void atualizar()}
            desabilitado={atualizando}
          />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, gap: espacos.md },
  lista: { paddingBottom: espacos.xxl },
  vazio: { flexGrow: 1, justifyContent: 'center' },
  dia: { ...tipografia.legenda, color: cores.textoSecundario, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginTop: espacos.md, marginBottom: espacos.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    minHeight: AREA_TOQUE_MINIMA + 16,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacos.sm,
  },
  pressionado: { borderColor: cores.primaria },
  esgotada: { opacity: 0.5 },
  hora: { ...tipografia.subtitulo, color: cores.texto, minWidth: 64 },
  info: { flex: 1, gap: 2 },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  filme: { ...tipografia.corpoForte, color: cores.texto, flexShrink: 1 },
  detalhe: { ...tipografia.legenda, color: cores.textoSecundario },
  textoLivres: { color: cores.sucesso },
  textoEsgotado: { color: cores.erro },
  seta: { fontSize: 24, color: cores.textoSecundario },
});
