import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { traduzirErro } from '@/api/client';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { FaixaListrada } from '@/components/Cabecalho';
import { useCortinaPipoca } from '@/components/CortinaPipoca';
import { LogoPipocou } from '@/components/LogoPipocou';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import type { SessaoIniciada } from '@/contexts/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type FormLogin } from '@/schemas/auth';
import { cores, espacos, tipografia } from '@/theme';

export default function TelaLogin() {
  const { entrar } = useAuth();
  const cortina = useCortinaPipoca();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [sessao, setSessao] = useState<SessaoIniciada | null>(null);
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<FormLogin>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', senha: '' } });

  const enviar = handleSubmit(async (dados) => {
    setErroApi(null);
    try {
      // O login acontece agora; o usuário só "entra" no app quando o balde estoura, com a tela
      // coberta pela cortina (que fica no layout raiz e some revelando a primeira tela).
      const iniciada = await entrar(dados.email, dados.senha, { adiarAtivacao: true });
      setSessao(iniciada);
      cortina.mostrar({ texto: 'Pipocou! 🍿', aoCobrir: () => iniciada.ativar() });
    } catch (e) {
      setErroApi(traduzirErro(e));
    }
  });

  return (
    <View style={estilos.raiz}>
      <Tela centralizar bordas={['top', 'left', 'right', 'bottom']}>
        <View style={estilos.cartao}>
          <FaixaListrada altura={8} estilo={estilos.faixaTopo} />
          <View style={estilos.logo}>
            <LogoPipocou tamanho={76} />
          </View>
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
