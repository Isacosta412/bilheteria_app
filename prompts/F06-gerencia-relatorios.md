# F06 – Operador: gerência (cadastros) e relatórios

```
Use o Plan Mode. Todos os formulários com react-hook-form + zod, pedindo SOMENTE o necessário (CLAUDE.md, regras de interface).

1. Gerência > Filmes: lista (busca, ativo/inativo) + formulário com título, sinopse, duração (min), classificação (seletor), gênero e URL do pôster opcional com pré-visualização. Ativar/desativar com confirmação.
2. Gerência > Salas: lista + formulário com nome, quantidade de filas, assentos por fila e a marcação de assentos PCD tocando em uma PRÉVIA do mapa gerada na tela (reuse o MapaAssentos em modo editor). Se a API recusar a edição por haver sessões futuras, explique isso ao usuário.
3. Gerência > Sessões: lista por data + formulário com o filme (seletor por título), a sala (seletor por nome), a data e a hora (date/time picker; na web, input type datetime-local) e o preço (máscara R$). Mostre o horário previsto de término (início + duração) como informação. Exiba o erro de sobreposição da API de forma clara ("A Sala 2 já tem sessão das 19:00 às 21:15"). Cancelar sessão com confirmação.
4. Relatórios:
   - filtros de período (atalhos: hoje, 7 dias, 30 dias), filme e sala;
   - cards de totais: ingressos vendidos, receita, ocupação média;
   - tabela por sessão (filme, sala, data/hora, vendidos/capacidade, barra de ocupação %, receita), ordenável;
   - um gráfico simples de barras da ocupação por sessão (react-native-svg, sem biblioteca pesada);
   - vendas por dia/filme/método (GET /relatorios/vendas), com a divisão App × Balcão;
   - botão "Exportar CSV" (na web, baixa o arquivo de /relatorios/sessoes.csv).
Rode tsc e lint.
```
