@echo off
REM Auto Ollama Setup - Windows Batch Script
REM Tự động cài mistral model và chạy ollama serve

echo.
echo ════════════════════════════════════════════════════════════
echo   Ollama Auto Setup - Windows
echo ════════════════════════════════════════════════════════════
echo.

REM Kiểm tra Ollama đã cài
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama chưa cài!
    echo.
    echo Vui lòng download & cài từ: https://ollama.ai
    echo.
    echo Sau khi cài xong, chạy lại file này.
    echo.
    pause
    exit /b 1
)

echo ✅ Ollama đã cài
echo.

REM Kiểm tra model
ollama list | find "mistral" >nul 2>&1
if errorlevel 1 (
    echo 📥 Downloading Ollama model: mistral (4GB)...
    echo    (Lần đầu sẽ mất 5-10 phút)
    echo.
    ollama pull mistral
    if errorlevel 1 (
        echo.
        echo ❌ Download mistral failed!
        pause
        exit /b 1
    )
    echo.
    echo ✅ Mistral downloaded!
) else (
    echo ✅ Mistral model đã có
)

echo.
echo ════════════════════════════════════════════════════════════
echo   🚀 Chạy Ollama Server...
echo ════════════════════════════════════════════════════════════
echo.
echo 📌 Ollama sẽ chạy trên: http://localhost:11434
echo 📌 Để dừng: Nhấn Ctrl+C
echo.
echo ✅ Browser Extension sẽ tự động kết nối
echo.

ollama serve
