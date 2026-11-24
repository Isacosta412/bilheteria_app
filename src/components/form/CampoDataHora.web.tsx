import { useId, useState } from 'react';
import { Text, View } from 'react-native';
import { format } from 'date-fns';
import { cores, espacos, raios } from '@/theme';
import { estilosCampoDataHora as estilos, type CampoDataHoraProps } from './CampoDataHora.comum';

const FORMATO = "yyyy-MM-dd'T'HH:mm";
/**
 * Sem `max`, o Chrome deixa o ano ter até 6 dígitos: quem digita "30112026" e segue para "1430"
 * acaba com o ano 202614 e a data fica inválida. Com um máximo de 4 dígitos, depois do ano o
 * cursor pula sozinho para a hora.
 */
const MAXIMO = '2099-12-31T23:59';

/** Web: seletor nativo do navegador (<input type="datetime-local">), no horário local. */
export function CampoDataHora({ rotulo, valor, aoMudar, erro }: CampoDataHoraProps) {
  const id = useId();
  const [texto, setTexto] = useState(() => (valor ? format(valor, FORMATO) : ''));
  // Mínimo = agora (calculado uma vez, fora do render, para não "pular" a cada tecla).
  const [minimo] = useState(() => format(new Date(), FORMATO));
  const [invalida, setInvalida] = useState(false);
  const mensagem = invalida ? 'Data inválida. Confira o dia, o mês e o ano (4 dígitos) e a hora.' : erro;

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
        max={MAXIMO}
        aria-labelledby={`${id}-rotulo`}
        aria-label={rotulo}
        aria-invalid={mensagem !== undefined}
        onChange={(e) => {
          const novo = e.target.value;
          setTexto(novo);
          // "2026-11-24T19:30" sem fuso = horário local (especificação do Date).
          const data = novo ? new Date(novo) : null;
          const valida = data !== null && !Number.isNaN(data.getTime()) && data.getFullYear() <= 2099;
          // O navegador devolve "" enquanto a data está incompleta ou impossível.
          setInvalida(novo !== '' && !valida);
          aoMudar(valida ? data : null);
        }}
        onBlur={(e) => setInvalida(e.currentTarget.validity.badInput)}
        style={{
          minHeight: 48,
          boxSizing: 'border-box',
          width: '100%',
          border: `1.5px solid ${mensagem !== undefined ? cores.erro : cores.bordaInterativa}`,
          borderRadius: raios.md,
          backgroundColor: cores.superficie,
          color: cores.texto,
          colorScheme: 'dark',
          padding: `0 ${espacos.md}px`,
          fontSize: 16,
          fontFamily: 'inherit',
        }}
      />
      {mensagem !== undefined && (
        <Text style={estilos.erro} accessibilityRole="alert">
          {mensagem}
        </Text>
      )}
    </View>
  );
}
