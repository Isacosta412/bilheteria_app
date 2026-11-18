# F01 – Projeto Expo, cliente da API e autenticação

```
Leia o CLAUDE.md inteiro. Use o Plan Mode.

1. Crie o projeto Expo com o template TypeScript + Expo Router na raiz deste repositório. Configure o TypeScript strict, o ESLint e o .env.example com EXPO_PUBLIC_API_URL.
2. Crie src/theme (paleta de cinema: fundo escuro, cor primária vibrante, contraste AA), os componentes base Botao, Campo (integrado ao react-hook-form), Tela (SafeArea + largura máxima na web), Carregando, EstadoVazio e MensagemErro.
3. src/api/client.ts: axios com baseURL do env, interceptor que injeta o Bearer token, interceptor que em 401 faz logout e redireciona para o login, e a função traduzirErro(e) que mapeia erro.codigo da API para mensagens amigáveis em pt-BR (crie o dicionário em src/api/erros.ts).
4. src/types: tipos Usuario, Papel, Filme, Sala, Sessao, MapaAssentos, Reserva, Ingresso, RelatorioSessao (espelhando o docs/api.md do backend; vou colar o arquivo se você precisar).
5. Armazenamento do token: expo-secure-store no mobile e localStorage na web, atrás de uma interface única (src/lib/armazenamento.ts).
6. AuthProvider + hook useAuth (usuario, entrar, cadastrar, sair, carregando). Ao abrir o app, restaura a sessão chamando GET /auth/me.
7. Telas (publico)/login e (publico)/cadastro com react-hook-form + zod (e-mail válido, senha com 8+ caracteres, confirmação de senha). O cadastro NÃO tem campo de papel.
8. app/_layout.tsx: redireciona conforme o papel → CLIENTE para (cliente), OPERADOR para (operador), sem login para (publico). Um cliente que tentar abrir uma URL de operador na web é redirecionado.

Teste: rode `npx expo start --web`, faça login com o operador do seed e com um cliente e confirme os redirecionamentos. Rode tsc e lint.
```
