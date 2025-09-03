@echo off
rem Script สำหรับเปิดใช้งาน Stagewise บน Windows
rem ใช้สำหรับ E-Certificate Project

echo 🚀 กำลังเริ่มต้น Stagewise...

rem ตรวจสอบว่ามี Node.js หรือไม่
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js ก่อน
    pause
    exit /b 1
)

rem ตรวจสอบว่ามี npm หรือไม่
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ npm กรุณาติดตั้ง npm ก่อน
    pause
    exit /b 1
)

rem ตรวจสอบว่ามีไฟล์ stagewise.json หรือไม่
if not exist "stagewise.json" (
    echo ❌ ไม่พบไฟล์ stagewise.json
    pause
    exit /b 1
)

echo ✅ ตรวจสอบความพร้อมเรียบร้อย

rem ติดตั้ง stagewise หากยังไม่มี
echo 📦 ตรวจสอบและติดตั้ง Stagewise...
where stagewise >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔄 กำลังติดตั้ง Stagewise...
    npm install -g stagewise
    if %errorlevel% neq 0 (
        echo ❌ การติดตั้ง Stagewise ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ ติดตั้ง Stagewise เรียบร้อย
) else (
    echo ✅ พบ Stagewise แล้ว
)

rem อ่านพอร์ตจาก stagewise.json
for /f "tokens=2 delims=:, " %%a in ('findstr "appPort" stagewise.json') do set PORT=%%a
if "%PORT%"=="" set PORT=3600

echo 🌐 กำลังเริ่มต้น Stagewise บนพอร์ต %PORT%...

rem เริ่มต้น stagewise
echo 📋 คำสั่งที่แนะนำ: npx stagewise@latest -b
echo 🎯 กำลังรัน stagewise...

rem ลองใช้คำสั่งใหม่ก่อน หากไม่ได้ใช้คำสั่งเดิม
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo 🚀 ใช้ npx เพื่อรัน stagewise เวอร์ชันล่าสุด...
    npx stagewise@latest -b
) else (
    echo 🔄 ใช้ stagewise ที่ติดตั้งแล้ว...
    stagewise
)

echo 🎉 Stagewise กำลังทำงานแล้ว!
echo 📱 เปิดเบราว์เซอร์และไปที่: http://localhost:%PORT%
echo ⏹️  กด Ctrl+C เพื่อหยุดการทำงาน
pause
