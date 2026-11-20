import { useId, useState } from 'react';
import { Text, View } from 'react-native';
import { format } from 'date-fns';
import { cores, espacos, raios } from '@/theme';
import { estilosCampoDataHora as estilos, type CampoDataHoraProps } from './CampoDataHora.comum';

const FORMATO = "yyyy-MM-dd'T'HH:mm";

/** Web: seletor nativo do navegador (<input type="datetime-local">), no horário local. */
export function CampoDataHora({ rotulo, valor, aoMudar, erro }: CampoDataHoraProps) {
  const id = useId();
  const [texto, setTexto] = useState(() => (valor ? format(valor, FORMATO) : ''));
  // Mínimo = agora (calculado uma vez, fora do render, para não "pular" a cada tecla).
  const [minimo] = useState(() => format(new Date(), FORMATO));

  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo} nativeID={`${id}-rotulo`}>
        {rotulo}
      </Text>
      <input
        id={id}
        type="datetime-local"
        value={texto}
        min={minimo}
        aria-labelledby={`${id}-rotulo`}
        aria-label={rotulo}
        aria-invalid={erro !== undefined}
        onChange={(e) => {
          const novo = e.target.value;
          setTexto(novo);
          // "2026-11-24T19:30" sem fuso = horário local (especificação do Date).
          const data = novo ? new Date(novo) : null;
          aoMudar(data && !Number.isNaN(data.getTime()) ? data : null);
        }}
        style={{
          minHeight: 48,
          boxSizing: 'border-box',
          width: '100%',
          border: `1.5px solid ${erro !== undefined ? cores.erro : cores.bordaInterativa}`,
          borderRadius: raios.md,
          backgroundColor: cores.superficie,
          color: cores.texto,
          colorScheme: 'dark',
          padding: `0 ${espacos.md}px`,
          fontSize: 16,
          fontFamily: 'inherit',
        }}
      />
      {erro !== undefined && (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erro}
        </Text>
      )}
    </View>
  );
}
