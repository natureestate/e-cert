import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';

/**
 * ส่งออกใบรับประกันเป็น PDF
 * @param certificateNumber หมายเลขใบรับประกัน
 */
export const exportCertificateToPDF = async (certificateNumber?: string): Promise<void> => {
  const certificateElement = document.getElementById('certificate');
  if (!certificateElement) {
    console.error("Certificate element not found!");
    throw new Error("ไม่พบองค์ประกอบใบรับประกัน");
  }

  try {
    // สร้าง canvas จาก HTML element
    const canvas = await (html2canvas as any).default(certificateElement, {
      scale: 2, // ปรับปรุงความละเอียด
      useCORS: true,
      logging: false,
    });

    // สร้าง PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // คำนวณขนาดรูปภาพในไฟล์ PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // เพิ่มรูปภาพลงใน PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // ตั้งชื่อไฟล์และบันทึก
    const fileName = `Warranty-${certificateNumber || Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
  }
};
