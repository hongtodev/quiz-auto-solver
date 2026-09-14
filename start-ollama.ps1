# Auto Ollama Setup - Windows PowerShell Script
# Tự động cài mistral model và chạy ollama serve

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Ollama Auto Setup - Windows (PowerShell)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Ollama đã cài
try {
    $version = ollama --version 2>$null
    Write-Host "✅ Ollama đã cài: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama chưa cài!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui lòng download & cài từ: https://ollama.ai" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Sau khi cài xong, chạy lại script này." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# Kiểm tra model
$modelExists = (ollama list 2>$null | Select-String -Pattern "mistral" -Quiet)

if (-not $modelExists) {
    Write-Host "📥 Downloading Ollama model: mistral (4GB)..." -ForegroundColor Cyan
    Write-Host "   (Lần đầu sẽ mất 5-10 phút tùy internet)" -ForegroundColor Gray
    Write-Host ""
    
    ollama pull mistral
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Download mistral failed!" -ForegroundColor Red
        pause
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Mistral downloaded!" -ForegroundColor Green
} else {
    Write-Host "✅ Mistral model đã có" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 Chạy Ollama Server..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Ollama sẽ chạy trên: http://localhost:11434" -ForegroundColor Yellow
Write-Host "📌 Để dừng: Nhấn Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Browser Extension sẽ tự động kết nối" -ForegroundColor Green
Write-Host ""

ollama serve
