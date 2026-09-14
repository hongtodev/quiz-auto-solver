# 🔐 Windows Authentication Guide

**SQL Server Connection với Tài Khoản Windows Mặc Định**

---

## ⚡ Quick Setup (3 phút)

### 1️⃣ Tạo File .env
```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=QuizAnswerVault
DB_AUTH_TYPE=windows
PORT=3000
NODE_ENV=development
```

**Không cần**: `DB_USER`, `DB_PASSWORD` ✅

### 2️⃣ Chạy Backend
```bash
cd quiz-auto-solver
node backend/server.js
```

**Output khi thành công**:
```
📊 Using Windows Authentication (NTLM)
✅ Connected to SQL Server
```

---

## 🔧 Troubleshooting

### ❌ "Login failed for user"

**Nguyên nhân**: Windows user chưa có quyền truy cập SQL Server

**Giải pháp**:

**Cách 1: Dùng SQL Server Management Studio**
```
1. Mở SSMS
2. Kết nối: localhost\SQLEXPRESS (Windows Auth)
3. Security → Logins → New Login
4. Tên: COMPUTERNAME\YourUsername
5. Server Roles: sysadmin
6. OK
```

**Cách 2: Dùng T-SQL**
```sql
-- Chạy trong SSMS as Admin
USE [master];
GO

CREATE LOGIN [COMPUTERNAME\YourUsername] FROM WINDOWS;
GO

ALTER SERVER ROLE sysadmin ADD MEMBER [COMPUTERNAME\YourUsername];
GO
```

> **Thay `COMPUTERNAME` bằng tên máy của bạn**  
> Xem: `echo %COMPUTERNAME%` trong CMD

### ❌ "Named Pipes not enabled"

**Giải pháp**: Enable Named Pipes

```
1. Mở SQL Server Configuration Manager
2. SQL Server Network Configuration
3. Chọn instance (SQLEXPRESS)
4. Chuột phải "Named Pipes" → Enable
5. Restart SQL Server (Services)
```

### ❌ "Windows domain not found"

**Giải pháp**: Thêm domain vào .env
```env
DB_DOMAIN=YOURDOMAIN
```

---

## 📚 So Sánh: Windows vs SQL Authentication

| Yếu Tố | Windows Auth | SQL Auth |
|--------|-------------|----------|
| **Bảo Mật** | ⭐⭐⭐⭐⭐ Cao | ⭐⭐⭐ Trung |
| **Setup** | ⭐⭐⭐ Trung | ⭐⭐⭐⭐⭐ Dễ |
| **Password** | Không cần | Cần quản lý |
| **Local Development** | ✅ Best | ⚠️ OK |
| **Remote Server** | ⚠️ Complex | ✅ Best |
| **Docker/Container** | ⚠️ Limited | ✅ Best |

---

## 🎯 Khuyến Nghị

### Dùng **Windows Auth** khi:
- ✅ Development trên máy local
- ✅ Corporate environment
- ✅ AD (Active Directory) có sẵn
- ✅ Muốn an toàn cao nhất

### Dùng **SQL Auth** khi:
- ✅ Production server remote
- ✅ Docker/Cloud deployment
- ✅ Cross-platform compatibility
- ✅ Cần portable configuration

---

## 🚀 Ví Dụ: Full Setup with Windows Auth

### Step 1: Cài SQL Server
```bash
# Download SQL Server Express
# https://www.microsoft.com/en-us/sql-server/sql-server-downloads
# Chọn "Express" → Cài đặt
# Lưu ý: Chọn "Windows Authentication Mode"
```

### Step 2: Tạo Database
```sql
-- Mở SSMS, kết nối Windows Auth
CREATE DATABASE QuizAnswerVault;
GO

USE QuizAnswerVault;
GO

CREATE TABLE Answers (
    id INT PRIMARY KEY IDENTITY(1,1),
    questionHash VARCHAR(255) NOT NULL UNIQUE,
    questionText NVARCHAR(MAX) NOT NULL,
    correctAnswer VARCHAR(10) NOT NULL,
    timestamp DATETIME DEFAULT GETDATE()
);
GO
```

### Step 3: Cấp Quyền
```sql
-- Cho Windows user quyền
CREATE LOGIN [COMPUTERNAME\YourName] FROM WINDOWS;
GO

CREATE USER [COMPUTERNAME\YourName] FOR LOGIN [COMPUTERNAME\YourName];
GO

ALTER ROLE db_owner ADD MEMBER [COMPUTERNAME\YourName];
GO
```

### Step 4: Configure Backend
```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=QuizAnswerVault
DB_AUTH_TYPE=windows
PORT=3000
```

### Step 5: Test
```bash
npm install
node backend/server.js

# Nếu thành công:
# 📊 Using Windows Authentication (NTLM)
# ✅ Connected to SQL Server
# 🚀 Running on http://localhost:3000
```

---

## 🔍 Verify Connection

### Test từ Command Line
```bash
# Windows Auth
sqlcmd -S localhost\SQLEXPRESS -E

# SQL Auth
sqlcmd -S localhost\SQLEXPRESS -U sa -P YourPassword
```

### Test từ Node.js
```javascript
// test-connection.js
const mssql = require('mssql');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'QuizAnswerVault',
    authentication: {
        type: 'ntlm',
        options: {}
    },
    options: {
        trustServerCertificate: true
    }
};

async function test() {
    try {
        const pool = new mssql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Connected!');
        pool.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

test();
```

---

## 🌐 Multi-User Setup

Jika beberapa users perlu akses:

```sql
-- Untuk setiap Windows user
CREATE LOGIN [COMPUTERNAME\User1] FROM WINDOWS;
CREATE USER [COMPUTERNAME\User1] FOR LOGIN [COMPUTERNAME\User1];
ALTER ROLE db_datareader ADD MEMBER [COMPUTERNAME\User1];
ALTER ROLE db_datawriter ADD MEMBER [COMPUTERNAME\User1];
GO
```

---

## 📖 Reference

- MSSQL Node.js: https://github.com/tediousjs/node-mssql
- Windows Auth Documentation: https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/

---

**Need help?** → Xem [SETUP.md](SETUP.md) phần "Troubleshooting"
