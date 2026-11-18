# bilheteria-app

App da bilheteria com marcação de assentos (Trabalho Final de Programação II + Banco de Dados II – Unoesc).
Consome a API [bilheteria-api](https://github.com/Isacosta412/bilheteria_api).

**Stack:** Expo (SDK 58) + React Native + TypeScript strict, Expo Router, React Query, react-hook-form + zod, axios.
Alvos: **Web** (apresentação) e Android/iOS pelo Expo Go.

## Como rodar

Pré-requisitos: Node.js 20+ e a API rodando (veja o README do backend).

```bash
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm run web                 # abre em http://localhost:8081
```

- **No celular (Expo Go):** rode `npm start` e leia o QR code. No `.env`, troque `EXPO_PUBLIC_API_URL` pelo IP do computador na rede local (ex.: `http://192.168.0.10:3333`).
- **Contas:** o operador é criado pelo `npm run seed` do backend; clientes se cadastram pela tela "Cadastre-se".

| Script | O que faz |
|---|---|
| `npm run web` | Expo na web (porta 8081) |
| `npm start` | Expo Dev Server (Expo Go no celular) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (`expo lint`) |

## Estrutura

```
app/                      rotas (Expo Router)
  _layout.tsx             providers (React Query, Auth) e tela de carregamento
  (publico)/              login, cadastro           → só sem login
  (cliente)/              abas do CLIENTE ( / )     → só CLIENTE
  (operador)/             abas do OPERADOR ( /balcao, /validar, /gerencia, /relatorios ) → só OPERADOR
src/
  api/        cliente axios (token, 401 → logout), traduzirErro, dicionário de erros, um arquivo por recurso
  components/ Botao, Campo, Tela, Carregando, EstadoVazio, MensagemErro…
  contexts/   AuthProvider (usuario, entrar, cadastrar, sair; restaura a sessão com GET /auth/me)
  hooks/      useAuth…
  lib/        armazenamento (SecureStore no celular, localStorage na web), rotas por papel
  schemas/    schemas zod dos formulários
  theme/      cores (contraste AA), espaçamentos, tipografia
  types/      tipos que espelham os DTOs da API
```

**Proteção por papel:** cada grupo confere o papel no próprio `_layout.tsx` e redireciona para a tela inicial do papel do usuário (`src/lib/rotas.ts`). Por exemplo, um cliente que digita `/balcao` na web volta para `/`. A API recusa de qualquer jeito; essa é a camada de interface.

**Erros:** a tela nunca mostra JSON nem stack trace. `traduzirErro(e)` converte o `erro.codigo` da API em uma mensagem em português (`src/api/erros.ts`).
