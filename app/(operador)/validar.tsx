import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { codigoDoErro, detalhesDoErro, mensagemDaApi, traduzirErro } from '@/api/client';
import { validarIngresso } from '@/api/ingressos';
import { Botao } from '@/components/Botao';
import { FundoCinema } from '@/components/FundoCinema';
import { Tela } from '@/components/Tela';
import { LeitorQr } from '@/components/validacao/LeitorQr';
import { ResultadoValidacao, type Resultado } from '@/components/validacao/ResultadoValidacao';
import { formatarHora } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { Ingresso } from '@/types';

const TAMANHO_CODIGO = 10;
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' });

/** Maiúsculas, sem espaços e hífens (o código impresso vem em grupos: "K7PX 3MQ9 2A"). */
function normalizar(texto: string): string {
  return texto.replace(/[\s-]/g, '').toUpperCase().slice(0, TAMANHO_CODIGO);
}

function resultadoLiberado(ingresso: Ingresso): Resultado {
  return {
    tipo: 'liberado',
    titulo: 'Entrada liberada',
    linhas: [
      ingresso.filme.titulo,
      `${ingresso.sala.nome} · Fila ${ingresso.fila} · Assento ${ingresso.numero}`,
      ingresso.tipoIngresso === 'MEIA' ? 'Meia-entrada: confira o documento' : 'Inteira',
    ],
  };
}

function resultadoDoErro(erro: unknown): Resultado {
  const codigo = codigoDoErro(erro);
  if (codigo === 'INGRESSO_JA_UTILIZADO') {
    const detalhes = detalhesDoErro(erro);
    const utilizadoEm =
      typeof detalhes === 'object' && detalhes !== null && 'utilizadoEm' in detalhes && typeof detalhes.utilizadoEm === 'string'
        ? detalhes.utilizadoEm
        : null;
    return {
      tipo: 'utilizado',
      titulo: utilizadoEm ? `Ingresso já utilizado às ${formatarHora(utilizadoEm)}` : 'Ingresso já utilizado',
      linhas: ['Não libere a entrada.'],
    };
  }
  if (codigo === 'INGRESSO_INVALIDO') {
    return { tipo: 'recusado', titulo: 'Ingresso inválido', linhas: ['Confira o código digitado.'] };
  }
  if (codigo === 'INGRESSO_FORA_DO_HORARIO') {
    // A mensagem da API diz quando a entrada abre (ou que a sessão já terminou); o título já diz o resto.
    const detalhe = (mensagemDaApi(erro) ?? '').replace(/^Fora do horário da sessão:\s*/i, '');
    const linha = detalhe ? detalhe.charAt(0).toUpperCase() + detalhe.slice(1) : '';
    return { tipo: 'recusado', titulo: 'Fora do horário da sessão', linhas: linha ? [linha] : [] };
  }
  return { tipo: 'recusado', titulo: 'Não foi possível validar', linhas: [traduzirErro(erro)] };
}

/** Na web, o botão da câmera só aparece se houver uma câmera disponível. */
function useTemCamera(): boolean {
  const [tem, setTem] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const dispositivos = globalThis.navigator?.mediaDevices;
    if (!dispositivos?.enumerateDevices) return;
    dispositivos
      .enumerateDevices()
      .then((lista) => setTem(lista.some((d) => d.kind === 'videoinput')))
      .catch(() => setTem(false));
  }, []);
  return tem;
}

export default function Validar() {
  const queryClient = useQueryClient();
  const entrada = useRef<ComponentRef<typeof TextInput>>(null);
  const temCamera = useTemCamera();
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cameraAberta, setCameraAberta] = useState(false);

  const validacao = useMutation({
    mutationFn: validarIngresso,
    onSuccess: ({ ingresso }) => {
      setResultado(resultadoLiberado(ingresso));
      void queryClient.invalidateQueries({ queryKey: ['ingressos'] });
    },
    onError: (erro) => setResultado(resultadoDoErro(erro)),
  });

  function enviar(texto = codigo) {
    const normalizado = normalizar(texto);
    if (!normalizado || validacao.isPending || resultado) return;
    validacao.mutate(normalizado);
  }

  // Depois de 3 s (ou de um toque): limpa o campo e devolve o foco, pronto para o próximo.
  const fecharResultado = useCallback(() => {
    setResultado(null);
    setCodigo('');
    setTimeout(() => entrada.current?.focus(), 50);
  }, []);

  const telaResultado = resultado && <ResultadoValidacao resultado={resultado} aoFechar={fecharResultado} />;

  return (
    <View style={estilos.raiz}>
      <FundoCinema />
      <Tela centralizar>
        <View style={estilos.cartao}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Validar entrada
          </Text>
          <Text style={estilos.descricao}>Digite o código do ingresso ou leia o QR code.</Text>

          <TextInput
            ref={entrada}
            value={codigo}
            onChangeText={(t) => setCodigo(normalizar(t))}
            onSubmitEditing={() => enviar()}
            autoFocus
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            returnKeyType="go"
            placeholder="K7PX3MQ92A"
            placeholderTextColor={cores.textoSecundario}
            accessibilityLabel="Código do ingresso"
            style={estilos.campo}
          />

          <Botao
            titulo="Validar"
            onPress={() => enviar()}
            carregando={validacao.isPending}
            desabilitado={codigo.length === 0}
          />
          {temCamera && (
            <Botao titulo="📷  Ler QR code" variante="secundaria" onPress={() => setCameraAberta(true)} />
          )}
        </View>
      </Tela>

      <LeitorQr
        aberto={cameraAberta}
        pausado={resultado !== null || validacao.isPending}
        aoLer={(lido) => enviar(lido)}
        aoFechar={() => setCameraAberta(false)}
      >
        {cameraAberta && telaResultado}
      </LeitorQr>

      {!cameraAberta && telaResultado}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  cartao: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.xl,
    gap: espacos.md,
  },
  titulo: { ...tipografia.titulo, color: cores.texto, textAlign: 'center' },
  descricao: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  campo: {
    minHeight: AREA_TOQUE_MINIMA + 24,
    borderWidth: 2,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.md,
    backgroundColor: cores.fundo,
    color: cores.texto,
    fontFamily: MONO,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    paddingHorizontal: espacos.md,
  },
});
