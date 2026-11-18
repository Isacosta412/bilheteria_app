import { cores } from './cores';

/** Opções visuais comuns às abas (Tabs) dos grupos cliente e operador. */
export const opcoesAbas = {
  headerStyle: { backgroundColor: cores.superficie },
  headerTintColor: cores.texto,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
  tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
  tabBarActiveTintColor: cores.primaria,
  tabBarInactiveTintColor: cores.textoSecundario,
  sceneStyle: { backgroundColor: cores.fundo },
};
