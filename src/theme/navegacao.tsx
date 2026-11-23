import { FundoCabecalho, TituloComLogo } from '@/components/Cabecalho';
import { cores } from './cores';

/**
 * Cabeçalho comum: vinho profundo, fio amarelo e faixa listrada vermelho/branco embaixo.
 * Usado pelas abas e pelas pilhas (Stack) do cliente e do operador.
 */
export const opcoesCabecalho = {
  headerStyle: { backgroundColor: cores.barra },
  headerBackground: () => <FundoCabecalho />,
  headerTintColor: cores.branco,
  headerTitleStyle: { fontWeight: '700' as const, color: cores.branco },
  headerShadowVisible: false,
};

/** Opções visuais comuns às abas (Tabs) dos grupos cliente e operador: logo no título. */
export const opcoesAbas = {
  ...opcoesCabecalho,
  headerTitle: ({ children }: { children: string }) => <TituloComLogo>{children}</TituloComLogo>,
  headerTitleAlign: 'left' as const,
  tabBarStyle: { backgroundColor: cores.barra, borderTopColor: cores.primaria, borderTopWidth: 2 },
  tabBarActiveTintColor: cores.primaria,
  tabBarInactiveTintColor: cores.textoSecundario,
  tabBarLabelStyle: { fontWeight: '700' as const },
  sceneStyle: { backgroundColor: cores.fundo },
};
