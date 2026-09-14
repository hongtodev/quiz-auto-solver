#!/bin/bash

# Auto Setup Script - Quiz Auto Solver
# Chạy trên Mac/Linux để setup dự án

set -e

PROJECT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_TIME=$(date +%s)
SETUP_TYPE="${1:-full}"  # "full" hoặc "extension-only"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# ============================================================
# Helper Functions
# ============================================================

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Quiz Auto Solver - Auto Setup Script (Mac/Linux)         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}$1${NC}"
}

print_ok() {
    echo -e "${GREEN}  ✅ $1${NC}"
}

print_error() {
    echo -e "${RED}  ❌ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}  ℹ️  $1${NC}"
}

# ============================================================
# STEP 0: Check Prerequisites
# ============================================================

print_header
print_step "📋 Kiểm tra Prerequisites..."

MISSING_TOOLS=()

# Git
if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
else
    print_ok "Git"
fi

# Node.js (nếu full)
if [ "$SETUP_TYPE" = "full" ]; then
    if ! command -v node &> /dev/null; then
        MISSING_TOOLS+=("node")
    else
        print_ok "Node.js"
    fi
fi

# Chrome/Firefox
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null || \
   [ -d "/Applications/Google Chrome.app" ] || [ -d "/Applications/Chromium.app" ]; then
    print_ok "Browser (Chrome/Chromium/Brave)"
else
    MISSING_TOOLS+=("chrome/chromium/brave")
fi

# Ollama
if command -v ollama &> /dev/null; then
    print_ok "Ollama"
else
    print_warn "Ollama chưa cài - Sẽ cài sau"
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo ""
    print_error "Cần cài các tool sau:"
    for tool in "${MISSING_TOOLS[@]}"; do
        echo "   • $tool"
    done
    echo ""
    echo -e "${YELLOW}Cài xong rồi chạy lại script này.${NC}"
    echo ""
    exit 1
fi

print_ok "Tất cả prerequisites OK!"
echo ""

# ============================================================
# STEP 1: Setup Git
# ============================================================

print_step "🔧 Setup Git..."

if git remote get-url origin &> /dev/null; then
    REPO_URL=$(git remote get-url origin)
    print_ok "Git repository đã tồn tại: $REPO_URL"
else
    print_warn "Initializing git repository..."
    git init
    git remote add origin https://github.com/hongtodev/quiz-auto-solver.git
    print_ok "Git initialized"
fi

echo ""

# ============================================================
# STEP 2: Install Ollama (nếu chưa cài)
# ============================================================

print_step "🤖 Kiểm tra Ollama..."

OLLAMA_INSTALLED=false
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>/dev/null || echo "unknown")
    print_ok "Ollama đã cài: $OLLAMA_VERSION"
    OLLAMA_INSTALLED=true
else
    print_warn "Ollama chưa cài"
    echo ""
    echo -e "${CYAN}   📥 Cài Ollama:${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${GRAY}      • Mac: brew install ollama${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${GRAY}      • Linux: curl -fsSL https://ollama.ai/install.sh | sh${NC}"
    fi
    echo -e "${GRAY}      • Hoặc: Download từ https://ollama.ai${NC}"
    echo -e "${GRAY}      • Chạy: ollama pull mistral${NC}"
    echo -e "${GRAY}      • Chạy: ollama serve${NC}"
    echo ""
    
    read -p "Bạn đã cài Ollama? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        OLLAMA_INSTALLED=true
        print_ok "Ollama ready"
    fi
fi

echo ""

# ============================================================
# STEP 3: Install Backend Dependencies (nếu full)
# ============================================================

if [ "$SETUP_TYPE" = "full" ]; then
    print_step "📦 Install Backend Dependencies..."
    
    if [ -f "backend/package.json" ]; then
        (
            cd backend
            npm install
            print_ok "Backend dependencies installed"
        )
    fi
    
    echo ""
fi

# ============================================================
# STEP 4: Configure Extension
# ============================================================

print_step "🎨 Configure Extension..."

print_info "Để load extension:"
echo -e "${GRAY}   1. Mở Chrome/Chromium/Brave${NC}"
echo -e "${GRAY}   2. Vào: chrome://extensions/${NC}"
echo -e "${GRAY}   3. Bật 'Developer mode'${NC}"
echo -e "${GRAY}   4. Click 'Load unpacked'${NC}"
echo -e "${GRAY}   5. Chọn folder: $PROJECT_PATH${NC}"
echo ""

# ============================================================
# STEP 5: Create .env if not exists
# ============================================================

if [ ! -f ".env" ]; then
    print_step "📝 Tạo .env file..."
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        print_ok ".env tạo từ .env.example"
    fi
fi

echo ""

# ============================================================
# STEP 6: Summary
# ============================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Hoàn Tất!                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📋 Tiếp Theo:${NC}"
echo ""

if [ "$OLLAMA_INSTALLED" = false ]; then
    echo -e "${YELLOW}1️⃣  Cài Ollama${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${GRAY}    • brew install ollama${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${GRAY}    • curl -fsSL https://ollama.ai/install.sh | sh${NC}"
    else
        echo -e "${GRAY}    • Download: https://ollama.ai${NC}"
    fi
    echo -e "${GRAY}    • ollama pull mistral${NC}"
    echo -e "${GRAY}    • ollama serve${NC}"
    echo ""
fi

echo -e "${YELLOW}2️⃣  Load Extension${NC}"
echo -e "${GRAY}    • chrome://extensions${NC}"
echo -e "${GRAY}    • Developer mode: ON${NC}"
echo -e "${GRAY}    • Load unpacked: $PROJECT_PATH${NC}"
echo ""

echo -e "${YELLOW}3️⃣  Configure${NC}"
echo -e "${GRAY}    • Click extension icon${NC}"
echo -e "${GRAY}    • Tab 'Settings'${NC}"
echo -e "${GRAY}    • AI Provider: Ollama${NC}"
echo -e "${GRAY}    • Endpoint: http://localhost:11434/api/chat${NC}"
echo ""

echo -e "${YELLOW}4️⃣  Test${NC}"
echo -e "${GRAY}    • Vào website quiz${NC}"
echo -e "${GRAY}    • Click extension → Scan Câu Hỏi${NC}"
echo -e "${GRAY}    • Giải Toàn Bộ${NC}"
echo ""

if [ "$SETUP_TYPE" = "full" ]; then
    echo -e "${YELLOW}5️⃣  Backend Setup${NC}"
    echo -e "${GRAY}    • cd backend${NC}"
    echo -e "${GRAY}    • node server.js${NC}"
    echo ""
fi

echo -e "${GRAY}⏱️  Setup duration: ${DURATION}s${NC}"
echo ""

echo -e "${CYAN}📚 Documentation:${NC}"
echo -e "${GRAY}   • QUICK_START.md - 5 phút setup${NC}"
echo -e "${GRAY}   • SETUP.md - Chi tiết${NC}"
echo -e "${GRAY}   • OLLAMA_GUIDE.md - Ollama tutorial${NC}"
echo ""

echo -e "${GREEN}🎉 Enjoy Quiz Auto Solver!${NC}"
