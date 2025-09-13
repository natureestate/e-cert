import { Template, BLANK_PDF, Font } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { text, barcodes, image } from '@pdfme/schemas';
import { CertificateDetails } from '../types/certificate';
import { WorkDeliveryDetails } from '../types/workDelivery';

/**
 * เซอร์วิสสำหรับจัดการ PDF ด้วย pdfme
 * แทนที่ระบบ html2canvas + jspdf เดิม
 */
export class PDFmeService {
  
  /**
   * สร้างฟอนต์ไทยสำหรับ pdfme
   * ใช้ฟอนต์ที่รองรับ Unicode และภาษาไทย
   */
  static getThaiFont(): Font {
    return {
      'NotoSans': {
        // ใช้ base64 encoded font หรือ URL ของฟอนต์ที่รองรับไทย
        data: '',
        fallback: true,
        subset: false, // อนุญาตให้ใช้ทุกตัวอักษร
      },
    };
  }
  
  /**
   * สร้าง template สำหรับใบรับประกัน
   */
  static createCertificateTemplate(): Template {
    return {
      basePdf: { width: 210, height: 297, padding: [10, 10, 10, 10] },
      schemas: [
        [
          // Header - โลโก้และชื่อเอกสาร
          {
            name: 'company_logo',
            type: 'image',
            position: { x: 85, y: 10 },
            width: 40,
            height: 25,
          },
          {
            name: 'document_title',
            type: 'text',
            position: { x: 20, y: 40 },
            width: 170,
            height: 8,
            fontSize: 18,
            fontColor: '#1e40af',
            alignment: 'center',
          },
          {
            name: 'certificate_number',
            type: 'text',
            position: { x: 20, y: 50 },
            width: 170,
            height: 6,
            fontSize: 12,
            alignment: 'center',
          },
          
          // ข้อมูลบริษัท
          {
            name: 'company_name',
            type: 'text',
            position: { x: 20, y: 65 },
            width: 170,
            height: 8,
            fontSize: 14,
            fontColor: '#1e40af',
            alignment: 'center',
          },
          {
            name: 'company_address',
            type: 'text',
            position: { x: 20, y: 75 },
            width: 170,
            height: 6,
            fontSize: 10,
            alignment: 'center',
          },
          {
            name: 'company_contact',
            type: 'text',
            position: { x: 20, y: 82 },
            width: 170,
            height: 6,
            fontSize: 10,
            alignment: 'center',
          },
          
          // ข้อมูลโครงการ (ซ้าย)
          {
            name: 'project_section_title',
            type: 'text',
            position: { x: 20, y: 95 },
            width: 80,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'project_name',
            type: 'text',
            position: { x: 20, y: 105 },
            width: 80,
            height: 8,
            fontSize: 10,
          },
          {
            name: 'customer_name',
            type: 'text',
            position: { x: 20, y: 115 },
            width: 80,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'buyer_name',
            type: 'text',
            position: { x: 20, y: 125 },
            width: 80,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'delivery_date',
            type: 'text',
            position: { x: 20, y: 135 },
            width: 80,
            height: 6,
            fontSize: 10,
          },
          
          // รายละเอียดสินค้า (ขวา)
          {
            name: 'product_section_title',
            type: 'text',
            position: { x: 110, y: 95 },
            width: 80,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'product_type',
            type: 'text',
            position: { x: 110, y: 105 },
            width: 80,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'product_items',
            type: 'text',
            position: { x: 110, y: 115 },
            width: 80,
            height: 8,
            fontSize: 10,
          },
          {
            name: 'batch_numbers',
            type: 'text',
            position: { x: 110, y: 125 },
            width: 80,
            height: 8,
            fontSize: 10,
          },
          
          // รายละเอียดการรับประกัน
          {
            name: 'warranty_section_title',
            type: 'text',
            position: { x: 20, y: 150 },
            width: 170,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'warranty_intro',
            type: 'text',
            position: { x: 20, y: 160 },
            width: 170,
            height: 12,
            fontSize: 10,
          },
          
          // ขอบเขตการรับประกัน (ซ้าย)
          {
            name: 'warranty_scope_title',
            type: 'text',
            position: { x: 20, y: 175 },
            width: 80,
            height: 6,
            fontSize: 11,
          },
          {
            name: 'warranty_scope',
            type: 'text',
            position: { x: 20, y: 185 },
            width: 80,
            height: 20,
            fontSize: 9,
          },
          
          // ข้อจำกัดการรับประกัน (ขวา)
          {
            name: 'warranty_limitations_title',
            type: 'text',
            position: { x: 110, y: 175 },
            width: 80,
            height: 6,
            fontSize: 11,
          },
          {
            name: 'warranty_limitations',
            type: 'text',
            position: { x: 110, y: 185 },
            width: 80,
            height: 20,
            fontSize: 9,
          },
          
          // ข้อกำหนดสำคัญ
          {
            name: 'important_terms_title',
            type: 'text',
            position: { x: 20, y: 210 },
            width: 170,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'important_terms',
            type: 'text',
            position: { x: 20, y: 220 },
            width: 170,
            height: 15,
            fontSize: 9,
          },
          
          // Footer
          {
            name: 'footer_note',
            type: 'text',
            position: { x: 20, y: 250 },
            width: 100,
            height: 8,
            fontSize: 9,
          },
          {
            name: 'additional_notes',
            type: 'text',
            position: { x: 20, y: 260 },
            width: 100,
            height: 8,
            fontSize: 9,
          },
          {
            name: 'digital_signature_note',
            type: 'text',
            position: { x: 20, y: 270 },
            width: 100,
            height: 6,
            fontSize: 9,
          },
          {
            name: 'issue_date_label',
            type: 'text',
            position: { x: 130, y: 250 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'issue_date',
            type: 'text',
            position: { x: 130, y: 260 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
        ],
      ],
    };
  }

  /**
   * สร้าง template สำหรับใบส่งมอบงวดงาน
   */
  static createWorkDeliveryTemplate(): Template {
    return {
      basePdf: { width: 210, height: 297, padding: [10, 10, 10, 10] },
      schemas: [
        [
          // Header - โลโก้และชื่อเอกสาร
          {
            name: 'company_logo',
            type: 'image',
            position: { x: 85, y: 10 },
            width: 40,
            height: 25,
          },
          {
            name: 'document_title',
            type: 'text',
            position: { x: 20, y: 40 },
            width: 170,
            height: 8,
            fontSize: 18,
            fontColor: '#1e40af',
            alignment: 'center',
          },
          {
            name: 'delivery_number',
            type: 'text',
            position: { x: 20, y: 50 },
            width: 170,
            height: 6,
            fontSize: 12,
            alignment: 'center',
          },
          
          // ข้อมูลบริษัท
          {
            name: 'company_name',
            type: 'text',
            position: { x: 20, y: 65 },
            width: 170,
            height: 8,
            fontSize: 14,
            fontColor: '#1e40af',
            alignment: 'center',
          },
          {
            name: 'company_address',
            type: 'text',
            position: { x: 20, y: 75 },
            width: 170,
            height: 6,
            fontSize: 10,
            alignment: 'center',
          },
          {
            name: 'company_contact',
            type: 'text',
            position: { x: 20, y: 82 },
            width: 170,
            height: 6,
            fontSize: 10,
            alignment: 'center',
          },
          
          // ข้อมูลโครงการ
          {
            name: 'project_section_title',
            type: 'text',
            position: { x: 20, y: 95 },
            width: 170,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'project_name',
            type: 'text',
            position: { x: 20, y: 105 },
            width: 170,
            height: 8,
            fontSize: 10,
          },
          {
            name: 'customer_info',
            type: 'text',
            position: { x: 20, y: 115 },
            width: 170,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'work_type',
            type: 'text',
            position: { x: 20, y: 125 },
            width: 170,
            height: 6,
            fontSize: 10,
          },
          
          // รายละเอียดงวดงาน
          {
            name: 'phases_section_title',
            type: 'text',
            position: { x: 20, y: 140 },
            width: 170,
            height: 6,
            fontSize: 12,
            fontColor: '#1e40af',
          },
          {
            name: 'current_phase',
            type: 'text',
            position: { x: 20, y: 150 },
            width: 170,
            height: 6,
            fontSize: 11,
          },
          {
            name: 'phases_list',
            type: 'text',
            position: { x: 20, y: 160 },
            width: 170,
            height: 80,
            fontSize: 9,
          },
          
          // Footer
          {
            name: 'additional_notes',
            type: 'text',
            position: { x: 20, y: 250 },
            width: 100,
            height: 12,
            fontSize: 9,
          },
          {
            name: 'issue_date_label',
            type: 'text',
            position: { x: 130, y: 250 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'issue_date',
            type: 'text',
            position: { x: 130, y: 260 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'delivery_date_label',
            type: 'text',
            position: { x: 130, y: 270 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
          {
            name: 'delivery_date',
            type: 'text',
            position: { x: 130, y: 280 },
            width: 60,
            height: 6,
            fontSize: 10,
          },
        ],
      ],
    };
  }

  /**
   * สร้าง input data สำหรับใบรับประกัน
   */
  static createCertificateInputData(
    certificateDetails: CertificateDetails,
    logoSrc?: string | null,
    warrantyTerms?: any
  ) {
    return {
      company_logo: logoSrc || '',
      document_title: 'ใบรับประกันสินค้า',
      certificate_number: `เลขที่: ${certificateDetails.certificateNumber}`,
      
      // ข้อมูลบริษัท
      company_name: certificateDetails.companyName,
      company_address: `ที่อยู่: ${certificateDetails.companyAddress}`,
      company_contact: `โทรศัพท์: ${certificateDetails.companyPhone} | เว็บไซต์: ${certificateDetails.companyWebsite}`,
      
      // ข้อมูลโครงการ
      project_section_title: 'ข้อมูลโครงการ',
      project_name: `ชื่อโครงการ: ${certificateDetails.projectNameAndLocation}`,
      customer_name: `ชื่อลูกค้า: ${certificateDetails.customerName}`,
      buyer_name: certificateDetails.buyer ? `ผู้ซื้อสินค้า: ${certificateDetails.buyer}` : '',
      delivery_date: `วันที่ส่งมอบ: ${certificateDetails.deliveryDate}`,
      
      // รายละเอียดสินค้า
      product_section_title: 'รายละเอียดสินค้า',
      product_type: `ประเภทสินค้า: ${warrantyTerms?.productType || 'สินค้าก่อสร้าง'}`,
      product_items: `รายการสินค้า: ${certificateDetails.productItems}`,
      batch_numbers: `Lot การผลิต: ${
        Array.isArray(certificateDetails.batchNumber) 
          ? certificateDetails.batchNumber.join(', ')
          : certificateDetails.batchNumber
      }`,
      
      // รายละเอียดการรับประกัน
      warranty_section_title: 'รายละเอียดการรับประกัน',
      warranty_intro: `บริษัท ${certificateDetails.companyName} ขอรับประกัน${warrantyTerms?.productType || 'สินค้าก่อสร้าง'} ที่ได้ส่งมอบให้กับโครงการนี้เป็นระยะเวลา ${warrantyTerms?.warrantyPeriodYears || 3} ปี นับจากวันที่ส่งมอบ`,
      
      // ขอบเขตและข้อจำกัด
      warranty_scope_title: 'ขอบเขตการรับประกัน:',
      warranty_scope: warrantyTerms?.scope || 'ครอบคลุมข้อบกพร่องจากการผลิตและการติดตั้ง รวมถึงวัสดุที่มีคุณภาพไม่เป็นไปตามมาตรฐาน',
      warranty_limitations_title: 'ข้อจำกัดการรับประกัน:',
      warranty_limitations: warrantyTerms?.limitations ? 
        `ไม่ครอบคลุม: ${warrantyTerms.limitations.join(', ')}` : 
        'ไม่ครอบคลุม: ความเสียหายจากการใช้งานผิดวิธี, อุบัติเหตุ, ภาวะธรรมชาติ',
      
      // ข้อกำหนดสำคัญ
      important_terms_title: 'ข้อกำหนดสำคัญ',
      important_terms: warrantyTerms?.importantTerms ? 
        warrantyTerms.importantTerms.map((term: string) => `• ${term}`).join('\n') :
        '• การรับประกันจะสิ้นสุดลงหากมีการดัดแปลงหรือซ่อมแซมโดยไม่ได้รับอนุญาต\n• ต้องแจ้งปัญหาภายใน 30 วันหลังพบข้อบกพร่อง\n• การรับประกันเฉพาะชิ้นส่วนที่มีปัญหาเท่านั้น',
      
      // Footer
      footer_note: `หมายเหตุ: ${warrantyTerms?.footerNote || 'ใบรับประกันนี้มีผลบังคับใช้ภายใต้เงื่อนไขที่ระบุไว้เท่านั้น'}`,
      additional_notes: certificateDetails.additionalNotes ? 
        `หมายเหตุเพิ่มเติม: ${certificateDetails.additionalNotes}` : '',
      digital_signature_note: warrantyTerms?.digitalSignatureNote || 
        'เอกสารนี้ออกโดยระบบอิเล็กทรอนิกส์และไม่จำเป็นต้องมีลายเซ็น',
      issue_date_label: 'วันที่ออกเอกสาร:',
      issue_date: certificateDetails.issueDate,
    };
  }

  /**
   * สร้าง input data สำหรับใบส่งมอบงวดงาน
   */
  static createWorkDeliveryInputData(
    deliveryDetails: WorkDeliveryDetails,
    logoSrc?: string | null
  ) {
    // จัดรูปแบบรายการงวดงาน
    const phasesText = deliveryDetails.phases.map((phase, index) => {
      const status = phase.isCompleted ? '✓ เสร็จสิ้น' : '○ รอดำเนินการ';
      const notes = phase.notes ? ` - ${phase.notes}` : '';
      const completedDate = phase.completedDate ? 
        ` (${new Date(phase.completedDate).toLocaleDateString('th-TH')})` : '';
      
      return `${index + 1}. ${phase.name} [${status}]${completedDate}${notes}`;
    }).join('\n');

    const workTypeText = deliveryDetails.workType === 'house-construction' ? 
      'งานรับสร้างบ้าน' : 'งาน Precast Concrete';

    return {
      company_logo: logoSrc || '',
      document_title: 'ใบส่งมอบงวดงาน',
      delivery_number: `เลขที่: ${deliveryDetails.deliveryNumber}`,
      
      // ข้อมูลบริษัท
      company_name: deliveryDetails.companyName,
      company_address: `ที่อยู่: ${deliveryDetails.companyAddress}`,
      company_contact: `โทรศัพท์: ${deliveryDetails.companyPhone} | เว็บไซต์: ${deliveryDetails.companyWebsite}`,
      
      // ข้อมูลโครงการ
      project_section_title: 'ข้อมูลโครงการ',
      project_name: `ชื่อโครงการ: ${deliveryDetails.projectNameAndLocation}`,
      customer_info: `ลูกค้า: ${deliveryDetails.customerName}${deliveryDetails.buyer ? ` | ผู้ซื้อ: ${deliveryDetails.buyer}` : ''}`,
      work_type: `ประเภทงาน: ${workTypeText}`,
      
      // รายละเอียดงวดงาน
      phases_section_title: 'รายละเอียดงวดงาน',
      current_phase: `งวดปัจจุบัน: งวดที่ ${deliveryDetails.currentPhase}`,
      phases_list: phasesText,
      
      // Footer
      additional_notes: deliveryDetails.additionalNotes ? 
        `หมายเหตุ: ${deliveryDetails.additionalNotes}` : '',
      issue_date_label: 'วันที่ออกเอกสาร:',
      issue_date: deliveryDetails.issueDate,
      delivery_date_label: 'วันที่ส่งมอบ:',
      delivery_date: deliveryDetails.deliveryDate,
    };
  }

  /**
   * สร้าง PDF ใบรับประกัน
   */
  static async generateCertificatePDF(
    certificateDetails: CertificateDetails,
    logoSrc?: string | null,
    warrantyTerms?: any
  ): Promise<Uint8Array> {
    try {
      console.log('🔄 กำลังสร้าง PDF ใบรับประกันด้วย pdfme...');
      
      const template = this.createCertificateTemplate();
      const inputData = this.createCertificateInputData(certificateDetails, logoSrc, warrantyTerms);
      const inputs = [inputData];

      // สร้าง PDF ด้วย pdfme พร้อมฟอนต์ไทย
      const pdf = await generate({
        template,
        inputs,
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode,
        },
      });

      console.log('✅ สร้าง PDF ใบรับประกันสำเร็จด้วย pdfme');
      return pdf;
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้าง PDF ใบรับประกัน:', error);
      throw new Error(`ไม่สามารถสร้าง PDF ใบรับประกันได้: ${(error as Error).message}`);
    }
  }

  /**
   * สร้าง PDF ใบส่งมอบงวดงาน
   */
  static async generateWorkDeliveryPDF(
    deliveryDetails: WorkDeliveryDetails,
    logoSrc?: string | null
  ): Promise<Uint8Array> {
    try {
      console.log('🔄 กำลังสร้าง PDF ใบส่งมอบงวดงานด้วย pdfme...');
      
      const template = this.createWorkDeliveryTemplate();
      const inputData = this.createWorkDeliveryInputData(deliveryDetails, logoSrc);
      const inputs = [inputData];

      // สร้าง PDF ด้วย pdfme พร้อมฟอนต์ไทย
      const pdf = await generate({
        template,
        inputs,
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode,
        },
      });

      console.log('✅ สร้าง PDF ใบส่งมอบงวดงานสำเร็จด้วย pdfme');
      return pdf;
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้าง PDF ใบส่งมอบงวดงาน:', error);
      throw new Error(`ไม่สามารถสร้าง PDF ใบส่งมอบงวดงานได้: ${(error as Error).message}`);
    }
  }

  /**
   * ดาวน์โหลด PDF โดยสร้าง blob และเปิดใน browser
   */
  static downloadPDF(pdfBuffer: Uint8Array, fileName: string): void {
    try {
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // สร้าง link element ชั่วคราวเพื่อดาวน์โหลด
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // ทำความสะอาด URL object
      URL.revokeObjectURL(url);
      
      console.log(`✅ ดาวน์โหลด PDF สำเร็จ: ${fileName}`);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการดาวน์โหลด PDF:', error);
      throw new Error(`ไม่สามารถดาวน์โหลด PDF ได้: ${(error as Error).message}`);
    }
  }

  /**
   * เปิด PDF ใน browser window ใหม่
   */
  static openPDFInNewWindow(pdfBuffer: Uint8Array): void {
    try {
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      console.log('✅ เปิด PDF ใน window ใหม่สำเร็จ');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเปิด PDF:', error);
      throw new Error(`ไม่สามารถเปิด PDF ได้: ${(error as Error).message}`);
    }
  }
}
