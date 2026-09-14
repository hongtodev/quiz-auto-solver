# Auto Setup Script - Quiz Auto Solver
# Chạy trên Windows để setup dự án

param(
    [string]$Setup = "full"  # "full" hoặc "extension-only"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Quiz Auto Solver - Auto Setup Script (Windows)           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectPath = Get-Location
$startTime = Get-Date

# ============================================================
# STEP 0: Check Prerequisites
# ============================================================

Write-Host "📋 Kiểm tra Prerequisites..." -ForegroundColor Yellow

$prerequisites = @()

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $prerequisites += "Git - Download: https://git-scm.com/download/win"
} else {
    Write-Host "  ✅ Git" -ForegroundColor Green
}

# Node.js (nếu setup backend)
if ($Setup -eq "full") {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $prerequisites += "Node.js - Download: https://nodejs.org/"
    } else {
        Write-Host "  ✅ Node.js" -ForegroundColor Green
    }
}

# Chrome/Edge
$browser = $null
if (Get-Command chrome -ErrorAction SilentlyContinue) {
    $browser = "Chrome"
}
elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    $browser = "Chrome"
}
elseif (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    $browser = "Edge"
}

if ($browser) {
    Write-Host "  ✅ $browser" -ForegroundColor Green
} else {
    $prerequisites += "Chrome/Edge - Download: https://www.google.com/chrome/ hoặc https://www.microsoft.com/edge"
}

# Ollama
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "  ⚠️  Ollama chưa cài - Sẽ cài sau" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Ollama" -ForegroundColor Green
}

if ($prerequisites.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Cần cài các software sau:" -ForegroundColor Red
    foreach ($item in $prerequisites) {
        Write-Host "   • $item" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Cài xong rồi chạy lại script này." -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✅ Tất cả prerequisites OK!" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 1: Setup Git
# ============================================================

Write-Host "🔧 Setup Git..." -ForegroundColor Yellow

try {
    $repoUrl = (git config --get remote.origin.url)
    Write-Host "  ✅ Git repository đã tồn tại: $repoUrl" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Không phải git repository, initializing..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/hongtodev/quiz-auto-solver.git
    Write-Host "  ✅ Git initialized" -ForegroundColor Green
}

Write-Host ""

# ============================================================
# STEP 2: Install Ollama (nếu chưa cài)
# ============================================================

Write-Host "🤖 Kiểm tra Ollama..." -ForegroundColor Yellow

$ollamaInstalled = $false
try {
    $ollamaVersion = ollama --version 2>$null
    if ($ollamaVersion) {
        $ollamaInstalled = $true
        Write-Host "  ✅ Ollama đã cài: $ollamaVersion" -ForegroundColor Green
    }
}
catch {
    # Ollama không cài
}

if (-not $ollamaInstalled) {
    Write-Host "  ⚠️  Ollama chưa cài" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   📥 Cài Ollama:" -ForegroundColor Cyan
    Write-Host "      1. Download: https://ollama.ai" -ForegroundColor White
    Write-Host "      2. Run installer" -ForegroundColor White
    Write-Host "      3. Chạy: ollama pull mistral" -ForegroundColor White
    Write-Host "      4. Chạy: ollama serve" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Bạn đã cài Ollama? (y/n)"
    if ($response -eq "y" -or $response -eq "yes") {
        $ollamaInstalled = $true
        Write-Host "  ✅ Ollama ready" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================
# STEP 3: Install Backend Dependencies (nếu full)
# ============================================================

if ($Setup -eq "full") {
    Write-Host "📦 Install Backend Dependencies..." -ForegroundColor Yellow
    
    if (Test-Path "backend/package.json") {
        try {
            Push-Location backend
            npm install
            Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green
            Pop-Location
        }
        catch {
            Write-Host "  ❌ Error installing backend: $_" -ForegroundColor Red
            Pop-Location
        }
    }
    
    Write-Host ""
}

# ============================================================
# STEP 4: Configure Extension
# ============================================================

Write-Host "🎨 Configure Extension..." -ForegroundColor Yellow
Write-Host "  ℹ️  Để load extension:" -ForegroundColor Cyan
Write-Host "     1. Mở Chrome/Edge" -ForegroundColor White
Write-Host "     2. Vào: chrome://extensions/" -ForegroundColor White
Write-Host "     3. Bật 'Developer mode'" -ForegroundColor White
Write-Host "     4. Click 'Load unpacked'" -ForegroundColor White
Write-Host "     5. Chọn folder: $projectPath" -ForegroundColor White
Write-Host ""

# ============================================================
# STEP 5: Create .env if not exists
# ============================================================

if (-not (Test-Path ".env")) {
    Write-Host "📝 Tạo .env file..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✅ .env tạo từ .env.example" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================
# STEP 6: Summary
# ============================================================

$duration = (Get-Date) - $startTime

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Setup Hoàn Tất!                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Tiếp Theo:" -ForegroundColor Cyan
Write-Host ""

if (-not $ollamaInstalled) {
    Write-Host "1️⃣  Cài Ollama" -ForegroundColor Yellow
    Write-Host "    • Download: https://ollama.ai" -ForegroundColor Gray
    Write-Host "    • Chạy: ollama pull mistral" -ForegroundColor Gray
    Write-Host "    • Chạy: ollama serve" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "2️⃣  Load Extension" -ForegroundColor Yellow
Write-Host "    • chrome://extensions" -ForegroundColor Gray
Write-Host "    • Developer mode: ON" -ForegroundColor Gray
Write-Host "    • Load unpacked: $projectPath" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Configure" -ForegroundColor Yellow
Write-Host "    • Click extension icon" -ForegroundColor Gray
Write-Host "    • Tab 'Settings'" -ForegroundColor Gray
Write-Host "    • AI Provider: Ollama" -ForegroundColor Gray
Write-Host "    • Endpoint: http://localhost:11434/api/chat" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Test" -ForegroundColor Yellow
Write-Host "    • Vào website quiz" -ForegroundColor Gray
Write-Host "    • Click extension → Scan Câu Hỏi" -ForegroundColor Gray
Write-Host "    • Giải Toàn Bộ" -ForegroundColor Gray
Write-Host ""

if ($Setup -eq "full") {
    Write-Host "5️⃣  Backend Setup" -ForegroundColor Yellow
    Write-Host "    • cd backend" -ForegroundColor Gray
    Write-Host "    • node server.js" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "⏱️  Setup duration: $($duration.TotalSeconds)s" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • QUICK_START.md - 5 phút setup" -ForegroundColor Gray
Write-Host "   • SETUP.md - Chi tiết" -ForegroundColor Gray
Write-Host "   • OLLAMA_GUIDE.md - Ollama tutorial" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Enjoy Quiz Auto Solver!" -ForegroundColor Green
