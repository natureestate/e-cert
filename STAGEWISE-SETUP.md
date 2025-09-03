# คู่มือการใช้งาน Stagewise สำหรับ E-Certificate Project

## คำสั่งใช้งานด่วน (Quick Start)

**วิธีที่เร็วที่สุด** - รันคำสั่งนี้ใน Terminal/Command Prompt:

```bash
npx stagewise@latest -b
```

**คำอธิบาย:**
- `npx` = รันแพ็กเกจ Node.js โดยไม่ต้องติดตั้งแบบ global
- `@latest` = ใช้เวอร์ชันล่าสุดของ Stagewise
- `-b` = เปิดเบราว์เซอร์อัตโนมัติเมื่อเซิร์ฟเวอร์พร้อมใช้งาน

## วิธีการเปิดใช้งาน Stagewise

### สำหรับ macOS/Linux:
```bash
./start-stagewise.sh
```

### สำหรับ Windows:
```cmd
start-stagewise.bat
```

หรือดับเบิลคลิกไฟล์ `start-stagewise.bat`

## ข้อกำหนดเบื้องต้น (Prerequisites)

1. **Node.js** - ต้องติดตั้ง Node.js เวอร์ชัน 14 ขึ้นไป
   - ดาวน์โหลดได้จาก: https://nodejs.org/

2. **npm** - มาพร้อมกับ Node.js

## การติดตั้งแบบแมนนวล

หากต้องการติดตั้ง Stagewise ด้วยตนเอง:

```bash
npm install -g stagewise
```

## การเริ่มต้นใช้งาน

1. เปิด Terminal หรือ Command Prompt
2. ไปยังโฟลเดอร์โปรเจค E-Certificate
3. รันคำสั่งตามระบบปฏิบัติการของคุณ
4. เปิดเบราว์เซอร์และไปที่ `http://localhost:3600`

## การกำหนดค่า

ไฟล์ `stagewise.json` ใช้สำหรับกำหนดค่า:

```json
{
  "appPort": 3600
}
```

- `appPort`: พอร์ตที่ใช้ในการรัน Stagewise (ค่าเริ่มต้น: 3600)

## การหยุดการทำงาน

กด `Ctrl+C` ใน Terminal/Command Prompt เพื่อหยุดการทำงานของ Stagewise

## การแก้ไขปัญหา

### ปัญหา: ไม่พบคำสั่ง node หรือ npm
**วิธีแก้:** ติดตั้ง Node.js จาก https://nodejs.org/

### ปัญหา: พอร์ต 3600 ถูกใช้งานแล้ว
**วิธีแก้:** 
1. เปลี่ยนพอร์ตในไฟล์ `stagewise.json`
2. หรือหยุดโปรแกรมที่ใช้พอร์ต 3600

### ปัญหา: Permission denied (สำหรับ macOS/Linux)
**วิธีแก้:** รันคำสั่ง `chmod +x start-stagewise.sh`

## คุณสมบัติของ Stagewise

- Preview แอปพลิเคชันในระหว่างการพัฒนา
- Hot reload เมื่อมีการเปลี่ยนแปลงโค้ด
- รองรับ React, Vue, Angular และ framework อื่นๆ
- รวดเร็วและง่ายต่อการใช้งาน

## ติดต่อและสนับสนุน

หากมีปัญหาในการใช้งาน กรุณาตรวจสอบ:
1. เวอร์ชัน Node.js: `node --version`
2. เวอร์ชัน npm: `npm --version`
3. เวอร์ชัน Stagewise: `stagewise --version`
