import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { traduzirErro } from '@/api/client';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { FaixaListrada } from '@/components/Cabecalho';
import { ExplosaoPipoca, type Ponto } from '@/components/ExplosaoPipoca';
import { LogoPipocou } from '@/components/LogoPipocou';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import type { SessaoIniciada } from '@/contexts/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type FormLogin } from '@/schemas/auth';
import { cores, espacos, tipografia } from '@/theme';

/** Duração da comemoração do login (o total, com o balanço do logo, fica abaixo de 1,8 s). */
const DURACAO_COMEMORACAO_MS = 1500;

export default function TelaLogin() {
  const { entrar } = useAuth();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [sessao, setSessao] = useState<SessaoIniciada | null>(null);
  const [origem, setOrigem] = useState<Ponto | undefined>(undefined);
  const raizRef = useRef<ComponentRef<typeof View>>(null);
  const logoRef = useRef<ComponentRef<typeof View>>(null);
  const giro = useSharedValue(0);
  const estiloLogo = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.get()}deg` }] }));

  // Fim da animação (ou toque na tela): o usuário vira o usuário do app e o layout leva à área do papel.
  const concluir = useCallback(() => {
    sessao?.ativar();
  }, [sessao]);

  // Se a tela sair no meio da animação, a sessão é ativada mesmo assim.
  useEffect(() => () => sessao?.ativar(), [sessao]);
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<FormLogin>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', senha: '' } });

  const enviar = handleSubmit(async (dados) => {
    setErroApi(null);
    try {
      // O login acontece agora; a troca de tela espera a comemoração (só no sucesso).
      const iniciada = await entrar(dados.email, dados.senha, { adiarAtivacao: true });
      giro.set(
        withSequence(
          withTiming(-12, { duration: 70 }),
          withTiming(12, { duration: 90 }),
          withTiming(-8, { duration: 80 }),
          withTiming(0, { duration: 70 }),
        ),
      );
      setSessao(iniciada);
    } catch (e) {
      setErroApi(traduzirErro(e));
    }
  });

  /** Posição do logo dentro da tela, para as pipocas saírem dele (medida quando o layout muda). */
  function medirOrigem() {
    const raiz = raizRef.current;
    const logo = logoRef.current;
    if (!raiz || !logo) return;
    raiz.measureInWindow((rx, ry) => {
      logo.measureInWindow((lx, ly, largura, altura) => {
        setOrigem({ x: lx - rx + largura / 2, y: ly - ry + altura / 3 });
      });
    });
  }

  return (
    <View ref={raizRef} style={estilos.raiz} onLayout={medirOrigem}>
      <Tela centralizar bordas={['top', 'left', 'right', 'bottom']}>
        <View style={estilos.cartao}>
          <FaixaListrada altura={8} estilo={estilos.faixaTopo} />
          <Animated.View ref={logoRef} style={[estilos.logo, estiloLogo]} onLayout={medirOrigem}>
            <LogoPipocou tamanho={76} />
          </Animated.View>
          <Text style={estilos.slogan}>Teu lugar, tua pipoca, tua sessão.</Text>
          <Text style={estilos.titulo} accessibilityRole="header">
            Entrar
          </Text>

          {erroApi !== null && <MensagemErro mensagem={erroApi} compacta />}

          <Campo
            control={control}
            name="email"
            rotulo="E-mail"
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => setFocus('senha')}
          />
          <Campo
            control={control}
            name="senha"
            rotulo="Senha"
            senha
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => void enviar()}
          />

          <Botao titulo="Entrar" onPress={() => void enviar()} carregando={isSubmitting || sessao !== null} />

          <View style={estilos.rodape}>
            <Text style={estilos.rodapeTexto}>Ainda não tem conta?</Text>
            <Link href="/cadastro" style={estilos.link} accessibilityRole="link">
              Cadastre-se
            </Link>
          </View>
        </View>
      </Tela>

      <ExplosaoPipoca
        ativo={sessao !== null}
        origem={origem}
        quantidade={25}
        duracaoMs={DURACAO_COMEMORACAO_MS}
        texto="Pipocou! 🍿"
        alcance={0.8}
        onFim={concluir}
      />
      {sessao !== null && (
        <Pressable style={StyleSheet.absoluteFill} onPress={concluir} accessibilityRole="button" accessibilityLabel="Continuar" />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  faixaTopo: { position: 'absolute', top: 0, left: 0, right: 0 },
  cartao: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: espacos.xl,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
    paddingTop: espacos.xl + 8,
  },
  raiz: { flex: 1, backgroundColor: cores.fundo },
  logo: { alignSelf: 'center' },
  slogan: {
    ...tipografia.corpo,
    fontStyle: 'italic',
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.xs,
    marginBottom: espacos.lg,
  },
  titulo: { ...tipografia.titulo, color: cores.texto, textAlign: 'center', marginBottom: espacos.lg },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacos.xs,
    marginTop: espacos.xl,
    flexWrap: 'wrap',
  },
  rodapeTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  link: { ...tipografia.corpoForte, color: cores.primaria, paddingVertical: espacos.sm },
});
