const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Initialize Firebase (ใช้ config จาก environment ปัจจุบัน)
const app = initializeApp({
  // Config จะถูกโหลดจาก environment
});
const db = getFirestore(app);

async function createProjects() {
  const customerId = '3vbYjRC6L3OMbSq2XKDc';
  const customerName = 'คุณทดสอบ เพิ่มข้อมูล';
  
  console.log('🔧 Creating projects for customer:', customerName);
  
  // สร้างโครงการที่ 1
  const project1 = await addDoc(collection(db, 'projects'), {
    name: 'โครงการทดสอบ บ้านเดี่ยว',
    location: '789 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100',
    customerId: customerId,
    customerName: customerName,
    description: 'โครงการทดสอบระบบ',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // สร้างโครงการที่ 2
  const project2 = await addDoc(collection(db, 'projects'), {
    name: 'โครงการทดสอบ บ้านแฝด',
    location: '321 ถนนทดสอบ2 แขวงทดสอบ2 เขตทดสอบ2 กรุงเทพฯ 10200',
    customerId: customerId,
    customerName: customerName,
    description: 'โครงการทดสอบระบบ แบบที่ 2',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✅ Projects created:', project1.id, project2.id);
}

createProjects().catch(console.error);
