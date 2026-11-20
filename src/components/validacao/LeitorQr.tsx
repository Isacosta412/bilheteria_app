import { useRef, type ReactNode } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Botao } from '@/components/Botao';
import { cores, espacos, raios, tipografia } from '@/theme';

interface LeitorQrProps {
  aberto: boolean;
  /** Enquanto true (resultado na tela ou validando), as leituras são ignoradas. */
  pausado: boolean;
  aoLer: (codigo: string) => void;
  aoFechar: () => void;
  /** Conteúdo por cima da câmera (o resultado da validação). */
  children?: ReactNode;
}

const JANELA_REPETICAO_MS = 3000;

/** Leitura do QR code do ingresso com expo-camera, em tela cheia. Trata a permissão negada. */
export function LeitorQr({ aberto, pausado, aoLer, aoFechar, children }: LeitorQrProps) {
  const [permissao, pedirPermissao] = useCameraPermissions();
  // Evita validar o mesmo QR várias vezes seguidas enquanto ele continua na frente da câmera.
  const ultimaLeitura = useRef<{ codigo: string; quando: number } | null>(null);

  function ler(dado: string) {
    if (pausado) return;
    const agora = Date.now();
    const anterior = ultimaLeitura.current;
    if (anterior && anterior.codigo === dado && agora - anterior.quando < JANELA_REPETICAO_MS) return;
    ultimaLeitura.current = { codigo: dado, quando: agora };
    aoLer(dado);
  }

  let conteudo: ReactNode;
  if (!permissao) {
    conteudo = <Text style={estilos.mensagem}>Verificando acesso à câmera…</Text>;
  } else if (!permissao.granted) {
    conteudo = (
      <View style={estilos.aviso}>
        <Text style={estilos.avisoTitulo}>Sem acesso à câmera</Text>
        <Text style={estilos.mensagem}>
          {permissao.canAskAgain
            ? 'Permita o uso da câmera para ler o QR code, ou digite o código no campo.'
            : 'O acesso foi negado. Libere a câmera nas configurações do aparelho ou digite o código no campo.'}
        </Text>
        {permissao.canAskAgain && <Botao titulo="Permitir câmera" onPress={() => void pedirPermissao()} />}
      </View>
    );
  } else {
    conteudo = (
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={pausado ? undefined : ({ data }) => ler(data)}
        />
        <View style={estilos.mira} pointerEvents="none" accessibilityLabel="Aponte a câmera para o QR code do ingresso" />
      </View>
    );
  }

  return (
    <Modal visible={aberto} animationType="slide" onRequestClose={aoFechar}>
      <View style={estilos.raiz}>
        {conteudo}
        <View style={estilos.topo}>
          <Text style={estilos.titulo}>Ler QR code</Text>
          <Botao titulo="Fechar" variante="secundaria" onPress={aoFechar} accessibilityLabel="Fechar a câmera" />
        </View>
        {children}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.camera.fundo, alignItems: 'center', justifyContent: 'center' },
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: espacos.lg,
    paddingTop: espacos.xxl,
    backgroundColor: cores.camera.faixa,
  },
  titulo: { ...tipografia.subtitulo, color: cores.camera.texto },
  mira: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 240,
    height: 240,
    borderWidth: 4,
    borderColor: cores.primaria,
    borderRadius: raios.lg,
  },
  aviso: { padding: espacos.xl, gap: espacos.md, maxWidth: 420 },
  avisoTitulo: { ...tipografia.subtitulo, color: cores.camera.texto, textAlign: 'center' },
  mensagem: { ...tipografia.corpo, color: cores.camera.texto, textAlign: 'center' },
});
