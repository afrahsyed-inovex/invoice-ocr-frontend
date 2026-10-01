# Starts both backends on Windows, each in its own PowerShell window.
#   Munhim -> http://localhost:8000   (upload adapter running his pipeline: POST /extract)
#   Usman  -> http://localhost:8001   (his API: POST /v1/extract)
# First-time setup (once per backend folder):
#   py -3.12 -m venv .venv ; .venv\Scripts\python -m pip install -r requirements.txt
#   Munhim only, for uploads:  .venv\Scripts\python -m pip install python-multipart
#   winget install --id UB-Mannheim.TesseractOCR -e
# Usage, from the project root:  powershell -ExecutionPolicy Bypass -File scripts\start-backends.ps1

$root = Split-Path -Parent $PSScriptRoot
$munhimDir = Join-Path $root 'munhims-backend\poc-munhim'
$usmanDir = Join-Path $root 'usmans-backend\invoice--usman'
$adapterDir = Join-Path $PSScriptRoot 'munhim-upload-api'
$shimDir = Join-Path $PSScriptRoot 'windows-shims'
$tesseractDir = 'C:\Program Files\Tesseract-OCR'
$corsOrigins = 'http://localhost:5173,http://localhost:8080'

# Runs from his folder so his invoice_pipeline package is importable; his code is not modified.
$munhim = @"
Set-Location '$munhimDir'
`$env:CORS_ORIGINS = '$corsOrigins'
.venv\Scripts\python -m uvicorn app:app --app-dir '$adapterDir' --host 127.0.0.1 --port 8000
"@

# His code expects Linux: tesseract on PATH and the fcntl module (provided by windows-shims).
$usman = @"
Set-Location '$usmanDir'
`$env:PATH = '$tesseractDir;' + `$env:PATH
`$env:PYTHONPATH = '$shimDir'
`$env:ENV = 'development'
`$env:API_KEYS = 'dev-key'
`$env:CORS_ORIGINS = '$corsOrigins'
`$env:LOG_FORMAT = 'text'
`$env:LLM_STATE_DIR = Join-Path `$env:TEMP 'invoice-llm'
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
"@

Start-Process powershell -ArgumentList '-NoExit', '-Command', $munhim
Start-Process powershell -ArgumentList '-NoExit', '-Command', $usman
Write-Host 'Started Munhim (http://localhost:8000) and Usman (http://localhost:8001) in new windows.'
