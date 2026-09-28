$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$pythonPath = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
if (!(Test-Path $pythonPath)) { throw 'Python environment is missing. Install requirements.txt first.' }
if (!(Test-Path 'frontend\node_modules\vite\bin\vite.js')) { throw 'Run npm install inside frontend first.' }
$env:PATH = (Join-Path $PSScriptRoot '.venv\Scripts') + ';' + $env:PATH
$ffmpegPath = & $pythonPath -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'
if ($LASTEXITCODE -eq 0 -and !(Test-Path '.venv\Scripts\ffmpeg.exe')) {
    Copy-Item -LiteralPath $ffmpegPath -Destination '.venv\Scripts\ffmpeg.exe'
}
if (!(Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $pythonPath -ArgumentList '-m uvicorn matchvision.api.app:app --host 127.0.0.1 --port 8000 --workers 1' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput 'backend.log' -RedirectStandardError 'backend-error.log'
}
if (!(Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $nodePath -ArgumentList 'node_modules/vite/bin/vite.js --host 127.0.0.1' -WorkingDirectory (Join-Path $PSScriptRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $PSScriptRoot 'frontend.log') -RedirectStandardError (Join-Path $PSScriptRoot 'frontend-error.log')
}
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:8000/api/health' -TimeoutSec 2
        $page = Invoke-WebRequest 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2
        if ($health.service -eq 'MatchVision API' -and $page.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Seconds 1 }
}
if (!$ready) { throw 'Startup failed. Check backend-error.log and frontend-error.log in the project folder.' }
Write-Host 'MatchVision is ready: http://127.0.0.1:5173'
Write-Host 'API docs: http://127.0.0.1:8000/docs'
