# bilheteria-app

App da bilheteria de cinema com **marcação de assentos**: Trabalho Final de Programação II + Banco de Dados II (Unoesc).
O cliente escolhe o lugar no mapa, reserva, paga (pagamento simulado) e recebe o ingresso com QR code. O operador vende no balcão, valida a entrada, cadastra filmes, salas e sessões e acompanha os relatórios.

- **App em produção:** `<URL do app – preencher após o primeiro deploy>`
- **API (backend):** [bilheteria-api](https://github.com/Isacosta412/bilheteria_api), em produção em `<URL da API – preencher>`

**Stack:** Expo (SDK 58) + React Native + TypeScript strict, Expo Router, React Query, react-hook-form + zod, axios, react-native-svg / react-native-qrcode-svg, expo-camera.
Alvos: **Web** (usado na apresentação) e Android/iOS pelo Expo Go.

## Telas

> Coloque as imagens em `docs/prints/` com os nomes abaixo.

| Cliente | |
|---|---|
| ![Catálogo (Em cartaz)](docs/prints/01-catalogo.png) | ![Mapa de assentos](docs/prints/02-mapa-assentos.png) |
| Catálogo com filtro por dia | Mapa de assentos (atualiza a cada 5 s) |
| ![Pagamento](docs/prints/03-checkout.png) | ![Ingresso com QR code](docs/prints/04-ingresso.png) |
| Pagamento com contagem regressiva | Ingresso com QR code |

| Operador | |
|---|---|
| ![Venda no balcão](docs/prints/05-balcao.png) | ![Validar entrada](docs/prints/06-validar.png) |
| Venda no balcão com troco | Validação na entrada (código ou QR) |
| ![Gerência](docs/prints/07-gerencia.png) | ![Relatórios](docs/prints/08-relatorios.png) |
| Cadastro de salas com marcação de PCD | Relatórios: ocupação, receita, App × Balcão |

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Operador | `<preencher>` | `<preencher>` |
| Cliente | `<preencher>` | `<preencher>` |

O operador é criado pelo `npm run seed` do backend (e-mail e senha vêm do `.env` dele: `SEED_OPERADOR_*`). Clientes podem se cadastrar pela tela "Cadastre-se".

## Como rodar (desenvolvimento)

Pré-requisitos: Node.js 20+ e a API rodando (veja o README do backend).

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run web
```

O app abre em http://localhost:8081. No PowerShell, troque o `cp` por `Copy-Item .env.example .env`.

### Variáveis de ambiente

| Variável | Exemplo | Para quê |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3333` | Endereço da API. Vai junto no código do app: **nunca coloque segredos** em variáveis `EXPO_PUBLIC_*`. |

Valores comuns: web e emulador iOS no mesmo computador → `http://localhost:3333`; emulador Android → `http://10.0.2.2:3333`; celular na mesma rede → `http://<IP-do-computador>:3333`.
A origem do app (ex.: `http://localhost:8081`) precisa estar no `CORS_ORIGIN` do backend.

### Scripts

| Script | O que faz |
|---|---|
| `npm run web` | Expo na web (porta 8081) |
| `npm start` | Expo Dev Server (Expo Go no celular) |
| `npm run build:web` | `expo export --platform web` → pasta `dist/` (site estático) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (`expo lint`) |

## Celular

### Expo Go (mais simples)
1. Instale o **Expo Go** (Android ou iOS).
2. No `.env`, aponte `EXPO_PUBLIC_API_URL` para uma API que o celular alcance: a URL de produção ou `http://<IP-do-computador>:3333`.
3. Rode o comando abaixo e leia o QR code com o Expo Go (Android) ou com a câmera (iOS):

```bash
npx expo start --tunnel
```

O `--tunnel` funciona mesmo quando o celular e o computador estão em redes diferentes. Na mesma rede Wi-Fi, `npx expo start` basta.

### APK com EAS Build (opcional)
O perfil `preview` do [`eas.json`](eas.json) gera um APK para instalar direto no Android.
1. Troque `EXPO_PUBLIC_API_URL` no `eas.json` pela URL da API de produção.
2. Rode os comandos abaixo (precisa de uma conta Expo gratuita; o build roda na nuvem da Expo):

```bash
npx eas-cli login
```

```bash
npx eas-cli build --platform android --profile preview
```

Ao terminar, o EAS mostra o link para baixar o APK.

## Publicação web (Netlify)

O app web é um site estático (`dist/`) com **fallback de SPA**: qualquer rota (ex.: `/gerencia/filmes`) abre o `index.html` e o Expo Router resolve a tela. O fallback está em `public/_redirects` (copiado para o `dist/`) e no `netlify.toml`.

**Publicação automática:** o workflow [`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml) roda a cada push na `main`. Ele checa os tipos, roda o lint, gera o `dist/` e publica no Netlify. Configuração (uma vez):
1. No Netlify, crie um site vazio ("Add new site → Deploy manually") e anote o **Site ID** (Site configuration → General).
2. Gere um token em User settings → Applications → **Personal access tokens**.
3. No GitHub, em Settings → Secrets and variables → Actions:
   - **Secrets:** `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID`;
   - **Variables:** `EXPO_PUBLIC_API_URL` = URL da API em produção.
4. Faça um push na `main` (ou rode o workflow em Actions → "Publicar web" → Run workflow).
5. **Coloque a URL do app (ex.: `https://bilheteria-xyz.netlify.app`) no `CORS_ORIGIN` da API de produção**; sem isso, o navegador bloqueia as chamadas.

Sem os segredos, o workflow só valida e gera o build, sem publicar.

## Estrutura

```
app/                      rotas (Expo Router)
  _layout.tsx             providers (React Query, Auth), carregamento e tela de erro amigável (ErrorBoundary)
  (publico)/              login, cadastro                       → só sem login
  (cliente)/              catálogo, mapa, pagamento, ingressos  → só CLIENTE
  (operador)/             balcão, validar, gerência, relatórios → só OPERADOR
src/
  api/        cliente axios (token, 401 → logout), traduzirErro, dicionário de erros, um arquivo por recurso
  components/ Botao, Campo, MapaAssentos, Toast, Dialogo, formulários, relatórios…
  contexts/   AuthProvider (usuário, entrar, cadastrar, sair; restaura a sessão com GET /auth/me)
  hooks/      useAuth, useMapaAssentos, useSelecaoAssentos, useContagemRegressiva…
  lib/        armazenamento (SecureStore no celular, localStorage na web), rotas, formatação, dinheiro
  schemas/    schemas zod dos formulários
  theme/      cores (contraste AA), espaçamentos, tipografia
  types/      tipos que espelham os DTOs da API
```

**Proteção por papel:** cada grupo confere o papel no próprio `_layout.tsx` e manda o usuário para a tela inicial do seu papel (`src/lib/rotas.ts`). Um cliente que digita `/relatorios` na web volta para `/`. A API recusa de qualquer jeito; esta é a camada de interface.

**Erros:** a tela nunca mostra JSON, stack trace nem token. `traduzirErro(e)` converte o `erro.codigo` da API em uma mensagem em português (`src/api/erros.ts`), e um erro inesperado de tela cai no `ErrorBoundary` com "Tentar de novo".
