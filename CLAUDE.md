# CLAUDE.md – bilheteria-app (frontend)

Você está desenvolvendo o **aplicativo** do Trabalho Final de Programação II + Banco de Dados II (Unoesc): uma bilheteria com marcação de assentos que consome a API `bilheteria-api` (Express + Prisma). Textos da interface, mensagens de commit e documentação em **português do Brasil**.

## Stack obrigatória
- Expo (SDK atual) + React Native + **TypeScript strict**
- Expo Router (navegação por arquivos, grupos por papel)
- Alvos: **Web** (para a apresentação, publicado em uma URL) e Android/iOS via Expo Go
- Bibliotecas permitidas: `axios`, `@tanstack/react-query`, `react-hook-form` + `zod` + `@hookform/resolvers`, `expo-secure-store` (com fallback para `localStorage` na web), `react-native-qrcode-svg` + `react-native-svg`, `expo-camera` (leitura de QR na validação), `date-fns` (locale ptBR). Peça antes de adicionar outras.

## Estrutura
```
app/
  _layout.tsx                 providers (QueryClient, AuthProvider), proteção de rotas
  (publico)/login.tsx, cadastro.tsx
  (cliente)/_layout.tsx       Stack (checagem de papel) com as abas por baixo
    (abas)/                   tabs: Em cartaz | Meus ingressos | Perfil
      index.tsx               lista de filmes/sessões
      ingressos/index.tsx     meus ingressos
      perfil.tsx
    filme/[id].tsx            sessões do filme (tela empilhada, com voltar)
    sessao/[id].tsx           MAPA DE ASSENTOS
    checkout/[reservaId].tsx  resumo + contagem regressiva + pagamento simulado
    ingressos/[codigo].tsx    ingresso com QR code
  (operador)/                 tabs: Bilheteria | Validar | Gerência | Relatórios
    balcao/...                venda presencial (reusa o mapa de assentos)
    validar.tsx               digitar o código ou ler o QR
    gerencia/filmes, salas, sessoes (listas + formulários)
    relatorios.tsx
src/
  api/          cliente axios (baseURL de EXPO_PUBLIC_API_URL, interceptor do token, tratamento de 401) + um arquivo por recurso
  types/        tipos que espelham os DTOs da API (nunca use any)
  hooks/        useAuth, useMapaAssentos, useContagemRegressiva...
  components/   MapaAssentos, Assento, LegendaAssentos, CardSessao, Botao, Campo, EstadoVazio, Erro...
  schemas/      schemas zod dos formulários
  theme/        cores, espaçamentos, tipografia
```

## Regras de interface (critério "Interface gráfica", peso 3)
- **Formulários pedem apenas o necessário.** Nunca peça ou mostre ao usuário: IDs, total, status, código do ingresso, papel, datas de expiração calculadas. A sala é escolhida em um seletor pelo nome; o filme também. O total é **exibido** (vindo da API), nunca digitado.
- O usuário só vê as telas do próprio papel: o cliente não enxerga as rotas do operador (proteção no layout + a API recusa de qualquer jeito).
- Nunca exponha dados sensíveis: o token não aparece em logs nem na tela; mensagens de erro são amigáveis (mapeie `erro.codigo` da API para um texto em português); sem stack traces nem JSON cru na tela.
- Valide os formulários no cliente com zod (feedback imediato), mas trate também os erros que vêm da API.
- Estados de carregamento (skeleton/spinner), vazio e erro em todas as listas.
- Acessibilidade: `accessibilityLabel` nos assentos ("Fila C, assento 7, livre"), área de toque mínima de 32px e a legenda com **cor + ícone ou padrão**, não só cor.
- Layout responsivo: na web, centralize o conteúdo com largura máxima e faça o mapa de assentos caber na tela, com rolagem horizontal se necessário.

## Comportamento do mapa de assentos
- Cores: livre (contorno), selecionado (cor primária), reservado (amarelo com ícone de relógio), vendido (cinza com X), PCD/VIP com ícone. Indicação de "TELA" no topo.
- Atualize o mapa a cada 5 s (refetchInterval do React Query) e ao voltar para a tela.
- Se a API responder 409 `ASSENTO_INDISPONIVEL`, mostre "Ops! Alguém acabou de escolher um desses assentos", recarregue o mapa e mantenha os demais selecionados.
- Checkout com contagem regressiva até `expiraEm`; ao zerar, informe que a reserva expirou e volte ao mapa.

## Convenções
- `.env` com `EXPO_PUBLIC_API_URL`; `.env.example` versionado.
- Sem `any`, sem `// @ts-ignore`. Rode `npx tsc --noEmit` e `npx expo lint` ao fim de cada etapa.
- Ao terminar uma tarefa, responda com: o que foi feito, os arquivos alterados, como testar (web e celular) e as pendências.
