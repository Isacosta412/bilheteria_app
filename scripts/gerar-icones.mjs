/**
 * Gera os ícones do app (PNG) a partir do desenho do balde de pipoca, sem dependência nova:
 * monta cada variação em SVG e tira um "print" com o Chrome (ou Edge) em modo headless.
 *   node scripts/gerar-icones.mjs
 * O desenho é o mesmo de src/components/LogoPipocou.tsx e de assets/icon-pipocou.svg.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const COR = { fundo: '#14110F', creme: '#FFF8E7', amarelo: '#FFC93C', vermelho: '#E63946', branco: '#FFFFFF' };
const PIPOCAS = [
  [15, 22, 5], [49, 22, 5], [22, 17, 6], [42, 16, 6], [32, 12, 6.5],
  [27, 22, 6], [37, 21, 6], [19, 25, 4.5], [45, 25, 4.5], [32, 25, 5],
];
const BALDE = '13,29 51,29 45,59 19,59';
const LISTRAS = ['13,29 20.6,29 24.2,59 19,59', '28.2,29 35.8,29 34.6,59 29.4,59', '43.4,29 51,29 45,59 39.8,59'];
const LISTRAS_CREME = ['20.6,29 28.2,29 29.4,59 24.2,59', '35.8,29 43.4,29 39.8,59 34.6,59'];
const BORDA = '11,26 53,26 52.2,31 11.8,31';

function desenho(mono = false) {
  if (mono) {
    const b = COR.branco;
    return [
      ...PIPOCAS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/>`),
      ...LISTRAS_CREME.map((p) => `<polygon points="${p}" fill="${b}"/>`),
      `<polygon points="${BORDA}" fill="${b}"/>`,
    ].join('');
  }
  return [
    ...PIPOCAS.map(
      ([x, y, r]) =>
        `<circle cx="${x + 1.2}" cy="${y + 1.2}" r="${r}" fill="${COR.amarelo}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${COR.creme}"/>`,
    ),
    `<polygon points="${BALDE}" fill="${COR.creme}"/>`,
    ...LISTRAS.map((p) => `<polygon points="${p}" fill="${COR.vermelho}"/>`),
    `<polygon points="${BORDA}" fill="${COR.amarelo}"/>`,
  ].join('');
}

/** SVG quadrado: fundo opcional + o desenho com a escala pedida (1 = ocupa tudo). */
function svg({ lado, fundo, raio = 0, escala, mono = false }) {
  const s = (lado / 64) * escala;
  const d = (lado - 64 * s) / 2;
  const bg = fundo ? `<rect width="${lado}" height="${lado}" rx="${raio}" fill="${fundo}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${bg}<g transform="translate(${d} ${d}) scale(${s})">${desenho(mono)}</g></svg>`;
}

const VARIACOES = [
  { arquivo: 'icon.png', lado: 1024, fundo: COR.fundo, escala: 0.78 },
  { arquivo: 'favicon.png', lado: 48, fundo: COR.fundo, raio: 10, escala: 0.92 },
  { arquivo: 'splash-icon.png', lado: 288, escala: 1 },
  { arquivo: 'android-icon-foreground.png', lado: 512, escala: 0.6 },
  { arquivo: 'android-icon-background.png', lado: 512, fundo: COR.fundo, escala: 0 },
  { arquivo: 'android-icon-monochrome.png', lado: 432, escala: 0.6, mono: true },
];

const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const navegador = NAVEGADORES.find((c) => existsSync(c));
if (!navegador) throw new Error('Chrome ou Edge não encontrado.');

const raiz = resolve(import.meta.dirname, '..');
writeFileSync(join(raiz, 'assets/icon-pipocou.svg'), svg({ lado: 64, escala: 1 }) + '\n');

const temp = mkdtempSync(join(tmpdir(), 'icones-'));
try {
  for (const v of VARIACOES) {
    const html = join(temp, `${v.arquivo}.html`);
    writeFileSync(
      html,
      `<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">${svg(v)}</body></html>`,
    );
    const saida = join(raiz, 'assets/images', v.arquivo);
    execFileSync(navegador, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      `--window-size=${v.lado},${v.lado}`,
      `--screenshot=${saida}`,
      pathToFileURL(html).href,
    ], { stdio: 'ignore' });
    console.log('gerado', v.arquivo);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
