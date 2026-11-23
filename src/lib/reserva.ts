import type { Reserva } from '@/types';

/** Minutos que a reserva fica guardada, pela regra do servidor (criadoEm → expiraEm, RESERVA_MINUTOS na API). */
export function minutosDaReserva(reserva: Pick<Reserva, 'criadoEm' | 'expiraEm'>): number {
  const ms = new Date(reserva.expiraEm).getTime() - new Date(reserva.criadoEm).getTime();
  return Math.max(1, Math.round(ms / 60_000));
}

function rotuloAssentos(reserva: Pick<Reserva, 'assentos'>): { texto: string; plural: boolean } {
  const nomes = reserva.assentos.map((a) => `${a.fila}${a.numero}`);
  const plural = nomes.length > 1;
  const lista = plural ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : (nomes[0] ?? '');
  return { texto: `${plural ? 'As cadeiras' : 'A cadeira'} ${lista}`, plural };
}

/** Aviso logo depois de reservar: "A cadeira D5 ficará reservada para você por 10 minutos." */
export function mensagemReservaFeita(reserva: Pick<Reserva, 'assentos' | 'criadoEm' | 'expiraEm'>): string {
  const { texto, plural } = rotuloAssentos(reserva);
  const minutos = minutosDaReserva(reserva);
  return `${texto} ${plural ? 'ficarão reservadas' : 'ficará reservada'} para você por ${minutos} minutos. Conclua o pagamento antes do tempo acabar.`;
}

/** Explicação fixa no checkout, embaixo do cronômetro. */
export function explicacaoReserva(reserva: Pick<Reserva, 'assentos' | 'criadoEm' | 'expiraEm'>): string {
  const { texto, plural } = rotuloAssentos(reserva);
  const minutos = minutosDaReserva(reserva);
  return `${texto} ${plural ? 'ficarão reservadas' : 'ficará reservada'} para você por ${minutos} minutos. Se o tempo acabar, ${plural ? 'elas voltam' : 'ela volta'} a ficar ${plural ? 'livres' : 'livre'} para outras pessoas.`;
}
