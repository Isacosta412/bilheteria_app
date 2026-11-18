import { Redirect, Tabs } from 'expo-router';
import { Botao } from '@/components/Botao';
import { IconeAba } from '@/components/IconeAba';
import { useAuth } from '@/hooks/useAuth';
import { rotaInicial } from '@/lib/rotas';
import { opcoesAbas } from '@/theme/navegacao';

/** Área do OPERADOR: sem login vai para /login; cliente vai para "/". */
export default function LayoutOperador() {
  const { usuario, sair } = useAuth();
  if (usuario?.papel !== 'OPERADOR') {
    return <Redirect href={rotaInicial(usuario)} />;
  }

  return (
    <Tabs
      screenOptions={{
        ...opcoesAbas,
        headerRight: () => <Botao titulo="Sair" variante="texto" onPress={() => void sair()} accessibilityLabel="Sair da conta" />,
      }}
    >
      <Tabs.Screen
        name="balcao/index"
        options={{ title: 'Bilheteria', tabBarIcon: ({ focused }) => <IconeAba simbolo="🎫" focado={focused} /> }}
      />
      <Tabs.Screen
        name="validar"
        options={{ title: 'Validar', tabBarIcon: ({ focused }) => <IconeAba simbolo="✅" focado={focused} /> }}
      />
      <Tabs.Screen
        name="gerencia/index"
        options={{ title: 'Gerência', tabBarIcon: ({ focused }) => <IconeAba simbolo="🛠️" focado={focused} /> }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{ title: 'Relatórios', tabBarIcon: ({ focused }) => <IconeAba simbolo="📊" focado={focused} /> }}
      />
    </Tabs>
  );
}
