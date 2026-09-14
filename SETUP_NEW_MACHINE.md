# 🖥️ Setup Trên Máy Khác (Fresh Machine)

**Hướng dẫn cài đặt Quiz Auto Solver trên máy mới hoặc máy khác**

---

## ⚡ Cách Nhanh Nhất (Auto-Setup)

### Windows

```powershell
# 1. Clone từ GitHub
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver

# 2. Chạy setup script (tự động check & install dependencies)
.\setup.ps1

# 3. Cài Ollama khi script yêu cầu
# Download: https://ollama.ai
# Sau khi cài:
ollama pull mistral
ollama serve

# 4. Load extension vào Chrome
# chrome://extensions → Load unpacked → Chọn folder này

# 5. Done! 🎉
```

### Mac

```bash
# 1. Clone
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver

# 2. Chạy setup
chmod +x setup.sh
./setup.sh

# 3. Cài Ollama
brew install ollama
ollama pull mistral
ollama serve

# 4. Load extension
# chrome://extensions → Load unpacked

# 5. Done!
```

### Linux

```bash
# 1. Clone
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver

# 2. Chạy setup
chmod +x setup.sh
./setup.sh

# 3. Cài Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull mistral
ollama serve

# 4. Load extension
# chrome://extensions → Load unpacked

# 5. Done!
```

---

## ✅ Kiểm Tra Sau Setup

### 1. Kiểm Tra Git Repository

```bash
git remote -v
# Output:
# origin  https://github.com/hongtodev/quiz-auto-solver.git (fetch)
# origin  https://github.com/hongtodev/quiz-auto-solver.git (push)
```

### 2. Kiểm Tra Folder Structure

```bash
ls -la
# Phải thấy:
# - src/          (extension files)
# - backend/      (server files)
# - manifest.json
# - .env.example
# - *.md          (documentation)
```

### 3. Kiểm Tra Ollama

```bash
ollama list
# Phải thấy: mistral (hoặc model bạn chọn)

curl http://localhost:11434/api/tags
# Nếu output JSON = OK ✅
```

### 4. Kiểm Tra Extension

```
1. Chrome: chrome://extensions/
2. Tìm "Quiz Auto Solver"
3. Check: Extension icon hiện trong toolbar
4. Click icon → Settings
   - AI Provider: Ollama (default)
   - Endpoint: http://localhost:11434/api/chat ✅
```

### 5. Test Chạy

```
1. Vào website quiz bất kỳ (houlu.ms, exam, etc)
2. Click extension icon
3. Tab "Solver"
4. Click "🔍 Scan Câu Hỏi"
5. Nếu thấy danh sách câu → Setup OK ✅
6. Click "⚡ Giải Toàn Bộ"
7. Chờ Ollama xử lý (5-30 giây tùy máy)
8. Nếu auto-select đáp án → Setup hoàn tất ✅
```

---

## 🛠️ Chi Tiết Setup

### Requirement Tối Thiểu

| Item | Requirement | Ghi Chú |
|------|-------------|--------|
| OS | Windows 10+, Mac 10.14+, Ubuntu 20.04+ | 64-bit only |
| Browser | Chrome 90+, Edge 90+, Brave latest | Manifest V3 |
| Git | Latest | Để clone repo |
| Ollama | Latest | 6GB RAM, 4GB disk |
| RAM | 8GB min | 4GB cho Ollama + 4GB hệ thống |
| Disk | 5GB free | Code + model caching |
| Internet | Khi cài lần đầu | Ollama model download |

### Installation Steps

#### Step 1: Clone Repository

```bash
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver
git log --oneline | head -3
# Xem lịch sử commit (check có phải repo đúng)
```

#### Step 2: Verify Project Files

```bash
# Các file này PHẢI có:
test -f manifest.json && echo "✅ manifest.json"
test -f package.json && echo "✅ package.json"
test -f .env.example && echo "✅ .env.example"
test -f src/background.js && echo "✅ src/background.js"
test -f src/content-script.js && echo "✅ src/content-script.js"
test -f src/popup.html && echo "✅ src/popup.html"
test -f backend/server.js && echo "✅ backend/server.js"
```

#### Step 3: Run Setup Script

**Windows**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup.ps1
```

**Mac/Linux**:
```bash
chmod +x setup.sh
./setup.sh
```

#### Step 4: Install Ollama

**Windows**:
- Download: https://ollama.ai
- Run installer
- Restart PowerShell
- `ollama pull mistral`
- `ollama serve` (để chạy background)

**Mac**:
```bash
brew install ollama
ollama pull mistral
ollama serve
```

**Linux**:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull mistral
ollama serve
```

#### Step 5: Load Extension

1. Mở Chrome/Edge/Brave
2. Vào: `chrome://extensions/`
3. Bật "Developer mode" (góc trên phải)
4. Click "Load unpacked"
5. Chọn folder: `quiz-auto-solver`
6. Extension sẽ hiện trong toolbar ✅

#### Step 6: Configure Extension

1. Click extension icon
2. Tab "🔧 Cài Đặt"
3. **AI Provider**: `🚀 Ollama (Local, Free)` (default)
4. **Ollama Endpoint**: `http://localhost:11434/api/chat`
5. **Ollama Model**: `mistral`
6. Click "💾 Lưu Cài Đặt"

#### Step 7: Test

```
1. Vào: https://houlu.ms/ (hoặc website quiz khác)
2. Mở quiz bất kỳ
3. Click extension icon
4. Tab "🔍 Giải Bài"
5. Click "🔍 Scan Câu Hỏi"
   → Phải thấy danh sách câu hỏi
6. Click "⚡ Giải Toàn Bộ"
   → Chờ AI xử lý
   → Phải thấy auto-select đáp án ✅
```

---

## 🔄 Backend Setup (Optional - SQL Server Sync)

Nếu muốn sync Answer Vault với SQL Server:

### Windows

```powershell
# 1. Cài SQL Server Express (free)
# Download: https://www.microsoft.com/en-us/sql-server/sql-server-express

# 2. Tạo database
sqlcmd -S localhost\SQLEXPRESS
# Trong sqlcmd:
# CREATE DATABASE QuizAnswerVault;
# GO
# CREATE TABLE [QuizAnswerVault].[dbo].[Answers] (
#     id INT PRIMARY KEY IDENTITY(1,1),
#     questionHash VARCHAR(255) NOT NULL UNIQUE,
#     ...
# );
# GO
# EXIT

# 3. Cài backend dependencies
cd backend
npm install

# 4. Cài .env (copy từ .env.example)
# Điền: DB_SERVER, DB_NAME, DB_AUTH_TYPE, etc

# 5. Chạy server
node server.js
# Output: Server running on http://localhost:3000 ✅
```

### Mac/Linux

```bash
# 1. Cài SQL Server mua license (hoặc dùng Docker)
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourPassword' \
  -p 1433:1433 --name sqlserver \
  mcr.microsoft.com/mssql/server:latest

# 2-5: Giống Windows
```

---

## 🐛 Troubleshooting

### ❌ "fatal: not a git repository"

```bash
# Solution: Clone đầu tiên
cd ..
git clone https://github.com/hongtodev/quiz-auto-solver
cd quiz-auto-solver
```

### ❌ "Ollama connection failed"

```bash
# Check 1: Ollama đang chạy?
ollama serve

# Check 2: Endpoint đúng?
curl http://localhost:11434/api/tags
# Nếu error → Ollama chưa chạy

# Check 3: Model tồn tại?
ollama list
# Phải thấy "mistral"
```

### ❌ "Extension không load"

```
1. Check: manifest.json tồn tại?
2. Check: src/background.js tồn tại?
3. Chrome DevTools (F12):
   - Application → Manifest
   - Console → Có error?
4. Reload extension (Ctrl+Shift+R)
5. Nếu vẫn fail:
   - Unload extension
   - Reload project (git pull)
   - Load lại extension
```

### ❌ "No questions found"

```
1. Check website quiz support (houlu.ms, exam, etc)
2. Open DevTools (F12)
3. Check: Content script log
4. Thử trang khác
5. Nếu vẫn fail → File issue trên GitHub
```

### ❌ "Out of memory - Ollama"

```bash
# Solution 1: Dùng model nhỏ
ollama pull orca-mini
# Rồi trong extension settings: Model = orca-mini

# Solution 2: Offload to CPU
# Trong advanced settings (future version)

# Solution 3: Close ứng dụng khác
```

---

## ✨ Verify Complete Setup

Chạy test này để verify mọi thứ OK:

```bash
# Trong folder quiz-auto-solver:

# 1. Git
git status  # On branch main, nothing to commit
echo "✅ Git OK"

# 2. Files
test -f manifest.json && echo "✅ manifest.json"
test -f src/background.js && echo "✅ background.js"
test -f .env.example && echo "✅ .env.example"

# 3. Ollama
ollama list | grep mistral && echo "✅ Ollama OK"

# 4. Browser extension
echo "✅ Load extension: chrome://extensions"
echo "✅ Click icon → Check AI Provider = Ollama"

# 5. Test
echo "✅ Vào quiz website → Scan → Solve!"
```

---

## 🔗 Các Resource Quan Trọng

| Resource | Link |
|----------|------|
| GitHub Repo | https://github.com/hongtodev/quiz-auto-solver |
| Ollama Download | https://ollama.ai |
| Chrome Extensions | https://developer.chrome.com/docs/extensions/ |
| Project Docs | Xem folder SETUP.md, QUICK_START.md |

---

## 🎯 Expected Behavior Khi Setup Hoàn Tất

### Extension Load

- ✅ Icon hiện trong Chrome toolbar
- ✅ Click icon → Popup mở ra
- ✅ 3 tabs: "Giải Bài", "Kho Đáp Án", "Cài Đặt"

### Scan Câu Hỏi

- ✅ Tab "Giải Bài"
- ✅ Click "🔍 Scan Câu Hỏi"
- ✅ Danh sách câu xuất hiện
- ✅ Stats update: "N Câu Tìm Được"

### Giải Câu

- ✅ Click "⚡ Giải Toàn Bộ"
- ✅ Console: "[AI] Trying Ollama..."
- ✅ 5-30 giây chờ
- ✅ Các đáp án được auto-select (click vào input/radio)
- ✅ Popup update: "N Câu Đã Giải"
- ✅ Tab "Kho Đáp Án" hiển thị các câu đã lưu

### Kho Đáp Án

- ✅ Tab "Kho Đáp Án"
- ✅ Thấy danh sách câu đã giải
- ✅ Có thể xóa câu
- ✅ Có thể search câu

---

## 📞 Support

Nếu có vấn đề:

1. **Check Docs**: Xem SETUP.md, QUICK_START.md
2. **Check Logs**: Browser DevTools (F12)
3. **Check GitHub**: Issues & Discussions
4. **Email**: Contact qua GitHub

---

**Happy Coding! 🎉**

*Quiz Auto Solver sẽ hoạt động bình thường trên bất kỳ máy nào miễn là cài đúng theo hướng dẫn*
