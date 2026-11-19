import { Tabs } from 'expo-router';
import { IconeAba } from '@/components/IconeAba';
import { opcoesAbas } from '@/theme/navegacao';

/** Abas do cliente. A checagem de papel fica no layout de fora, app/(cliente)/_layout.tsx. */
export default function AbasCliente() {
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
