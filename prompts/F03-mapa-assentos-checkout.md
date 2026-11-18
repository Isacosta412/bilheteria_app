# F03 – Mapa de assentos, reserva e checkout (tela principal da apresentação)

```
Esta é a tela mais importante do app. Use o Plan Mode e me mostre um esboço (ASCII) do layout antes de codar.

1. Componente src/components/MapaAssentos.tsx (reutilizável no cliente e no balcão):
   - props: mapa (do GET /sessoes/:id/assentos), selecionados, onAlternar(assentoId), maxSelecao (10);
   - indicação "TELA" no topo (barra curva), letras das filas nas laterais, números em cima, corredor central quando a fila for longa;
   - componente Assento memoizado com os estados livre, selecionado, reservado, vendido e minhaReserva; PCD/VIP com ícone; accessibilityLabel completo; desabilitado se não estiver livre;
   - LegendaAssentos abaixo do mapa;
   - na web, escala o mapa para caber na largura; no mobile, ScrollView horizontal.
2. (cliente)/sessao/[id].tsx:
   - cabeçalho com o filme, a sala, a data/hora e o preço;
   - useMapaAssentos(sessaoId) com refetchInterval de 5000 ms;
   - se um assento selecionado ficar indisponível no refetch, remova-o da seleção e avise com um toast;
   - rodapé fixo: "3 assentos · C7, C8, C9 · R$ 75,00" (o total exibido aqui é só uma prévia; o valor oficial vem da API) + o botão "Reservar".
   - POST /reservas → em caso de sucesso, navega para checkout/[reservaId]; em 409, mostra a mensagem do CLAUDE.md, recarrega o mapa e mantém os demais selecionados.
3. (cliente)/checkout/[reservaId].tsx:
   - resumo vindo da API (filme, sessão, assentos, total oficial);
   - useContagemRegressiva(expiraEm), com o tempo restante em destaque (vermelho abaixo de 1 min);
   - escolha do método: PIX ou Cartão (simulados). Para o cartão, mostre um aviso visível "Pagamento simulado – não digite dados reais" e NÃO peça número de cartão. Para o PIX, um QR fictício e o botão "Já paguei";
   - botões "Pagar" e "Cancelar reserva" (DELETE /reservas/:id);
   - expirou → modal "Sua reserva expirou e os assentos foram liberados" → volta ao mapa;
   - pagou → tela de sucesso com animação simples e o botão "Ver meus ingressos".
4. Invalide as queries do mapa e dos ingressos depois de reservar, pagar ou cancelar.

Teste na web com duas janelas (dois clientes) escolhendo o mesmo assento: só um deve conseguir. Rode tsc e lint.
```
