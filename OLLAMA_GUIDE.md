# 🚀 Ollama Integration Guide

**Sử dụng AI Local (Ollama) làm default - Miễn phí, Riêng tư, Nhanh**

---

## ⚡ Quick Start (10 phút)

### 1️⃣ Cài Ollama
**Windows/Mac/Linux**:
- Download: https://ollama.ai
- Cài đặt (default settings)
- Mở terminal

### 2️⃣ Tải Model
```bash
# Mistral (Recommended - nhanh, chính xác)
ollama pull mistral

# Hoặc alternatives:
ollama pull llama2          # Llama 2 (chậu hơn nhưng tốt)
ollama pull neural-chat     # Tối ưu cho chat
ollama pull dolphin-mixtral # Mạnh hơn nhưng tốn RAM
```

### 3️⃣ Chạy Ollama
```bash
ollama serve
# Hoặc: Ollama sẽ chạy background tự động
```

**Kiểm tra hoạt động**:
```bash
curl http://localhost:11434/api/tags
# Nếu thấy list models = OK ✅
```

### 4️⃣ Cấu Hình Extension
1. Click icon extension
2. Tab "Cài Đặt"
3. AI Provider: Chọn "🚀 Ollama (Local, Free, Recommended)"
4. Ollama Endpoint: `http://localhost:11434/api/chat` (mặc định)
5. Ollama Model: `mistral` (hoặc model bạn chọn)
6. Click "💾 Lưu Cài Đặt"

### 5️⃣ Test
1. Mở trang quiz
2. Click icon extension
3. "🔍 Scan Câu Hỏi"
4. "⚡ Giải Toàn Bộ"
5. Chờ Ollama xử lý (lần đầu chậm hơn, sau đó nhanh)

---

## 🎯 Ollama vs OpenAI

| Yếu Tố | Ollama | OpenAI |
|--------|--------|--------|
| **Chi Phí** | ✅ FREE | ❌ $0.002/question |
| **Tốc Độ** | ⭐⭐⭐ (local) | ⭐⭐⭐⭐ (cloud) |
| **Độ Chính Xác** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Quyền Riêng Tư** | ✅ Toàn bộ local | ❌ Gửi lên server |
| **Offline** | ✅ Hoạt động | ❌ Cần internet |
| **Internet** | ✅ Không cần | ❌ Bắt buộc |
| **Setup** | ⭐⭐⭐ Dễ | ⭐⭐⭐⭐ Rất dễ |
| **RAM** | 8GB+ | Không cần |

**Khuyến nghị**: **Ollama** cho máy local, an toàn, tiết kiệm 🎉

---

## 📥 Tải & Cài Ollama

### Windows

```bash
# 1. Download & Cài
# https://ollama.ai → Download for Windows
# Chạy installer → Cài đặt mặc định

# 2. Mở PowerShell hoặc CMD
ollama pull mistral

# 3. Chạy
ollama serve
# Hoặc bỏ qua, Ollama tự chạy background
```

**Verification**:
```powershell
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
```

### Mac

```bash
# 1. Brew install
brew install ollama

# 2. Tải model
ollama pull mistral

# 3. Chạy
ollama serve
```

### Linux

```bash
# 1. Download script
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Tải model
ollama pull mistral

# 3. Chạy
ollama serve

# Hoặc background
nohup ollama serve &
```

---

## 🎓 Chọn Model

Ollama hỗ trợ rất nhiều models. Dưới đây là những model phổ biến:

| Model | Size | Tốc Độ | Chính Xác | Yêu Cầu | Khuyến Nghị |
|-------|------|--------|----------|---------|------------|
| **mistral** | 4GB | ⭐⭐⭐⭐ Rất nhanh | ⭐⭐⭐⭐ | 6GB RAM | ✅ Best |
| **llama2** | 3.8GB | ⭐⭐⭐ Nhanh | ⭐⭐⭐⭐ | 8GB RAM | ✅ Good |
| **neural-chat** | 4GB | ⭐⭐⭐⭐ Rất nhanh | ⭐⭐⭐ | 6GB RAM | ✅ Chat |
| **dolphin-mixtral** | 26GB | ⭐⭐ Chậm | ⭐⭐⭐⭐⭐ | 32GB+ RAM | ⚠️ Powerful |
| **orca-mini** | 1.3GB | ⭐⭐⭐⭐⭐ Siêu nhanh | ⭐⭐⭐ | 4GB RAM | ✅ Lite |
| **phi** | 1.6GB | ⭐⭐⭐⭐⭐ Siêu nhanh | ⭐⭐⭐ | 4GB RAM | ✅ Very Lite |

### Tải model

```bash
# Format
ollama pull <model_name>

# Examples
ollama pull mistral          # Recommended
ollama pull llama2           # Alternative 1
ollama pull neural-chat      # Chat optimized
ollama pull dolphin-mixtral  # Most powerful
ollama pull orca-mini        # Lightweight
ollama pull phi              # Super lightweight
```

### Test model

```bash
ollama run mistral
# Rồi nhập câu hỏi để test
# Ví dụ: "Hà Nội là thủ đô của nước nào?"
```

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to Ollama"

**Giải pháp**:

```bash
# 1. Kiểm tra Ollama đang chạy
ollama serve

# 2. Trong terminal khác, kiểm tra
curl http://localhost:11434/api/tags

# 3. Nếu không chạy, chạy:
ollama serve
# Để background: nohup ollama serve &
```

### ❌ "No space left on device"

**Giải pháp**: Models lớn (26GB dolphin-mixtral)

```bash
# Dùng model nhỏ hơn
ollama pull mistral        # 4GB
ollama pull orca-mini      # 1.3GB

# Xóa model cũ
ollama rm dolphin-mixtral
```

### ❌ "Out of memory"

**Giải pháp**: RAM không đủ

```bash
# Cách 1: Giảm model size
ollama pull mistral      # 6GB
ollama pull orca-mini    # 4GB (nếu RAM=4GB)

# Cách 2: Close ứng dụng khác

# Cách 3: Tăng virtual memory
# Windows: Settings → System → Storage → Virtual Memory
# Mac/Linux: Thêm swap
```

### ❌ "Extension không gọi Ollama"

**Kiểm tra**:
1. Ollama endpoint: `http://localhost:11434/api/chat` ✅
2. Ollama Model: `mistral` (hoặc model bạn cài) ✅
3. Ollama đang chạy: `ollama serve` ✅
4. Check Console (F12) > Network xem request

---

## 📊 Performance Tips

### Tối Ưu Tốc Độ

```bash
# 1. Dùng GPU (nếu có)
# NVIDIA (CUDA)
# AMD (ROCm)
# Apple (Metal) - Ollama auto-detect

# 2. Chọn model nhanh
ollama pull mistral    # Hoặc orca-mini

# 3. Tăng context length (nếu cần)
# Trong .env hoặc settings (todo)
NUM_PREDICT=100  # Giới hạn token output

# 4. Giảm temperature (accuracy)
# Để default hoặc tune
```

### Giảm RAM Usage

```bash
# Cách 1: Dùng model nhỏ
ollama pull orca-mini   # 1.3GB

# Cách 2: Offload layer
# Chỉnh trong Ollama config (advanced)

# Cách 3: Offload to CPU
# Set NUM_GPU=-1 (dùng CPU, chậm nhưng tiết kiệm RAM)
```

---

## 🎓 Ví Dụ Sử Dụng

### Full Setup

```bash
# Terminal 1: Tải model
ollama pull mistral

# Terminal 2: Chạy Ollama
ollama serve
# Output:
# time=2024-09-14T10:00:00.000Z level=INFO msg="Listening on 127.0.0.1:11434"
```

### Extension Settings

```
AI Provider: 🚀 Ollama (Local, Free)
Ollama Endpoint: http://localhost:11434/api/chat
Ollama Model: mistral
```

### Test Curl

```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral",
    "messages": [
      {"role": "user", "content": "Hã Nội là gì?"}
    ],
    "stream": false
  }'
```

---

## 🆚 Migration từ OpenAI → Ollama

### Cách 1: Direct Switch

```
1. Extension → Settings
2. AI Provider: OpenAI → Ollama
3. Kiểm tra Ollama endpoint & model
4. Lưu
5. Dùng bình thường
```

### Cách 2: Hybrid (Ollama + OpenAI Fallback)

```
1. Cấu hình Ollama (primary)
2. Cấu hình OpenAI key (fallback)
3. Extension sẽ:
   - Thử Ollama trước
   - Nếu fail → OpenAI
   - Auto-fallback khi Ollama down
```

---

## 📝 API Format

Ollama compatible với OpenAI API format:

```javascript
// Ollama endpoint
POST http://localhost:11434/api/chat
{
  "model": "mistral",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": false,
  "temperature": 0.7
}
```

---

## 🔒 Security & Privacy

### Ollama (Local)
- ✅ Dữ liệu không rời khỏi máy
- ✅ Không có account/password
- ✅ Hoàn toàn offline
- ✅ 100% quyền riêng tư

### OpenAI (Cloud)
- ⚠️ Dữ liệu gửi lên server
- ⚠️ OpenAI có thể giữ logs
- ⚠️ Cần internet
- ⚠️ API key là secret

**Khuyến nghị**: Dùng **Ollama** cho dữ liệu nhạy cảm 🔒

---

## 📚 Resources

- **Ollama Website**: https://ollama.ai
- **Model Library**: https://ollama.ai/library
- **GitHub**: https://github.com/jmorganca/ollama
- **Discord**: https://discord.gg/ollama
- **Documentation**: https://github.com/jmorganca/ollama/wiki

---

## 🎯 Tiếp Theo

### Setup Hoàn Chỉnh

```bash
# 1. Cài Ollama
# → https://ollama.ai

# 2. Tải model
ollama pull mistral

# 3. Chạy
ollama serve

# 4. Cấu hình extension
# → Settings → Ollama
# → Endpoint: http://localhost:11434/api/chat
# → Model: mistral

# 5. Dùng
# → Scan quiz → Giải → Enjoy! 🎉
```

---

**Happy Local AI! 🚀**

*Ollama + Quiz Auto Solver = Miễn phí + Riêng tư + Nhanh*
