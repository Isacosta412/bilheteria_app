import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codigoDoErro, errosDeCampo, traduzirErro } from '@/api/client';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { LogoPipocou } from '@/components/LogoPipocou';
import { MensagemErro } from '@/components/MensagemErro';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/hooks/useAuth';
import { cadastroSchema, type FormCadastro } from '@/schemas/auth';
import { cores, espacos, tipografia } from '@/theme';

const CAMPOS: (keyof FormCadastro)[] = ['nome', 'email', 'senha', 'confirmarSenha'];

export default function TelaCadastro() {
  const { cadastrar } = useAuth();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { isSubmitting },
  } = useForm<FormCadastro>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  });

  const enviar = handleSubmit(async ({ nome, email, senha }) => {
    setErroApi(null);
    try {
      // Só nome, e-mail e senha: o papel é definido pela API (sempre CLIENTE).
      await cadastrar({ nome, email, senha });
    } catch (e) {
      if (codigoDoErro(e) === 'EMAIL_EM_USO') {
        setError('email', { message: traduzirErro(e) }, { shouldFocus: true });
        return;
      }
      const porCampo = errosDeCampo(e);
      const campos = CAMPOS.filter((c) => c in porCampo);
      if (campos.length > 0) {
        for (const campo of campos) setError(campo, { message: porCampo[campo] });
        return;
      }
      setErroApi(traduzirErro(e));
    }
  });

  return (
    <Tela centralizar bordas={['top', 'left', 'right', 'bottom']}>
      <View style={estilos.cartao}>
        <LogoPipocou tamanho={56} />
        <Text style={estilos.slogan}>Teu lugar, tua pipoca, tua sessão.</Text>
        <Text style={estilos.titulo} accessibilityRole="header">
          Criar conta
        </Text>

        {erroApi !== null && <MensagemErro mensagem={erroApi} compacta />}

        <Campo
          control={control}
          name="nome"
          rotulo="Nome"
          placeholder="Como devemos te chamar?"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('email')}
        />
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
          dica="Mínimo de 8 caracteres."
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('confirmarSenha')}
        />
        <Campo
          control={control}
          name="confirmarSenha"
          rotulo="Confirme a senha"
          senha
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={() => void enviar()}
        />

        <Botao titulo="Criar conta" onPress={() => void enviar()} carregando={isSubmitting} />

        <View style={estilos.rodape}>
          <Text style={estilos.rodapeTexto}>Já tem conta?</Text>
          <Link href="/login" style={estilos.link} accessibilityRole="link">
            Entrar
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
  titulo: { ...tipografia.titulo, color: cores.texto, textAlign: 'center', marginBottom: espacos.lg },
  slogan: {
    ...tipografia.corpo,
    fontStyle: 'italic',
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.xs,
    marginBottom: espacos.lg,
  },
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
