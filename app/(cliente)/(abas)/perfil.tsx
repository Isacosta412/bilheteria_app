import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/hooks/useAuth';
import { cores, espacos, raios, tipografia } from '@/theme';

/** Perfil: nome, e-mail e Sair. Nada de ID. */
export default function Perfil() {
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);

  return (
    <Tela>
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Nome</Text>
        <Text style={estilos.valor}>{usuario?.nome}</Text>
        <Text style={[estilos.rotulo, estilos.espaco]}>E-mail</Text>
        <Text style={estilos.valor}>{usuario?.email}</Text>
      </View>
      <Botao
        titulo="Sair"
        variante="secundaria"
        carregando={saindo}
        onPress={() => {
          setSaindo(true);
          void sair();
        }}
      />
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
    marginBottom: espacos.xl,
  },
  rotulo: { ...tipografia.legenda, color: cores.textoSecundario, textTransform: 'uppercase', letterSpacing: 0.5 },
  valor: { ...tipografia.subtitulo, color: cores.texto, marginTop: espacos.xs },
  espaco: { marginTop: espacos.lg },
});
