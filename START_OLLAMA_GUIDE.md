# 🚀 Start Ollama - Auto Setup Scripts

**Tự động cài Ollama model & chạy server - một file thôi!**

---

## 📋 Các File

### Windows

| File | Cách Chạy | Ưu Điểm |
|------|-----------|--------|
| `start-ollama.bat` | Double-click | Đơn giản nhất |
| `start-ollama.ps1` | PowerShell | Logs rõ ràng |

### Mac/Linux

| File | Cách Chạy |
|------|-----------|
| `start-ollama.sh` | `chmod +x start-ollama.sh && ./start-ollama.sh` |

---

## 🚀 Cách Chạy

### Windows - Dễ Nhất (Double-Click)

```powershell
# 1. Mở folder dự án
# 2. Double-click: start-ollama.bat
# 3. Chờ download & server chạy
```

✅ **Output**:
```
════════════════════════════════════════════════════════════
   Ollama Auto Setup - Windows
════════════════════════════════════════════════════════════

✅ Ollama đã cài
✅ Mistral model đã có

════════════════════════════════════════════════════════════
   🚀 Chạy Ollama Server...
════════════════════════════════════════════════════════════

📌 Ollama sẽ chạy trên: http://localhost:11434
📌 Để dừng: Nhấn Ctrl+C

✅ Browser Extension sẽ tự động kết nối

[Ollama server logs...]
```

### Windows - PowerShell

```powershell
# PowerShell as normal user
cd quiz-auto-solver
.\start-ollama.ps1
```

Nếu có permission error:
```powershell
# Run as Admin PowerShell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\start-ollama.ps1
```

### Mac/Linux

```bash
# Terminal
cd quiz-auto-solver
chmod +x start-ollama.sh
./start-ollama.sh
```

---

## ⚙️ Script Làm Gì?

### Step 1: Kiểm Tra Ollama Cài Chưa
```
Nếu chưa cài → Yêu cầu download từ https://ollama.ai
Nếu cài rồi → Tiếp tục
```

### Step 2: Kiểm Tra Model Tồn Tại
```
Nếu mistral chưa có → Download (~4GB, 5-10 phút)
Nếu có rồi → Bỏ qua
```

### Step 3: Chạy Ollama Server
```
ollama serve
→ Server chạy trên http://localhost:11434
→ Ctrl+C để dừng
```

---

## ✅ Kiểm Tra Hoạt Động

### Khi Script Chạy

**Lần đầu** (có download):
```
📥 Downloading Ollama model: mistral (4GB)...
   (Lần đầu sẽ mất 5-10 phút)
[... download logs ...]
✅ Mistral downloaded!

🚀 Chạy Ollama Server...
📌 Ollama sẽ chạy trên: http://localhost:11434
[server logs continue...]
```

**Lần sau** (model đã có):
```
✅ Ollama đã cài
✅ Mistral model đã có

🚀 Chạy Ollama Server...
[server logs...]
```

### Kiểm Tra Endpoint

**Khi server chạy**, trong terminal khác:

```bash
# Windows (PowerShell/CMD)
curl http://localhost:11434/api/tags

# Mac/Linux
curl http://localhost:11434/api/tags
```

✅ **Output** (JSON):
```json
{
  "models": [
    {
      "name": "mistral:latest",
      "modified_at": "2024-09-14T10:30:00Z",
      "size": 4000000000
    }
  ]
}
```

---

## 🎯 Workflow

### Lần Đầu (Setup Mới)

```
1. Double-click start-ollama.bat
   ↓
2. Script check Ollama → cài download model
   ↓
3. Server chạy (http://localhost:11434)
   ↓
4. Browser extension auto-connect
   ↓
5. ✅ Ready to use!
```

### Lần Sau (Model Có Rồi)

```
1. Double-click start-ollama.bat
   ↓
2. Server chạy ngay (model đã cache)
   ↓
3. ✅ Ready to use!
```

---

## 📋 Advanced: Chọn Model Khác

Nếu muốn dùng model khác thay vì mistral:

### Option 1: Edit Script

**Windows (start-ollama.bat)**:
```batch
REM Thay dòng:
ollama pull mistral

REM Thành (chọn 1):
ollama pull llama2          # Llama 2 (tốt, chậm hơn)
ollama pull orca-mini       # Nhẹ (1.3GB)
ollama pull neural-chat     # Chat-optimized
```

**Mac/Linux (start-ollama.sh)**:
```bash
# Thay dòng:
ollama pull mistral

# Thành (chọn 1):
ollama pull llama2
ollama pull orca-mini
ollama pull neural-chat
```

### Option 2: Manual

```bash
# List models
ollama list

# Download thêm model
ollama pull llama2

# Cấu hình extension
Extension → Settings → Ollama Model: llama2
```

---

## 🔗 Danh Sách Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **mistral** | 4GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Default |
| llama2 | 3.8GB | ⭐⭐⭐ | ⭐⭐⭐⭐ | Good |
| neural-chat | 4GB | ⭐⭐⭐⭐ | ⭐⭐⭐ | Chat |
| orca-mini | 1.3GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Lightweight |
| phi | 1.6GB | ⭐⭐⭐⭐⭐ | ⭐⭐ | Ultra-lite |
| dolphin-mixtral | 26GB | ⭐⭐ | ⭐⭐⭐⭐⭐ | Powerful |

👉 Xem đầy đủ: https://ollama.ai/library

---

## 🛑 Dừng Server

**Khi Script Chạy**:
```
Nhấn: Ctrl + C

Output:
^C
[Ollama server stops]
```

**Nếu không tắt được**:
```bash
# Windows (PowerShell)
Stop-Process -Name ollama

# Mac/Linux
pkill ollama
```

---

## 🐛 Troubleshooting

### ❌ "Ollama chưa cài"

**Solution**:
1. Download từ: https://ollama.ai
2. Cài xong, restart terminal
3. Chạy lại script

### ❌ "Download failed"

**Solution**:
```bash
# Thử lại manual
ollama pull mistral

# Nếu vẫn fail:
# - Check internet connection
# - Try download cách model: ollama pull orca-mini
```

### ❌ "Port 11434 already in use"

**Solution**:
```bash
# Windows
netstat -ano | find "11434"
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :11434
kill -9 <PID>
```

---

## 📊 File Comparison

| Feature | .bat | .ps1 | .sh |
|---------|------|------|-----|
| Dễ chạy | ✅✅ | ✅ | ⚠️ |
| Error logs | ✅ | ✅✅ | ✅ |
| Colors | ❌ | ✅✅ | ✅✅ |
| OS | Windows | Windows | Mac/Linux |

---

## 💡 Tips

### Chạy Ollama Ở Background (Windows)

```powershell
# Trong PowerShell
Start-Process -NoNewWindow -FilePath "ollama" -ArgumentList "serve"

# Hoặc dùng Start-Job
Start-Job -ScriptBlock { & ollama serve }
```

### Chạy Ollama Ở Background (Mac/Linux)

```bash
# Terminal
nohup ollama serve &

# Hoặc
ollama serve &
```

### Auto-Start Khi Boot

**Windows Task Scheduler**:
1. Mở Task Scheduler
2. Create Basic Task
3. Trigger: At Startup
4. Action: `C:\...\start-ollama.bat`

---

## ✨ Next Steps

```
1. ✅ Chạy: start-ollama.bat (or .ps1 / .sh)
   ↓
2. ✅ Chờ server chạy (http://localhost:11434)
   ↓
3. ✅ Load extension: chrome://extensions
   ↓
4. ✅ Configure: Settings → Ollama
   ↓
5. ✅ Test: Vào quiz → Scan → Solve! 🎉
```

---

**🎉 Ollama auto-start - Just run one file!**
