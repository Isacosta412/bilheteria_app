import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { emCentavos, lerValor } from '@/lib/dinheiro';
import { formatarPreco } from '@/lib/formatacao';
import { AREA_TOQUE_MINIMA, cores, espacos, raios, tipografia } from '@/theme';
import type { MetodoPagamento } from '@/types';

const ROTULO_METODO: Record<MetodoPagamento, string> = { DINHEIRO: 'Dinheiro', CARTAO: 'Cartão', PIX: 'PIX' };

const schema = z.object({
  nomeComprador: z
    .string()
    .trim()
    .max(120, { message: 'Use no máximo 120 caracteres.' })
    .refine((v) => v.length === 0 || v.length >= 2, { message: 'Informe ao menos 2 letras ou deixe em branco.' }),
  valorRecebido: z.string().refine((v) => v.trim() === '' || lerValor(v) !== null, { message: 'Valor inválido. Ex.: 50 ou 50,00' }),
});
type FormPagamento = z.infer<typeof schema>;

export interface ConfirmacaoBalcao {
  metodo: MetodoPagamento;
  nomeComprador?: string;
  /** Só para mostrar o troco na tela final (dinheiro). */
  recebidoCentavos: number | null;
}

interface PagamentoBalcaoProps {
  quantidade: number;
  nomesAssentos: string;
  precoUnitario: string;
  carregando: boolean;
  aoConfirmar: (dados: ConfirmacaoBalcao) => void;
}

/**
 * Etapa 3 do balcão. O total exibido é quantidade × preço da sessão (o mesmo cálculo da API);
 * o valor oficial é o que a API registra. O troco é calculado SÓ na tela.
 */
export function PagamentoBalcao({ quantidade, nomesAssentos, precoUnitario, carregando, aoConfirmar }: PagamentoBalcaoProps) {
  const [metodo, setMetodo] = useState<MetodoPagamento>('DINHEIRO');
  const { control, handleSubmit, setValue } = useForm<FormPagamento>({
    resolver: zodResolver(schema),
    defaultValues: { nomeComprador: '', valorRecebido: '' },
  });
  const valorRecebido = useWatch({ control, name: 'valorRecebido' });

  const totalCentavos = emCentavos(precoUnitario) * quantidade;
  const recebido = metodo === 'DINHEIRO' ? lerValor(valorRecebido) : null;
  const recebidoCentavos = recebido === null ? null : emCentavos(recebido);
  const diferenca = recebidoCentavos === null ? null : recebidoCentavos - totalCentavos;
  const faltaDinheiro = diferenca !== null && diferenca < 0;

  const confirmar = handleSubmit(({ nomeComprador }) =>
    aoConfirmar({
      metodo,
      nomeComprador: nomeComprador.trim() || undefined,
      recebidoCentavos: metodo === 'DINHEIRO' ? recebidoCentavos : null,
    }),
  );

  return (
    <View style={estilos.raiz}>
      <View style={estilos.cartao}>
        <Text style={estilos.linhaResumo}>
          {quantidade} {quantidade === 1 ? 'assento' : 'assentos'} · {nomesAssentos}
        </Text>
        <Text style={estilos.detalhe}>
          {quantidade} × {formatarPreco(precoUnitario)}
        </Text>
        <View style={estilos.totalLinha}>
          <Text style={estilos.totalRotulo}>Total a cobrar</Text>
          <Text style={estilos.totalValor}>{formatarPreco(totalCentavos / 100)}</Text>
        </View>
        <Text style={estilos.nota}>O valor oficial é o registrado pela API na confirmação da venda.</Text>
      </View>

      <Text style={estilos.secao} accessibilityRole="header">
        Forma de pagamento
      </Text>
      <View style={estilos.metodos} accessibilityRole="radiogroup">
        {(['DINHEIRO', 'CARTAO', 'PIX'] as const).map((m) => {
          const ativo = metodo === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMetodo(m)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
              aria-checked={ativo}
              style={[estilos.metodo, ativo && estilos.metodoAtivo]}
            >
              <Text style={[estilos.metodoTexto, ativo && estilos.metodoTextoAtivo]}>{ROTULO_METODO[m]}</Text>
            </Pressable>
          );
        })}
      </View>

      {metodo === 'DINHEIRO' && (
        <View style={estilos.cartao}>
          <Campo
            control={control}
            name="valorRecebido"
            rotulo="Valor recebido (opcional)"
            placeholder="Ex.: 100,00"
            keyboardType="decimal-pad"
            dica="Usado só para calcular o troco nesta tela."
          />
          <View style={estilos.atalhos}>
            {[
              { rotulo: 'R$ 50', valor: '50,00' },
              { rotulo: 'R$ 100', valor: '100,00' },
              { rotulo: 'Exato', valor: (totalCentavos / 100).toFixed(2).replace('.', ',') },
            ].map((a) => (
              <Pressable
                key={a.rotulo}
                onPress={() => setValue('valorRecebido', a.valor, { shouldValidate: true })}
                accessibilityRole="button"
                accessibilityLabel={`Valor recebido ${a.rotulo === 'Exato' ? 'igual ao total' : a.rotulo}`}
                style={estilos.atalho}
              >
                <Text style={estilos.atalhoTexto}>{a.rotulo}</Text>
              </Pressable>
            ))}
          </View>
          {diferenca !== null && (
            <Text
              style={[estilos.troco, faltaDinheiro && estilos.falta]}
              accessibilityLiveRegion="polite"
              aria-live="polite"
            >
              {faltaDinheiro ? `Faltam ${formatarPreco(-diferenca / 100)}` : `Troco: ${formatarPreco(diferenca / 100)}`}
            </Text>
          )}
        </View>
      )}

      <Campo control={control} name="nomeComprador" rotulo="Nome do comprador (opcional)" placeholder="Ex.: Ana Souza" autoComplete="off" />

      <Botao
        titulo="Confirmar venda"
        onPress={() => void confirmar()}
        carregando={carregando}
        desabilitado={faltaDinheiro}
        accessibilityLabel={`Confirmar venda de ${quantidade} ${quantidade === 1 ? 'ingresso' : 'ingressos'} por ${formatarPreco(totalCentavos / 100)} em ${ROTULO_METODO[metodo]}`}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { gap: espacos.lg },
  cartao: { backgroundColor: cores.superficie, borderRadius: raios.lg, borderWidth: 1, borderColor: cores.borda, padding: espacos.lg, gap: espacos.xs },
  linhaResumo: { ...tipografia.corpoForte, color: cores.texto },
  detalhe: { ...tipografia.corpo, color: cores.textoSecundario },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: espacos.sm },
  totalRotulo: { ...tipografia.corpoForte, color: cores.texto },
  totalValor: { ...tipografia.titulo, color: cores.primaria },
  nota: { ...tipografia.legenda, color: cores.textoSecundario },
  secao: { ...tipografia.corpoForte, color: cores.texto },
  metodos: { flexDirection: 'row', gap: espacos.sm },
  metodo: {
    flex: 1,
    minHeight: AREA_TOQUE_MINIMA + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
  },
  metodoAtivo: { borderColor: cores.primaria, backgroundColor: cores.superficieElevada },
  metodoTexto: { ...tipografia.corpoForte, color: cores.textoSecundario },
  metodoTextoAtivo: { color: cores.texto },
  atalhos: { flexDirection: 'row', gap: espacos.sm, flexWrap: 'wrap' },
  atalho: {
    minHeight: AREA_TOQUE_MINIMA - 4,
    justifyContent: 'center',
    paddingHorizontal: espacos.lg,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaInterativa,
  },
  atalhoTexto: { ...tipografia.corpoForte, color: cores.texto },
  troco: { ...tipografia.subtitulo, color: cores.sucesso, marginTop: espacos.md },
  falta: { color: cores.erro },
});
