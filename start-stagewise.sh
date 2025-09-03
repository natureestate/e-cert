#!/bin/bash

# Script สำหรับเปิดใช้งาน Stagewise
# ใช้สำหรับ E-Certificate Project

echo "🚀 กำลังเริ่มต้น Stagewise..."

# ตรวจสอบว่ามี Node.js หรือไม่
if ! command -v node &> /dev/null; then
    echo "❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js ก่อน"
    exit 1
fi

# ตรวจสอบว่ามี npm หรือไม่
if ! command -v npm &> /dev/null; then
    echo "❌ ไม่พบ npm กรุณาติดตั้ง npm ก่อน"
    exit 1
fi

# ตรวจสอบว่ามีไฟล์ stagewise.json หรือไม่
if [ ! -f "stagewise.json" ]; then
    echo "❌ ไม่พบไฟล์ stagewise.json"
    exit 1
fi

echo "✅ ตรวจสอบความพร้อมเรียบร้อย"

# ติดตั้ง stagewise หากยังไม่มี
echo "📦 ตรวจสอบและติดตั้ง Stagewise..."
if ! command -v stagewise &> /dev/null; then
    echo "🔄 กำลังติดตั้ง Stagewise..."
    npm install -g stagewise
    if [ $? -ne 0 ]; then
        echo "❌ การติดตั้ง Stagewise ล้มเหลว"
        exit 1
    fi
    echo "✅ ติดตั้ง Stagewise เรียบร้อย"
else
    echo "✅ พบ Stagewise แล้ว"
fi

# อ่านพอร์ตจาก stagewise.json
PORT=$(cat stagewise.json | grep -o '"appPort"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*')
if [ -z "$PORT" ]; then
    PORT=3600
fi

echo "🌐 กำลังเริ่มต้น Stagewise บนพอร์ต $PORT..."

# เริ่มต้น stagewise
echo "📋 คำสั่งที่แนะนำ: npx stagewise@latest -b"
echo "🎯 กำลังรัน stagewise..."

# ลองใช้คำสั่งใหม่ก่อน หากไม่ได้ใช้คำสั่งเดิม
if command -v npx &> /dev/null; then
    echo "🚀 ใช้ npx เพื่อรัน stagewise เวอร์ชันล่าสุด..."
    npx stagewise@latest -b
else
    echo "🔄 ใช้ stagewise ที่ติดตั้งแล้ว..."
    stagewise
fi

echo "🎉 Stagewise กำลังทำงานแล้ว!"
echo "📱 เปิดเบราว์เซอร์และไปที่: http://localhost:$PORT"
echo "⏹️  กด Ctrl+C เพื่อหยุดการทำงาน"
