# 📖 Hướng Dẫn Cài Đặt Chi Tiết

## Mục Lục
1. [Cài Đặt Extension](#cài-đặt-extension)
2. [Cấu Hình OpenAI API](#cấu-hình-openai-api)
3. [Cài Đặt SQL Server](#cài-đặt-sql-server)
4. [Khởi Động Backend](#khởi-động-backend)
5. [Kiểm Tra & Test](#kiểm-tra--test)

---

## Cài Đặt Extension

### Bước 1: Download Project
```bash
# Sử dụng Git
git clone https://github.com/yourusername/quiz-auto-solver
cd quiz-auto-solver

# Hoặc download file ZIP
# https://github.com/yourusername/quiz-auto-solver/archive/main.zip
```

### Bước 2: Load vào Chrome/Edge
1. Mở trình duyệt (Chrome, Edge, Brave, etc)
2. Gõ vào địa chỉ: `chrome://extensions/` (hoặc `edge://extensions/`)
3. Bật "Developer mode" ở góc trên phải
4. Click "Load unpacked"
5. Chọn folder `quiz-auto-solver`

**Thành công khi**: 
- Thấy icon extension trên toolbar
- Icon có nhãn "Quiz Auto Solver"

### Bước 3: Kiểm Tra Extension Loaded
```
Vào bất kỳ website nào
→ Click icon extension
→ Nhấn "🔍 Scan Câu Hỏi"
→ Nếu không lỗi = OK ✅
```

---

## Cấu Hình OpenAI API

### Bước 1: Tạo OpenAI Account
1. Truy cập https://platform.openai.com/
2. Click "Sign up" hoặc đăng nhập
3. Xác minh email

### Bước 2: Lấy API Key
1. Vào https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key (mặc định bắt đầu bằng `sk-`)
4. ⚠️ **Giữ bí mật**, không share key này

**Lưu ý Chi Phí**:
- Mỗi lần gọi API tính tiền
- Ước tính: ~$0.002 per question
- Free trial: $5 credit (expires sau 3 tháng)

### Bước 3: Cấu Hình trong Extension
1. Click icon extension
2. Vào tab "Cài Đặt"
3. Paste API Key vào "OpenAI API Key"
4. Click "💾 Lưu Cài Đặt"

**Kiểm Tra**:
```
Scan một câu hỏi → Chọn "Câu Tiếp"
→ Nếu có trong AI response = OK ✅
→ Nếu lỗi, xem console (F12) > Console
```

---

## Cài Đặt SQL Server

### 📌 Chọn Authentication Type

Trước khi cài SQL Server, quyết định authentication method:

| Method | Pros | Cons | Khi Nào Dùng |
|--------|------|------|-------------|
| **Windows Auth** ⭐ | An toàn, không cần password, user hiện tại | Chỉ hoạt động trên Windows domain | Development, local machine |
| **SQL Auth** | Dễ dùng, portable, cross-platform | Cần quản lý password | Production, remote server |

**Khuyến nghị**: Dùng **Windows Authentication** cho máy local (an toàn hơn) ✨

---

### Bước 1: Cài SQL Server Express (Miễn Phí)

**Windows**:
1. Download từ https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Chọn "SQL Server Express"
3. Cài đặt (Full install - express)
4. Lưu ý: User = `sa`, Password = `YourPassword`

**Hoặc dùng Docker**:
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123" `
  -p 1433:1433 `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### Bước 2: Tạo Database

**Phương pháp A: SQL Server Management Studio (GUI)**
1. Download SSMS: https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
2. Kết nối đến `localhost\SQLEXPRESS`
3. Chuột phải "Databases" → "New Database"
4. Tên: `QuizAnswerVault`
5. Click OK

**Phương pháp B: Command Line (T-SQL)**
```sql
-- Mở Command Prompt, chạy sqlcmd
sqlcmd -S localhost\SQLEXPRESS -U sa -P YourPassword

-- Rồi paste:
CREATE DATABASE QuizAnswerVault;
GO
USE QuizAnswerVault;
GO
```

### Bước 3: Tạo Bảng

**SQL Server Management Studio**:
1. Mở `QuizAnswerVault` database
2. Chuột phải "Tables" → "New Table"
3. Copy paste script dưới

**Hoặc chạy T-SQL**:
```sql
USE QuizAnswerVault;
GO

CREATE TABLE Answers (
    id INT PRIMARY KEY IDENTITY(1,1),
    questionHash VARCHAR(255) NOT NULL UNIQUE,
    questionText NVARCHAR(MAX) NOT NULL,
    correctAnswer VARCHAR(10) NOT NULL,
    explanation NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETDATE(),
    confirmed BIT DEFAULT 0,
    source VARCHAR(50) DEFAULT 'ai'
);

-- Tạo index để tìm nhanh
CREATE INDEX IX_QuestionHash ON Answers(questionHash);
CREATE INDEX IX_Timestamp ON Answers(timestamp);
CREATE INDEX IX_Source ON Answers(source);

-- Test data
INSERT INTO Answers (questionHash, questionText, correctAnswer, confirmed, source)
VALUES 
    ('hash_001', 'Tỉnh thủ đô Việt Nam là gì?', 'B', 1, 'manual'),
    ('hash_002', '2 + 2 bằng mấy?', 'C', 1, 'manual'),
    ('hash_003', 'Hà Nội là tỉnh hay thành phố?', 'D', 1, 'manual');

GO
```

### Bước 4: Verify Database
```sql
-- Chạy query này để kiểm tra
SELECT * FROM Answers;
GO
-- Phải thấy 3 dòng test data
```

---

## Khởi Động Backend

### Bước 1: Cài Node.js
1. Download từ https://nodejs.org/ (LTS version)
2. Cài đặt bình thường
3. Kiểm tra:
```bash
node --version  # v18.x.x
npm --version   # 9.x.x
```

### Bước 2: Cài Dependencies
```bash
cd quiz-auto-solver
npm install
```

**Output mong đợi**:
```
added 50+ packages in Xs
```

### Bước 3: Tạo File .env
```bash
# Copy template
cp .env.example .env

# Edit .env
# Windows: mở Notepad
notepad .env
```

**Nội dung .env** (2 tùy chọn):

**Tùy chọn A: Windows Authentication (Recommended)** ⭐
```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=QuizAnswerVault
DB_AUTH_TYPE=windows
# Không cần DB_USER/DB_PASSWORD (dùng current Windows user)
DB_ENCRYPT=false
PORT=3000
NODE_ENV=development
```

**Tùy chọn B: SQL Server Authentication (Legacy)**
```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=QuizAnswerVault
DB_AUTH_TYPE=sql
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_ENCRYPT=false
PORT=3000
NODE_ENV=development
```

> **Ghi chú**: 
> - Windows Auth (mặc định): Dùng tài khoản Windows hiện tại, an toàn hơn
> - SQL Auth: Dùng sa account, yêu cầu password

### 🔐 Chi Tiết: Windows Authentication Setup

Nếu chọn **Windows Auth** (Recommended), làm theo:

**Step 1: Đảm Bảo Windows User Có Quyền**
```bash
# Chạy Command Prompt as Administrator
# Verify SQL Server Running
Get-Service MSSQLSERVER
# Hoặc
Get-Service MSSQL$SQLEXPRESS
```

**Step 2: Cho Phép Current Windows User Truy Cập SQL Server**

Mở SQL Server Management Studio:
1. Kết nối: Server = `localhost\SQLEXPRESS`
2. Authentication = `Windows Authentication`
3. Login: `COMPUTERNAME\YourUsername`
4. Right-click "Security" → "Logins" → "New Login"
5. Tên: `COMPUTERNAME\YourUsername`
6. Server Roles: `sysadmin` (để test)
7. OK

**Step 3: Verify Connection**
```bash
# Test Windows Auth connection
sqlcmd -S localhost\SQLEXPRESS -E -Q "SELECT @@VERSION"
# -E flag = trusted connection (Windows Auth)
```

**Step 4: Backend Code Sẽ Dùng NTLM Automatically**
```javascript
// backend/server.js automatically detects DB_AUTH_TYPE=windows
// và sử dụng NTLM authentication
if (authType.toLowerCase() === 'windows') {
    return {
        type: 'ntlm',
        options: { domain: process.env.DB_DOMAIN || undefined }
    };
}
```

**Step 5: Test Backend Connection**
```bash
node backend/server.js
# Output mong đợi:
# 📊 Using Windows Authentication (NTLM)
# ✅ Connected to SQL Server
```

### SQL Server Authentication Setup

Nếu chọn **SQL Auth** (dùng sa):

**Step 1: Enable SQL Server Authentication**
- SQL Server installation chọn "SQL Server and Windows Authentication"

**Step 2: Set sa Password**
```sql
-- Run in SSMS as admin
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'YourSecurePassword123!';
GO
```

**Step 3: .env Config**
```env
DB_AUTH_TYPE=sql
DB_USER=sa
DB_PASSWORD=YourSecurePassword123!
```

---

### Bước 4: Test Kết Nối
```bash
node backend/server.js
```

**Output khi thành công**:
```
🚀 Quiz Auto Solver Backend Server
📡 Running on http://localhost:3000
📊 Database: Connected
```

**Nếu lỗi**:
```
❌ Database connection failed: ...
```

→ Check `.env` và SQL Server connection

### Bước 5: Chạy Backend (2 Cách)

**Cách A: Terminal thường**
```bash
node backend/server.js
# Ctrl+C để tắt
```

**Cách B: Auto-restart khi thay đổi code (Development)**
```bash
npm install -g nodemon  # Cài một lần
npm run dev            # Mỗi lần dùng
```

---

## Kiểm Tra & Test

### Test Extension

**Bước 1: Truy cập Website Quiz**
- Ví dụ: https://houlu.ms/mod/quiz/attempt.php...

**Bước 2: Test Các Tính Năng**

```
1️⃣ SCAN QUESTIONS
   Click Extension → Nhấn "🔍 Scan Câu Hỏi"
   ✅ Thành công: Thấy số câu > 0
   
2️⃣ AUTO-SOLVE
   Click "⚡ Giải Toàn Bộ"
   ✅ Thành công: Các câu được chọn tự động
   
3️⃣ ANSWER VAULT
   Vào tab "Kho Đáp Án"
   ✅ Thành công: Thấy các đáp án đã giải
   
4️⃣ AI INTEGRATION
   Mở Console (F12) > Console tab
   ✅ Thành công: Thấy logs từ AI
```

### Test Backend API

**Dùng Postman hoặc curl**:

```bash
# Health check
curl http://localhost:3000/api/health

# Lấy tất cả đáp án
curl http://localhost:3000/api/answers

# Lấy thống kê
curl http://localhost:3000/api/stats

# Thêm đáp án mới
curl -X POST http://localhost:3000/api/answers \
  -H "Content-Type: application/json" \
  -d '{
    "questionHash": "hash_004",
    "questionText": "Câu hỏi mới",
    "correctAnswer": "A",
    "confirmed": false,
    "source": "ai"
  }'
```

### Debug Mode

**Enable logs chi tiết**:
```bash
# Đặt env var
set DEBUG=*  # Windows
export DEBUG=*  # Mac/Linux

# Rồi chạy
node backend/server.js
```

---

## Troubleshooting

### ❌ Extension không load được

**Giải pháp**:
1. Check `manifest.json` có valid JSON?
2. Có phải folder quiz-auto-solver?
3. Thử reload: F5 hoặc icon reload

### ❌ "Cannot find module 'mssql'"

```bash
# Chạy lại
npm install

# Hoặc cài lại tất cả
rm -r node_modules
npm install
```

### ❌ SQL Server "Login failed"

```
Kiểm tra:
1. Server: localhost\SQLEXPRESS (có backslash)
2. User: sa
3. Password: đúng
4. SQL Server đang chạy? (Check Windows Services)
```

### ❌ Port 3000 bị dùng

```bash
# Tìm process dùng port
netstat -ano | findstr :3000

# Hoặc đổi port trong .env
PORT=3001
```

### ❌ API Key không hoạt động

```
1. Copy lại từ https://platform.openai.com/api-keys
2. Xóa space thừa
3. Xác nhận account có balance ($5+)
4. Nếu cũ, có thể bị revoke → tạo key mới
```

---

## Bước Tiếp Theo

### ✅ Khi mọi thứ đã cài xong:

1. **Dùng thử extension**: Truy cập website quiz, nhấn "Scan"
2. **Xem thống kê**: Tab "Kho Đáp Án" → Click "Làm Mới"
3. **Thiết lập tự động**: Tab "Cài Đặt" → Bật "Tự Động Giải"
4. **Đồng bộ với SQL Server**: Cấu hình connection

### 🚀 Advanced (Tuỳ chọn):

- Deploy backend to production (Heroku, Azure, etc)
- Cài Tesseract.js cho OCR local
- Tích hợp với hệ thống lỏng khác

---

**Cần giúp? → Check [README.md](README.md) hoặc tạo Issue trên GitHub**
