#!/bin/bash

# Auto Ollama Setup - Mac/Linux Shell Script
# Tự động cài mistral model và chạy ollama serve

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   Ollama Auto Setup - Mac/Linux${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

# Kiểm tra Ollama đã cài
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}❌ Ollama chưa cài!${NC}"
    echo ""
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${YELLOW}Cài trên Mac:${NC}"
        echo -e "${YELLOW}  brew install ollama${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${YELLOW}Cài trên Linux:${NC}"
        echo -e "${YELLOW}  curl -fsSL https://ollama.ai/install.sh | sh${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Hoặc download từ: https://ollama.ai${NC}"
    echo ""
    echo -e "${YELLOW}Sau khi cài xong, chạy lại script này.${NC}"
    echo ""
    exit 1
fi

VERSION=$(ollama --version)
echo -e "${GREEN}✅ Ollama đã cài: $VERSION${NC}"
echo ""

# Kiểm tra model
if ollama list | grep -q "mistral"; then
    echo -e "${GREEN}✅ Mistral model đã có${NC}"
else
    echo -e "${CYAN}📥 Downloading Ollama model: mistral (4GB)...${NC}"
    echo -e "${CYAN}   (Lần đầu sẽ mất 5-10 phút tùy internet)${NC}"
    echo ""
    
    ollama pull mistral
    
    echo ""
    echo -e "${GREEN}✅ Mistral downloaded!${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   🚀 Chạy Ollama Server...${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📌 Ollama sẽ chạy trên: http://localhost:11434${NC}"
echo -e "${YELLOW}📌 Để dừng: Nhấn Ctrl+C${NC}"
echo ""
echo -e "${GREEN}✅ Browser Extension sẽ tự động kết nối${NC}"
echo ""

ollama serve
