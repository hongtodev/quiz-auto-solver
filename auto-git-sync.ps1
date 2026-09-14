# Auto Git Sync Script - Monitor folder & auto-commit/push changes
# Chạy: powershell -ExecutionPolicy Bypass -File "auto-git-sync.ps1"

$repoPath = "c:\Users\WinNVMe\Desktop\QZ"
$checkInterval = 5  # Kiểm tra mỗi 5 giây
$lastCommitTime = Get-Date

Write-Host "🔄 Auto Git Sync đang chạy..." -ForegroundColor Green
Write-Host "📁 Repo: $repoPath" -ForegroundColor Cyan
Write-Host "⏱️  Check interval: $checkInterval giây" -ForegroundColor Cyan
Write-Host "📌 Nhấn Ctrl+C để dừng" -ForegroundColor Yellow
Write-Host ""

# Tạo file watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Filter - bỏ qua .git folder và node_modules
$filter = @(
    '.git',
    'node_modules',
    '.vs',
    '.idea',
    '*.lock',
    '*.crx'
)

function ShouldIgnore($path) {
    foreach ($pattern in $filter) {
        if ($path -like "*$pattern*") {
            return $true
        }
    }
    return $false
}

function DoGitSync {
    try {
        Push-Location $repoPath
        
        # Kiểm tra status
        $status = git status --porcelain
        
        if ($status) {
            Write-Host ""
            Write-Host "$(Get-Date -Format 'HH:mm:ss') 📝 Thay đổi được phát hiện" -ForegroundColor Yellow
            Write-Host $status
            
            # Commit
            Write-Host "💾 Committing..." -ForegroundColor Cyan
            git add .
            $message = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $message
            
            # Push
            Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
            git push origin main
            
            Write-Host "✅ Sync thành công!" -ForegroundColor Green
            $lastCommitTime = Get-Date
        }
    }
    catch {
        Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

# Event handlers
$action = {
    $path = $Event.SourceEventArgs.FullPath
    
    if (-not (ShouldIgnore $path)) {
        # Chờ file write hoàn tất
        Start-Sleep -Milliseconds 500
        
        # Chỉ sync nếu > 10 giây từ lần cuối
        $timeSinceLastSync = (Get-Date) - $lastCommitTime
        if ($timeSinceLastSync.TotalSeconds -gt 10) {
            DoGitSync
        }
    }
}

# Đăng ký events
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action | Out-Null

# Loop để giữ script chạy
try {
    while ($true) {
        Start-Sleep -Seconds $checkInterval
    }
}
finally {
    $watcher.Dispose()
    Write-Host ""
    Write-Host "🛑 Auto Git Sync dừng" -ForegroundColor Red
}
