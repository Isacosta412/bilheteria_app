# F02 – Cliente: filmes em cartaz e sessões

```
Use o Plan Mode. Crie as tabs do grupo (cliente): Em cartaz | Meus ingressos | Perfil.

1. (cliente)/index.tsx – Em cartaz:
   - grade ou lista de filmes ativos (pôster, título, classificação indicativa com selo colorido, duração, gênero), com busca por título;
   - um filtro de datas (chips "Hoje", "Amanhã", e os próximos dias) que mostra só os filmes com sessão no dia;
   - pull-to-refresh, skeleton de carregamento, estado vazio.
2. (cliente)/filme/[id].tsx: detalhes do filme e as sessões agrupadas por dia → cards com horário, sala, preço formatado (R$) e "X lugares livres" (se a API fornecer).
3. Tocar em uma sessão leva para sessao/[id].
4. (cliente)/perfil: nome, e-mail e o botão Sair. Nada de ID.

Use React Query com chaves bem definidas (['filmes', filtros], ['sessoes', filmeId, data]). Formate datas com date-fns ptBR ("ter, 24/11 · 19:30").
Rode tsc e lint.
```
