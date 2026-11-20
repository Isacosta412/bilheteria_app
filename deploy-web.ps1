# Publica o app web do Pipocou na VM (Nginx entrega /srv/app na raiz do subdomínio; /api vai para a API).
# Uso (PowerShell, na pasta frontend):  .\deploy-web.ps1
# Para apagar os arquivos antigos do servidor antes de enviar:  .\deploy-web.ps1 -Limpar
param(
  [switch]$Limpar
)

# ─── Ajuste aqui ─────────────────────────────────────────────────────────────
$Ip      = 'IP-DA-VM'                      # ex.: 54.123.45.67
$Dominio = 'pipocou.SEU-DOMINIO.com.br'    # subdomínio do app (sem https://)
$Chave   = 'C:\Users\isado\.ssh\bilheteria.pem'
$Usuario = 'ubuntu'
$Destino = '/srv/app'
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Confirmar-Comando([string]$Descricao) {
  if ($LASTEXITCODE -ne 0) { throw "Falhou: $Descricao (código $LASTEXITCODE)." }
}

if ($Ip -eq 'IP-DA-VM' -or $Dominio -like '*SEU-DOMINIO*') {
  throw 'Preencha $Ip e $Dominio no topo do deploy-web.ps1 antes de publicar.'
}
if (-not (Test-Path $Chave)) { throw "Chave SSH não encontrada: $Chave" }

# A URL da API vai embutida no build. A variável de ambiente tem prioridade sobre o .env.production.
$env:EXPO_PUBLIC_API_URL = "https://$Dominio/api"
Write-Host "1/3  Gerando o build web (API: $env:EXPO_PUBLIC_API_URL)..."
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
npx expo export --platform web
Confirmar-Comando 'expo export'
if (-not (Test-Path 'dist\index.html')) { throw 'O build não gerou dist\index.html.' }

$Servidor = "$Usuario@$Ip"
if ($Limpar) {
  Write-Host "2/3  Limpando $Destino no servidor..."
  ssh -i $Chave $Servidor "find $Destino -mindepth 1 -delete"
  Confirmar-Comando 'limpeza do destino'
} else {
  Write-Host '2/3  Mantendo os arquivos antigos do servidor (use -Limpar para apagar).'
}

# O PowerShell não expande "dist/*" para o scp: os itens são listados aqui.
Write-Host "3/3  Enviando dist/ para ${Servidor}:$Destino ..."
$Itens = Get-ChildItem -Path dist -Force | ForEach-Object { $_.FullName }
scp -i $Chave -r @Itens "${Servidor}:$Destino/"
Confirmar-Comando 'scp'

Write-Host ''
Write-Host "Pronto! Abra https://$Dominio (rotas como /gerencia/filmes dependem do try_files do Nginx)."
