import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';

/**
 * ส่งออกใบรับประกันเป็น PDF ขนาด A4 ที่จัดรูปแบบแล้ว
 * @param certificateNumber หมายเลขใบรับประกัน
 */
export const exportCertificateToPDF = async (certificateNumber?: string): Promise<void> => {
  // รอสักครู่เพื่อให้ DOM update ก่อน
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // ลองหา element หลายวิธี
  let certificateElement = document.getElementById('certificate');
  
  if (!certificateElement) {
    // ลองหาด้วย className
    certificateElement = document.querySelector('.certificate-wrapper') as HTMLElement;
  }
  
  if (!certificateElement) {
    console.error("Certificate element not found!");
    console.log("Available elements with 'certificate' in ID:", document.querySelectorAll('[id*="certificate"]'));
    console.log("Available elements with 'cert' class:", document.querySelectorAll('[class*="cert"]'));
    console.log("All divs:", document.querySelectorAll('div'));
    throw new Error("ไม่พบองค์ประกอบใบรับประกัน กรุณาตรวจสอบว่ามีการแสดงใบรับประกันในหน้าจอ");
  }

  // ตรวจสอบว่า element มีเนื้อหาหรือไม่
  if (!certificateElement.textContent || certificateElement.textContent.trim().length === 0) {
    console.error("Certificate element is empty!");
    console.log("Element HTML:", certificateElement.innerHTML);
    throw new Error("ใบรับประกันยังไม่มีข้อมูล กรุณากรอกข้อมูลให้ครบถ้วนก่อน");
  }

  console.log("✅ พบ certificate element:", certificateElement);
  console.log("📏 ขนาด element:", {
    width: certificateElement.offsetWidth,
    height: certificateElement.offsetHeight,
    textLength: certificateElement.textContent.length
  });

  try {
    // เตรียม element สำหรับ PDF โดยเพิ่ม class พิเศษ
    certificateElement.classList.add('pdf-export-mode');
    
    // รอให้การเปลี่ยนแปลง style มีผล
    await new Promise(resolve => setTimeout(resolve, 100));

    // สร้าง canvas จาก HTML element ด้วยการตั้งค่าที่เหมาะสมสำหรับ A4
    console.log("🎨 เริ่มสร้าง canvas...");
    const canvas = await (html2canvas as any).default(certificateElement, {
      scale: 2, // ลดขนาดให้เหมาะสม
      useCORS: true,
      logging: true, // เปิด logging เพื่อ debug
      backgroundColor: '#ffffff',
      foreignObjectRendering: false, // ปิดเพื่อป้องกันปัญหา
      allowTaint: true, // อนุญาตให้ใช้รูปภาพจากแหล่งอื่น
      removeContainer: false,
      imageTimeout: 0,
      onclone: (clonedDoc: Document) => {
        // ปรับแต่ง cloned document
        const clonedElement = clonedDoc.getElementById('certificate') || clonedDoc.querySelector('.certificate-wrapper');
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.position = 'static';
        }
      }
    });
    
    console.log("✅ สร้าง canvas เสร็จ:", {
      width: canvas.width,
      height: canvas.height
    });

    // ลบ class พิเศษหลังจากสร้าง canvas แล้ว
    certificateElement.classList.remove('pdf-export-mode');

    // สร้าง PDF ขนาด A4
    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // ขนาด A4 ในหน่วย mm
    const a4Width = 210;
    const a4Height = 297;
    
    // เพิ่ม margin เล็กน้อยเพื่อความปลอดภัย
    const margin = 5;
    const contentWidth = a4Width - (margin * 2);
    const contentHeight = a4Height - (margin * 2);

    // สร้างรูปภาพจาก canvas
    const imgData = canvas.toDataURL('image/png', 1.0);
    console.log("🖼️ สร้างรูปภาพเสร็จ");
    
    if (!imgData || imgData === 'data:,') {
      throw new Error("ไม่สามารถสร้างรูปภาพจาก canvas ได้");
    }

    // คำนวณขนาดที่เหมาะสมโดยรักษาอัตราส่วน
    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = contentWidth / contentHeight;

    let finalWidth, finalHeight;
    
    if (canvasRatio > pageRatio) {
      // รูปภาพกว้างกว่า - ใช้ความกว้างเต็ม
      finalWidth = contentWidth;
      finalHeight = contentWidth / canvasRatio;
    } else {
      // รูปภาพสูงกว่า - ใช้ความสูงเต็ม
      finalHeight = contentHeight;
      finalWidth = contentHeight * canvasRatio;
    }

    // คำนวณตำแหน่งให้อยู่กึ่งกลาง
    const xPos = margin + (contentWidth - finalWidth) / 2;
    const yPos = margin + (contentHeight - finalHeight) / 2;

    console.log("📐 ขนาดและตำแหน่งใน PDF:", {
      finalWidth,
      finalHeight,
      xPos,
      yPos
    });

    // เพิ่มรูปภาพลงใน PDF
    pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight, '', 'MEDIUM');
    
    // ตั้งชื่อไฟล์และบันทึก
    const fileName = `ใบรับประกัน-${certificateNumber || Date.now()}.pdf`;
    pdf.save(fileName);
    
    console.log(`✅ ส่งออก PDF สำเร็จ: ${fileName}`);
  } catch (error) {
    // ลบ class พิเศษในกรณีที่เกิดข้อผิดพลาด
    certificateElement.classList.remove('pdf-export-mode');
    console.error("Error generating PDF:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: " + (error as Error).message);
  }
};

/**
 * ส่งออกใบส่งมอบงวดงานเป็น PDF ขนาด A4 ที่จัดรูปแบบแล้ว
 * @param deliveryNumber หมายเลขใบส่งมอบ
 */
export const exportWorkDeliveryToPDF = async (deliveryNumber?: string): Promise<void> => {
  // รอสักครู่เพื่อให้ DOM update ก่อน
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // หา element ใบส่งมอบงวดงาน
  let deliveryElement = document.getElementById('work-delivery-preview');
  
  if (!deliveryElement) {
    console.error("Work delivery element not found!");
    console.log("Available elements with 'work-delivery' in ID:", document.querySelectorAll('[id*="work-delivery"]'));
    throw new Error("ไม่พบองค์ประกอบใบส่งมอบงวดงาน กรุณาตรวจสอบว่ามีการแสดงใบส่งมอบในหน้าจอ");
  }

  // ตรวจสอบว่า element มีเนื้อหาหรือไม่
  if (!deliveryElement.textContent || deliveryElement.textContent.trim().length === 0) {
    console.error("Work delivery element is empty!");
    console.log("Element HTML:", deliveryElement.innerHTML);
    throw new Error("ใบส่งมอบงวดงานยังไม่มีข้อมูล กรุณากรอกข้อมูลให้ครบถ้วนก่อน");
  }

  console.log("✅ พบ work delivery element:", deliveryElement);
  console.log("📏 ขนาด element:", {
    width: deliveryElement.offsetWidth,
    height: deliveryElement.offsetHeight,
    textLength: deliveryElement.textContent.length
  });

  try {
    // เตรียม element สำหรับ PDF โดยเพิ่ม class พิเศษ
    deliveryElement.classList.add('pdf-export-mode');
    
    // รอให้การเปลี่ยนแปลง style มีผล
    await new Promise(resolve => setTimeout(resolve, 100));

    // สร้าง canvas จาก HTML element ด้วยการตั้งค่าที่เหมาะสมสำหรับ A4
    console.log("🎨 เริ่มสร้าง canvas...");
    const canvas = await (html2canvas as any).default(deliveryElement, {
      scale: 2, // ลดขนาดให้เหมาะสม
      useCORS: true,
      logging: true, // เปิด logging เพื่อ debug
      backgroundColor: '#ffffff',
      foreignObjectRendering: false, // ปิดเพื่อป้องกันปัญหา
      allowTaint: true, // อนุญาตให้ใช้รูปภาพจากแหล่งอื่น
      removeContainer: false,
      imageTimeout: 0,
      onclone: (clonedDoc: Document) => {
        // ปรับแต่ง cloned document
        const clonedElement = clonedDoc.getElementById('work-delivery-preview');
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.position = 'static';
        }
      }
    });
    
    console.log("✅ สร้าง canvas เสร็จ:", {
      width: canvas.width,
      height: canvas.height
    });

    // ลบ class พิเศษหลังจากสร้าง canvas แล้ว
    deliveryElement.classList.remove('pdf-export-mode');

    // สร้าง PDF ขนาด A4
    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // ขนาด A4 ในหน่วย mm
    const a4Width = 210;
    const a4Height = 297;
    
    // เพิ่ม margin เล็กน้อยเพื่อความปลอดภัย
    const margin = 5;
    const contentWidth = a4Width - (margin * 2);
    const contentHeight = a4Height - (margin * 2);

    // สร้างรูปภาพจาก canvas
    const imgData = canvas.toDataURL('image/png', 1.0);
    console.log("🖼️ สร้างรูปภาพเสร็จ");
    
    if (!imgData || imgData === 'data:,') {
      throw new Error("ไม่สามารถสร้างรูปภาพจาก canvas ได้");
    }

    // คำนวณขนาดที่เหมาะสมโดยรักษาอัตราส่วน
    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = contentWidth / contentHeight;

    let finalWidth, finalHeight;
    
    if (canvasRatio > pageRatio) {
      // รูปภาพกว้างกว่า - ใช้ความกว้างเต็ม
      finalWidth = contentWidth;
      finalHeight = contentWidth / canvasRatio;
    } else {
      // รูปภาพสูงกว่า - ใช้ความสูงเต็ม
      finalHeight = contentHeight;
      finalWidth = contentHeight * canvasRatio;
    }

    // คำนวณตำแหน่งให้อยู่กึ่งกลาง
    const xPos = margin + (contentWidth - finalWidth) / 2;
    const yPos = margin + (contentHeight - finalHeight) / 2;

    console.log("📐 ขนาดและตำแหน่งใน PDF:", {
      finalWidth,
      finalHeight,
      xPos,
      yPos
    });

    // เพิ่มรูปภาพลงใน PDF
    pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight, '', 'MEDIUM');
    
    // ตั้งชื่อไฟล์และบันทึก
    const fileName = `ใบส่งมอบงวดงาน-${deliveryNumber || Date.now()}.pdf`;
    pdf.save(fileName);
    
    console.log(`✅ ส่งออก PDF สำเร็จ: ${fileName}`);
  } catch (error) {
    // ลบ class พิเศษในกรณีที่เกิดข้อผิดพลาด
    deliveryElement.classList.remove('pdf-export-mode');
    console.error("Error generating PDF:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: " + (error as Error).message);
  }
};
