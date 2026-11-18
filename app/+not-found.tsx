import { Redirect } from 'expo-router';

/** URL desconhecida: volta para o início (que, por sua vez, respeita o papel do usuário). */
export default function NaoEncontrada() {
  return <Redirect href="/" />;
}
