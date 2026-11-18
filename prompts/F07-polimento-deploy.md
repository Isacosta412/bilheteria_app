# F07 – Revisão de usabilidade e segurança + publicação do app

```
Três tarefas. Use o Plan Mode.

1. AUDITORIA DE INTERFACE (mostre o relatório antes de corrigir):
   - algum formulário pede ou mostra ID, total editável, status, papel ou código gerado?
   - alguma tela mostra JSON cru, stack trace, token ou mensagem de erro técnica?
   - todas as listas têm estados de carregamento, vazio e erro?
   - os botões ficam desabilitados durante o envio (sem clique duplo)?
   - acessibilidade: labels nos assentos, contraste e legenda sem depender só de cor;
   - uma rota de operador acessada por um cliente na web → redireciona?
   - existe algum `any` ou `@ts-ignore`?
   Corrija o que encontrar.

2. PUBLICAÇÃO WEB (para a apresentação):
   - configure `npx expo export --platform web` e o deploy da pasta dist (escolha a opção mais simples entre Vercel, Netlify, Azure Static Web Apps ou Firebase Hosting; se o backend estiver no Azure, prefira o Static Web Apps). Configure o fallback de SPA para as rotas do Expo Router;
   - EXPO_PUBLIC_API_URL apontando para a API de produção; me lembre de colocar a URL do app no CORS_ORIGIN do backend;
   - um workflow do GitHub Actions que publique a cada push na main.
   - Mobile: instruções no README para abrir via Expo Go (npx expo start --tunnel) e, opcionalmente, gerar um APK com EAS Build (perfil preview).

3. README do app: prints das telas principais (deixe placeholders para eu inserir), como rodar, as variáveis de ambiente, a URL de produção, as credenciais de demonstração e o link para o repositório do backend.
```
