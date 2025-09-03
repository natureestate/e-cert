// Certificate Data Types
export interface CertificateDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  projectNameAndLocation: string;
  customerName: string;
  deliveryDate: string;
  productItems: string;
  batchNumber: string[]; // เปลี่ยนเป็น array สำหรับ multi-tag
  certificateNumber: string;
  issueDate: string;
  additionalNotes: string; // เพิ่มหมายเหตุเพิ่มเติม
}

// Warranty Terms Configuration
export interface WarrantyTerms {
  warrantyPeriodYears: number;
  productType: string;
  scope: string;
  limitations: string[];
  importantTerms: string[];
  claimProcess: string[];
  footerNote: string;
  digitalSignatureNote: string;
}

// Default warranty terms (can be customized)
export const defaultWarrantyTerms: WarrantyTerms = {
  warrantyPeriodYears: 3,
  productType: "โครงสร้างสำเร็จระบบ Fully precast concrete",
  scope: "การรับประกันครอบคลุมความเสียหายของโครงสร้างหลักที่เกิดจากความผิดพลาดในการผลิตหรือความบกพร่องของวัสดุ ภายใต้การใช้งานตามปกติ",
  limitations: [
    "ไม่ครอบคลุมความเสียหายจากการติดตั้งผิด",
    "การดัดแปลงหรือแก้ไขโครงสร้าง", 
    "ภัยธรรมชาติและเหตุสุดวิสัย",
    "การใช้งานผิดวัตถุประสงค์"
  ],
  importantTerms: [
    "การแจ้งเคลม: แจ้งภายใน 30 วันหลังพบความเสียหาย",
    "การบำรุงรักษา: ลูกค้าต้องดูแลรักษาตามคำแนะนำ",
    "การตรวจสอบ: อำนวยความสะดวกให้เข้าตรวจสอบ",
    "การซ่อมแซม: อยู่ภายใต้ดุลยพินิจของวิศวกร"
  ],
  claimProcess: [
    "แจ้งความเสียหายภายใน 30 วันหลังพบ",
    "บริษัทเข้าตรวจสอบและประเมินความเสียหาย",
    "ดำเนินการซ่อมแซมภายใต้ดุลยพินิจของวิศวกร"
  ],
  footerNote: "โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานสำหรับการเคลม",
  digitalSignatureNote: "เอกสารดิจิทัล ไม่จำเป็นต้องลงลายเซ็น"
};