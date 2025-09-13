import { PDFmeService } from '../services/pdfmeService';
import { CertificateDetails } from '../types/certificate';
import { WorkDeliveryDetails } from '../types/workDelivery';

/**
 * ฟังก์ชัน wrapper สำหรับสร้าง PDF ใบรับประกันด้วย pdfme
 * แทนที่ฟังก์ชัน exportCertificateToPDF เดิม
 */
export const exportCertificateToPDF = async (
  certificateNumber?: string,
  certificateDetails?: CertificateDetails | null,
  logoSrc?: string | null,
  warrantyTerms?: any
): Promise<void> => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!certificateDetails) {
      throw new Error('ไม่พบข้อมูลใบรับประกัน กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
    }

    console.log('🔄 เริ่มสร้าง PDF ใบรับประกันด้วย pdfme...');
    
    // สร้าง PDF ด้วย PDFmeService
    const pdfBuffer = await PDFmeService.generateCertificatePDF(
      certificateDetails,
      logoSrc,
      warrantyTerms
    );

    // ตั้งชื่อไฟล์
    const fileName = `ใบรับประกัน-${certificateNumber || certificateDetails.certificateNumber || Date.now()}.pdf`;
    
    // ดาวน์โหลด PDF
    PDFmeService.downloadPDF(pdfBuffer, fileName);
    
    console.log(`✅ ส่งออก PDF ใบรับประกันสำเร็จ: ${fileName}`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการส่งออก PDF ใบรับประกัน:', error);
    alert(`เกิดข้อผิดพลาดในการส่งออก PDF ใบรับประกัน: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * ฟังก์ชัน wrapper สำหรับสร้าง PDF ใบส่งมอบงวดงานด้วย pdfme
 * แทนที่ฟังก์ชัน exportWorkDeliveryToPDF เดิม
 */
export const exportWorkDeliveryToPDF = async (
  deliveryNumber?: string,
  deliveryDetails?: WorkDeliveryDetails | null,
  logoSrc?: string | null
): Promise<void> => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!deliveryDetails) {
      throw new Error('ไม่พบข้อมูลใบส่งมอบงวดงาน กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
    }

    console.log('🔄 เริ่มสร้าง PDF ใบส่งมอบงวดงานด้วย pdfme...');
    
    // สร้าง PDF ด้วย PDFmeService
    const pdfBuffer = await PDFmeService.generateWorkDeliveryPDF(
      deliveryDetails,
      logoSrc
    );

    // ตั้งชื่อไฟล์
    const fileName = `ใบส่งมอบงาน-${deliveryNumber || deliveryDetails.deliveryNumber || Date.now()}.pdf`;
    
    // ดาวน์โหลด PDF
    PDFmeService.downloadPDF(pdfBuffer, fileName);
    
    console.log(`✅ ส่งออก PDF ใบส่งมอบงวดงานสำเร็จ: ${fileName}`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการส่งออก PDF ใบส่งมอบงวดงาน:', error);
    alert(`เกิดข้อผิดพลาดในการส่งออก PDF ใบส่งมอบงวดงาน: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * ฟังก์ชันสำหรับเปิด PDF ใน browser window ใหม่
 */
export const openCertificatePreview = async (
  certificateDetails: CertificateDetails,
  logoSrc?: string | null,
  warrantyTerms?: any
): Promise<void> => {
  try {
    console.log('🔄 เริ่มสร้าง PDF preview ใบรับประกัน...');
    
    // สร้าง PDF ด้วย PDFmeService
    const pdfBuffer = await PDFmeService.generateCertificatePDF(
      certificateDetails,
      logoSrc,
      warrantyTerms
    );

    // เปิดใน window ใหม่
    PDFmeService.openPDFInNewWindow(pdfBuffer);
    
    console.log('✅ เปิด PDF preview ใบรับประกันสำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเปิด PDF preview ใบรับประกัน:', error);
    alert(`เกิดข้อผิดพลาดในการเปิด PDF preview: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * ฟังก์ชันสำหรับเปิด PDF ใบส่งมอบงวดงานใน browser window ใหม่
 */
export const openWorkDeliveryPreview = async (
  deliveryDetails: WorkDeliveryDetails,
  logoSrc?: string | null
): Promise<void> => {
  try {
    console.log('🔄 เริ่มสร้าง PDF preview ใบส่งมอบงวดงาน...');
    
    // สร้าง PDF ด้วย PDFmeService
    const pdfBuffer = await PDFmeService.generateWorkDeliveryPDF(
      deliveryDetails,
      logoSrc
    );

    // เปิดใน window ใหม่
    PDFmeService.openPDFInNewWindow(pdfBuffer);
    
    console.log('✅ เปิด PDF preview ใบส่งมอบงวดงานสำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเปิด PDF preview ใบส่งมอบงวดงาน:', error);
    alert(`เกิดข้อผิดพลาดในการเปิด PDF preview: ${(error as Error).message}`);
    throw error;
  }
};
