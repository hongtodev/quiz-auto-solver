# 🔄 Auto Git Sync - Tự Động Lưu lên GitHub

**Tự động commit & push mỗi khi bạn sửa file**

---

## 🚀 Cách Sử Dụng

### **Cách 1: Chạy Batch File (Dễ nhất)**

1. Mở folder dự án
2. **Double-click**: `auto-git-sync.bat`
3. Bạn sẽ thấy window hiển thị:
   ```
   🔄 Auto Git Sync đang chạy...
   📁 Repo: c:\Users\WinNVMe\Desktop\QZ
   ⏱️  Check interval: 5 giây
   📌 Nhấn Ctrl+C để dừng
   ```
4. **Bây giờ mọi thay đổi file sẽ tự động:**
   - ✅ Commit với timestamp
   - ✅ Push lên GitHub
   - ✅ Hiển thị status

---

### **Cách 2: Chạy PowerShell Script Trực Tiếp**

```powershell
cd c:\Users\WinNVMe\Desktop\QZ
powershell -ExecutionPolicy Bypass -File "auto-git-sync.ps1"
```

---

### **Cách 3: Setup Windows Task Scheduler (Auto-run khi khởi động)**

1. Mở **Task Scheduler** (Windows Search: `Task Scheduler`)
2. Click **"Create Basic Task"**
3. Điền:
   - **Name**: `Auto Git Sync - Quiz Solver`
   - **Description**: Auto-commit & push changes
4. **Trigger**: 
   - Chọn "At startup" hoặc "On a schedule"
5. **Action**:
   - Program: `powershell.exe`
   - Arguments: 
     ```
     -NoProfile -ExecutionPolicy Bypass -File "C:\Users\WinNVMe\Desktop\QZ\auto-git-sync.ps1"
     ```
   - Start in: `C:\Users\WinNVMe\Desktop\QZ`
6. Click **"Finish"**

✅ Script sẽ chạy tự động khi bạn login hoặc theo schedule

---

## 📋 Hoạt Động Của Script

```
File thay đổi
    ↓
FileSystemWatcher phát hiện
    ↓
Check nếu file không phải .git, node_modules, etc
    ↓
Chờ 500ms (file write hoàn tất)
    ↓
git add .
    ↓
git commit -m "Auto-commit: YYYY-MM-DD HH:MM:SS"
    ↓
git push origin main
    ↓
✅ Log: "Sync thành công!"
```

---

## ⚙️ Cấu Hình Script

Mở `auto-git-sync.ps1` và chỉnh:

```powershell
$checkInterval = 5      # Kiểm tra mỗi N giây (càng nhỏ càng hay, càng nhiều tài nguyên)
$minSyncInterval = 10   # Tối thiểu N giây giữa 2 sync (tránh spam commit)
```

Danh sách ignore (file/folder bỏ qua):

```powershell
$filter = @(
    '.git',
    'node_modules',
    '.vs',
    '.idea',
    '*.lock',
    '*.crx'
)
```

---

## 🛑 Dừng Script

- **Nhấn**: `Ctrl + C` trong PowerShell window

---

## ✨ Features

✅ **Tự động phát hiện thay đổi** - FileSystemWatcher  
✅ **Bỏ qua file không cần** - .git, node_modules, build cache  
✅ **Chờ write hoàn tất** - Tránh conflict  
✅ **Debounce** - Chỉ sync khi quá 10 giây từ sync trước  
✅ **Timestamp commits** - "Auto-commit: 2024-09-14 14:30:45"  
✅ **Console logging** - Xem được status real-time  

---

## 🔐 Lưu Ý Bảo Mật

- Script chỉ **read/write file locally**
- **SSH keys** hoặc **Git credentials** phải đã setup
- Nếu cần authentication, thêm GitHub PAT:
  ```powershell
  git config --local credential.helper store
  git push  # Lần đầu sẽ yêu cầu password/token
  ```

---

## 🐛 Troubleshooting

### "Không có gì commit"
→ Normal! Script chỉ commit khi có thay đổi

### "Permission denied"
→ Chạy PowerShell as Administrator

### "fatal: not a git repository"
→ Chắc chắn bạn đang ở folder QZ

### "authentication failed"
→ Setup GitHub token:
```powershell
git config --global credential.helper manager
git push  # Login GitHub
```

---

## 📝 Commit Examples

```
Auto-commit: 2024-09-14 14:30:45
Auto-commit: 2024-09-14 14:30:57
Auto-commit: 2024-09-14 14:31:02
```

Mỗi commit = một thay đổi file

---

**🎉 Giờ bạn có thể focus vào coding, Git sẽ tự động sync!**

