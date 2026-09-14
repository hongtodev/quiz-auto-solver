# ⚡ Quick Start - 5 Phút Cài Đặt

## 🚀 Nhanh Nhất (Ollama Local + Extension)

### 1️⃣ Cài Ollama (5 phút)
```bash
# Download & Install
# https://ollama.ai → Download
# Chạy installer

# Hoặc Terminal:
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Tải Model (chọn 1)
ollama pull mistral      # 4GB - Recommended ⭐
# HOẶC
ollama pull llama2       # 3.8GB
ollama pull orca-mini    # 1.3GB - Lightweight
```

### 2️⃣ Chạy Ollama
```bash
ollama serve
# Hoặc bỏ qua, Ollama tự chạy background
# Kiểm tra: curl http://localhost:11434/api/tags
```

### 3️⃣ Load Extension
- Gõ: `chrome://extensions/`
- Bật "Developer mode" (góc phải)
- Click "Load unpacked" → chọn folder `quiz-auto-solver`

### 4️⃣ Cấu Hình Extension
- Click icon extension
- Tab "Cài Đặt"
- **AI Provider**: 🚀 Ollama (đã mặc định)
- **Ollama Endpoint**: `http://localhost:11434/api/chat`
- **Ollama Model**: `mistral` (hoặc model bạn chọn)
- Click "💾 Lưu Cài Đặt"

### ✅ Dùng Thôi!
```
1. Truy cập website quiz
2. Click icon extension
3. "🔍 Scan Câu Hỏi"
4. "⚡ Giải Toàn Bộ"
5. Chờ AI giải (free, local, nhanh!) 🎉
```

---

## ☁️ Alternative: OpenAI (Nếu không cài Ollama)

### 1️⃣ Lấy API Key
- Truy cập: https://platform.openai.com/api-keys
- Tạo key mới (copy `sk-...`)

### 2️⃣ Load Extension
- `chrome://extensions/` → "Load unpacked"

### 3️⃣ Cấu Hình
- Extension → Tab "Cài Đặt"
- **AI Provider**: ☁️ OpenAI
- **API Key**: Paste key
- Click "Lưu"

### ⚠️ Lưu Ý OpenAI
- ❌ Tính phí: ~$0.002/question
- ❌ Cần internet
- ❌ Dữ liệu lên server
- ✅ Chính xác cao

---

## 📋 So Sánh

| Yếu Tố | Ollama | OpenAI |
|--------|--------|--------|
| **Chi Phí** | ✅ FREE | ❌ $$ |
| **Setup** | 5 phút | 2 phút |
| **Tốc Độ** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Chính Xác** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Offline** | ✅ | ❌ |
| **Riêng Tư** | ✅ | ⚠️ |

**Khuyến nghị**: **Ollama** 🚀

---

## Yêu Cầu Hệ Thống

### Tối Thiểu
- Windows 10+, Mac, hoặc Linux
- Chrome, Edge, hoặc Brave
- Ollama: 6GB RAM, 4GB disk
- HOẶC OpenAI: chỉ cần browser

### Khuyến Nghị
- Windows 11 / Mac M1+ / Ubuntu 22.04
- Chrome latest
- Ollama: 8GB RAM, SSD 10GB
- GPU (optional, tăng tốc Ollama)

---

## Cách Dùng

### Scenario 1: Giải 1 Quiz (2 phút)
```
1. Mở website quiz
2. Click icon extension
3. "🔍 Scan Câu Hỏi"
4. "⚡ Giải Toàn Bộ"
5. Submit quiz
```

### Scenario 2: Học từng câu (10 phút)
```
1. "🔍 Scan"
2. Xem câu: "➡️ Câu Tiếp"
3. Giải thích: Xem trong popup
4. Lưu câu: Tự động vào Kho
```

### Scenario 3: Quản lý Kho Đáp Án
```
1. Tab "Kho Đáp Án"
2. Xem tất cả câu đã giải
3. Xóa câu sai
4. Tìm kiếm câu
```

---

## Tính Năng

| Tính Năng | AI | Yêu Cầu | Status |
|-----------|----|---------|----- |
| Scan câu hỏi | ❌ | - | ✅ |
| Kho đáp án local | ❌ | - | ✅ |
| Auto-solve | ✅ | Ollama/OpenAI | ✅ |
| Giải thích | ✅ | Ollama/OpenAI | ✅ |
| Highlight đáp án | ❌ | - | ✅ |
| OCR ảnh | ❌ | - | ⚠️ Beta |
| SQL Sync | ✅ | Backend | ⚠️ Optional |

---

## Troubleshooting

### Q: Có tính tiền không?
**A**: OpenAI API tính tiền. Ước tính ~$0.002/câu. Free trial có $5 credit.

### Q: Có bị detect không?
**A**: Không, là browser extension bình thường. Nhưng sử dụng có trách nhiệm!

### Q: Hoạt động trên mobile?
**A**: Chrome/Edge có mobile phiên bản, nhưng giới hạn. Sắp hỗ trợ better.

### Q: Database nếu không cài SQL?
**A**: Dùng IndexedDB (lưu local trên browser). Giới hạn ~10MB.

### Q: Mất dữ liệu nếu clear cache?
**A**: Có. Giải pháp: Dùng SQL Server backup.

### Q: Công việc online có được không?
**A**: Có, nếu đó là hình thức giải quiz được phép.

---

## Keyboard Shortcuts

| Phím | Hành Động |
|------|---------|
| `Alt + Q` | Mở extension popup |
| `F12` | Console (xem logs) |
| `Ctrl + Shift + I` | Inspector (xem HTML) |
| `Ctrl + Shift + C` | Picker (chọn element) |

---

## Support & Resources

- 📖 **Full Guide**: [README.md](README.md)
- 🔧 **Setup Detail**: [SETUP.md](SETUP.md)
- 🐛 **Report Bug**: GitHub Issues
- 💬 **Discussion**: GitHub Discussions
- 📧 **Email**: contact@example.com

---

## Next Steps

✅ Extension loaded?
→ **Scan một quiz ngay!**

❓ Lỗi gì?
→ **Xem [SETUP.md](SETUP.md) Troubleshooting section**

🚀 Muốn deploy production?
→ **Xem hướng dẫn deployment**

---

**Happy Quizzing! 🎓**
