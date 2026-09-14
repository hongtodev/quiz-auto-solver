# 🎓 Quiz Auto Solver - Browser Extension

**Ứng dụng tự động giải quiz trắc nghiệm bằng AI local (Ollama) và Answer Vault**

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0-blue)

## ⭐ Tính Năng Chính

### 1. 🔍 **Scan Câu Hỏi Tự Động**
- Phát hiện câu hỏi trên bất kỳ website nào
- Hỗ trợ multiple-choice, checkbox, radio buttons
- Tự động tách các lựa chọn (A, B, C, D, etc)
- Scan hình ảnh trong câu hỏi thành text (OCR)

### 2. 🚀 **AI Local (Ollama)** ⭐ Khuyến Nghị
- **FREE** - Không tính phí, không cần API key
- **Offline** - Toàn bộ chạy trên máy local
- **Riêng tư** - Dữ liệu không lên cloud
- **Nhanh** - Phản hồi trong vài giây
- Models: mistral, llama2, neural-chat, etc
- Fallback: Tự động quy sang OpenAI nếu Ollama không có

### 3. ☁️ **OpenAI ChatGPT** (Fallback)
- Chính xác cao nhất (⭐⭐⭐⭐⭐)
- Cần API key ($0.002/question)
- Cần internet
- Tự động fallback nếu Ollama không khả dụng

### 4. 💾 **Answer Vault**
- Lưu trữ tất cả đáp án đã học
- Tìm kiếm nhanh bằng similarity matching
- Cập nhật từ SQL Server (optional)
- Không cần gọi AI lần sau

### 5. ⚡ **Auto-Solver**
- Tự động click đáp án đúng
- Hỗ trợ giải toàn bộ quiz
- Tô sáng đáp án đúng
- Tính điểm tự động

### 6. 📊 **SQL Server Integration** (Optional)
- Lưu đáp án trên server
- Đồng bộ nhiều thiết bị
- Backup dữ liệu
- Quản lý tập trung
- Hỗ trợ Windows Authentication (an toàn)

### 7. 🔄 **Auto-Git Sync**
- Tự động commit & push lên GitHub
- Monitor thay đổi file
- Timestamp commits
- Perfect cho team collaboration

## 🚀 Quick Start (5 phút)

### Windows

```powershell
# 1. Clone project
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver

# 2. Cài Ollama
# Download từ: https://ollama.ai
# Sau cài xong, chạy:
ollama pull mistral
ollama serve

# 3. Load Extension
# Chrome: chrome://extensions
# Developer mode: ON
# Load unpacked: Chọn folder quiz-auto-solver

# 4. Cấu Hình
# Click icon extension → Settings
# AI Provider: Ollama (default)
# Ollama Endpoint: http://localhost:11434/api/chat

# 5. Test
# Vào website quiz → Scan → Solve! 🎉
```

### Mac/Linux

```bash
# 1. Clone
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver

# 2. Cài Ollama
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

ollama pull mistral
ollama serve

# 3-5: Giống Windows
```

👉 **Xem chi tiết**: [QUICK_START.md](QUICK_START.md)

## 📋 Cấu Trúc Project

```
quiz-auto-solver/
├── 📖 Docs
│   ├── README.md                 (File này)
│   ├── QUICK_START.md            (Setup 5 phút)
│   ├── SETUP.md                  (Setup chi tiết)
│   ├── OLLAMA_GUIDE.md           (Hướng dẫn Ollama)
│   ├── WINDOWS_AUTH.md           (Windows Auth setup)
│   ├── AUTO_SYNC_GUIDE.md        (Auto Git Sync)
│   └── API_DOCS.md               (API Reference)
│
├── 📦 Extension (Chrome/Edge/Brave)
│   ├── manifest.json             (Config)
│   ├── src/
│   │   ├── content-script.js     (Scan pages)
│   │   ├── background.js         (AI + Vault)
│   │   ├── popup.html            (UI)
│   │   ├── popup.js              (Logic)
│   │   ├── ocr.js                (Image→Text)
│   │   └── sql-client.js         (SQL integration)
│   └── assets/
│       └── icon-*.png            (Icons)
│
├── 🔧 Backend (Node.js - Optional)
│   ├── backend/server.js         (REST API)
│   ├── package.json              (Dependencies)
│   └── .env.example              (Config template)
│
└── 🔄 Auto-Sync
    ├── auto-git-sync.ps1         (PowerShell watcher)
    ├── auto-git-sync.bat         (Windows wrapper)
    └── AUTO_SYNC_GUIDE.md        (Setup guide)
```

## 🎯 Tính Năng Matrix

| Tính Năng | Offline | Free | Local | Auto | Status |
|-----------|---------|------|-------|------|--------|
| Scan | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Ollama AI | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| OpenAI AI | ❌ | ❌ | ❌ | ✅ | ✅ Ready |
| Answer Vault | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| SQL Server | ✅ | ✅ | ⚠️* | ✅ | ✅ Ready |
| Auto-Solver | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| OCR | ✅ | ✅ | ⚠️ | ✅ | ⚠️ Beta |
| Auto-Git | ✅ | ✅ | ✅ | ✅ | ✅ Ready |

*SQL Server có thể local hoặc cloud

## 🛠️ Yêu Cầu Hệ Thống

### Minimal (Chỉ Extension + Ollama)
- Browser: Chrome 90+, Edge, Brave
- Ollama: 6GB RAM, 4GB disk
- OS: Windows 10+, Mac, Linux
- **Chi phí**: FREE ✅

### Full Stack (+ SQL Server Backend)
- Node.js 16+
- SQL Server 2019+ (Express version free)
- **Chi phí**: FREE (nếu dùng SQL Express) ✅

## 🚀 Installation

### Option A: Auto-Setup (Recommended)

**Windows**:
```powershell
cd quiz-auto-solver
.\setup.ps1
```

**Mac/Linux**:
```bash
cd quiz-auto-solver
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup

👉 [SETUP.md](SETUP.md) - Chi tiết từng bước

## 🎓 Hướng Dẫn Sử Dụng

### 1. Cài Ollama
```bash
# Download: https://ollama.ai
# Cài xong, chạy:
ollama pull mistral
ollama serve
```

### 2. Load Extension
```
1. chrome://extensions
2. Developer mode: ON
3. Load unpacked → chọn folder này
```

### 3. Cấu Hình
```
Extension icon → Settings
AI Provider: Ollama (default)
Endpoint: http://localhost:11434/api/chat
Model: mistral (hoặc llama2, neural-chat)
```

### 4. Dùng Thôi!
```
1. Vào website quiz
2. Click extension icon
3. "🔍 Scan Câu Hỏi"
4. "⚡ Giải Toàn Bộ"
5. Chờ AI xử lý & auto-select đáp án
```

## 🔐 Bảo Mật & Privacy

| Yếu Tố | Ollama | OpenAI |
|--------|--------|--------|
| Dữ liệu local | ✅ | ❌ |
| Offline | ✅ | ❌ |
| API key | ❌ | ✅ |
| Tính phí | ❌ | ✅ |
| Riêng tư | ✅ | ⚠️ |

**Kết luận**: Dùng Ollama cho riêng tư 🔒

## 🔧 Configuration

### Ollama Settings (.env)
```
AI_PROVIDER=ollama
OLLAMA_ENDPOINT=http://localhost:11434/api/chat
OLLAMA_MODEL=mistral
```

### OpenAI Fallback (.env)
```
OPENAI_API_KEY=sk-your-key-here
```

### SQL Server (Optional)
```
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=QuizAnswerVault
DB_AUTH_TYPE=windows
```

👉 [.env.example](.env.example) - Template lengkap

## 📚 Documentation

| File | Tujuan |
|------|--------|
| [QUICK_START.md](QUICK_START.md) | Setup 5 phút |
| [SETUP.md](SETUP.md) | Setup detail |
| [OLLAMA_GUIDE.md](OLLAMA_GUIDE.md) | Ollama tutorial |
| [WINDOWS_AUTH.md](WINDOWS_AUTH.md) | Windows Auth setup |
| [AUTO_SYNC_GUIDE.md](AUTO_SYNC_GUIDE.md) | Git sync |
| [API_DOCS.md](API_DOCS.md) | API reference |
| [FILES.md](FILES.md) | Project structure |

## 🐛 Troubleshooting

### "Ollama connection failed"
```bash
# Kiểm tra Ollama đang chạy
ollama serve

# Kiểm tra endpoint
curl http://localhost:11434/api/tags
```

### "Extension không load"
```
1. chrome://extensions
2. Developer mode: ON
3. Reload extension (Ctrl+Shift+R)
```

### "No model found"
```bash
# List models
ollama list

# Pull model
ollama pull mistral
```

👉 Chi tiết: [QUICK_START.md](QUICK_START.md#troubleshooting)

## 🤝 Contributing

Contributions welcome! 

1. Fork repository
2. Create feature branch
3. Make changes
4. Push & create PR

## 📄 License

MIT - Tự do sử dụng, sửa, phân phối

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM runtime
- [OpenAI](https://openai.com) - Cloud AI (fallback)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/mv3/)
- Community feedback & contributions

## 📞 Support

- 📖 Docs: Xem folder này
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📧 Email: Contact through GitHub

---

**Made with ❤️ for students**

🌟 If helpful, please star the repo! 🌟
