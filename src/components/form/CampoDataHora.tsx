import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { format } from 'date-fns';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import { estilosCampoDataHora, type CampoDataHoraProps } from './CampoDataHora.comum';

function mascararData(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function mascararHora(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** "24/11/2026" + "19:30" → Date local; null se incompleto ou inexistente (31/02, 25:00). */
function montar(data: string, hora: string): Date | null {
  const md = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  const mh = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!md || !mh) return null;
  const [dia, mes, ano, h, min] = [md[1], md[2], md[3], mh[1], mh[2]].map(Number) as [number, number, number, number, number];
  const resultado = new Date(ano, mes - 1, dia, h, min);
  const confere =
    resultado.getFullYear() === ano && resultado.getMonth() === mes - 1 && resultado.getDate() === dia &&
    resultado.getHours() === h && resultado.getMinutes() === min;
  return confere ? resultado : null;
}

/**
 * Celular (Expo Go): data e hora digitadas com máscara, sem dependência de date picker.
 * Na web, CampoDataHora.web.tsx usa o <input type="datetime-local"> do navegador.
 */
export function CampoDataHora({ rotulo, valor, aoMudar, erro }: CampoDataHoraProps) {
  const [data, setData] = useState(() => (valor ? format(valor, 'dd/MM/yyyy') : ''));
  const [hora, setHora] = useState(() => (valor ? format(valor, 'HH:mm') : ''));

  function mudar(novaData: string, novaHora: string) {
    setData(novaData);
    setHora(novaHora);
    aoMudar(montar(novaData, novaHora));
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={estilos.linha}>
        <TextInput
          value={data}
          onChangeText={(t) => mudar(mascararData(t), hora)}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={cores.textoSecundario}
          keyboardType="number-pad"
          accessibilityLabel={`${rotulo}: data`}
          style={[estilos.input, estilos.data, erro !== undefined && estilos.inputErro]}
        />
        <TextInput
          value={hora}
          onChangeText={(t) => mudar(data, mascararHora(t))}
          placeholder="HH:MM"
          placeholderTextColor={cores.textoSecundario}
          keyboardType="number-pad"
          accessibilityLabel={`${rotulo}: hora`}
          style={[estilos.input, estilos.hora, erro !== undefined && estilos.inputErro]}
        />
      </View>
      {erro !== undefined && (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erro}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  ...estilosCampoDataHora,
  linha: { flexDirection: 'row', gap: espacos.sm },
  input: {
    minHeight: AREA_TOQUE_MINIMA + 4,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
    color: cores.texto,
    paddingHorizontal: espacos.md,
    ...tipografia.corpo,
  },
  inputErro: { borderColor: cores.erro },
  data: { flex: 3 },
  hora: { flex: 2 },
});
