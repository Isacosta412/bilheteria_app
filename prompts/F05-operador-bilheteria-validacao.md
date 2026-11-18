# F05 – Operador: venda no balcão e validação na entrada

```
Use o Plan Mode. Crie as tabs do grupo (operador): Bilheteria | Validar | Gerência | Relatórios.

1. Bilheteria (venda presencial) – fluxo em etapas, otimizado para rapidez:
   a) escolher a sessão (lista das sessões de hoje em diante, com busca por filme);
   b) mapa de assentos (REUSE o MapaAssentos);
   c) resumo + método de pagamento (Dinheiro | Cartão | PIX) + campo opcional "Nome do comprador"; para dinheiro, um campo "Valor recebido" que calcula o troco SÓ na tela (o valor oficial é o da API);
   d) POST /balcao/vendas → tela com os ingressos emitidos (QR + código), um botão "Nova venda" e a opção de imprimir na web (window.print com CSS de impressão simples).
   Trate o 409 igual ao cliente.
2. Validar entrada:
   - campo grande para digitar o código (maiúsculas automáticas, ignorando espaços) + o botão "Validar";
   - botão "Ler QR code" com expo-camera (peça a permissão e trate a recusa); na web, se não houver câmera, esconda o botão;
   - resultado em tela cheia, com cor e ícone: VERDE "Entrada liberada" (filme, sala, assento) | AMARELO "Ingresso já utilizado às 19:12" | VERMELHO "Ingresso inválido" ou "Fora do horário da sessão";
   - volta automaticamente para o campo em 3 s, pronto para o próximo.
Rode tsc e lint.
```
