import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { traduzirErro } from '@/api/client';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type FormLogin } from '@/schemas/auth';
import { cores, espacos, tipografia } from '@/theme';

export default function TelaLogin() {
  const { entrar } = useAuth();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<FormLogin>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', senha: '' } });

  const enviar = handleSubmit(async (dados) => {
    setErroApi(null);
    try {
      // Com o usuário logado, o layout raiz leva para a área do papel dele.
      await entrar(dados.email, dados.senha);
    } catch (e) {
      setErroApi(traduzirErro(e));
    }
  });

  return (
    <Tela centralizar bordas={['top', 'left', 'right', 'bottom']}>
      <View style={estilos.cartao}>
        <Text style={estilos.marca} aria-hidden>
          🎬
        </Text>
        <Text style={estilos.titulo} accessibilityRole="header">
          Entrar
        </Text>
        <Text style={estilos.subtitulo}>Escolha seu lugar e garanta seu ingresso.</Text>

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

        <Botao titulo="Entrar" onPress={() => void enviar()} carregando={isSubmitting} />

        <View style={estilos.rodape}>
          <Text style={estilos.rodapeTexto}>Ainda não tem conta?</Text>
          <Link href="/cadastro" style={estilos.link} accessibilityRole="link">
            Cadastre-se
          </Link>
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: espacos.xl,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  marca: { fontSize: 40, textAlign: 'center', marginBottom: espacos.sm },
  titulo: { ...tipografia.titulo, color: cores.texto, textAlign: 'center' },
  subtitulo: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center', marginBottom: espacos.xl },
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: espacos.xs, marginTop: espacos.xl, flexWrap: 'wrap' },
  rodapeTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  link: { ...tipografia.corpoForte, color: cores.primaria, paddingVertical: espacos.sm },
});
