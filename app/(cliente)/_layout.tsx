import { Redirect, Tabs } from 'expo-router';
import { IconeAba } from '@/components/IconeAba';
import { useAuth } from '@/hooks/useAuth';
import { rotaInicial } from '@/lib/rotas';
import { opcoesAbas } from '@/theme/navegacao';

/** Área do CLIENTE: sem login vai para /login; operador vai para /balcao. */
export default function LayoutCliente() {
  const { usuario } = useAuth();
  if (usuario?.papel !== 'CLIENTE') {
    return <Redirect href={rotaInicial(usuario)} />;
  }

  return (
    <Tabs screenOptions={opcoesAbas}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Em cartaz', tabBarIcon: ({ focused }) => <IconeAba simbolo="🎬" focado={focused} /> }}
      />
      <Tabs.Screen
        name="ingressos/index"
        options={{ title: 'Meus ingressos', tabBarIcon: ({ focused }) => <IconeAba simbolo="🎟️" focado={focused} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <IconeAba simbolo="👤" focado={focused} /> }}
      />
    </Tabs>
  );
}
