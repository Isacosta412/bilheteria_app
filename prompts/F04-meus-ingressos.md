# F04 – Cliente: meus ingressos com QR code

```
Use o Plan Mode.

1. (cliente)/ingressos/index.tsx: listas "Próximos" e "Anteriores", agrupadas por sessão (filme, data, sala e os assentos). Selo de status: Válido (verde), Utilizado (cinza), Sessão encerrada.
2. (cliente)/ingressos/[codigo].tsx: "ingresso" estilizado (recorte lateral de canhoto), com filme, data/hora, sala, fila/assento, um QR code grande (react-native-qrcode-svg com o valor = código) e o código em texto, com espaçamento para facilitar a digitação no balcão (ex.: "K7PX 3MQ9 2A").
   Ingresso utilizado → QR esmaecido com a tarja "UTILIZADO em 24/11 19:12".
3. Brilho e ergonomia: no mobile, mantenha a tela acesa (expo-keep-awake) enquanto o QR estiver aberto.
Rode tsc e lint.
```
