// ประเภทงาน Work Types
export type WorkType = 'house-construction' | 'precast-concrete';

// งวดงานสำหรับงานรับสร้างบ้าน
export interface HouseConstructionPhase {
  phaseNumber: number;
  name: string;
  description: string;
  isCompleted: boolean;
  completedDate?: Date;
  notes?: string;
}

// งวดงานเริ่มต้นสำหรับงานรับสร้างบ้าน
export const defaultHouseConstructionPhases: HouseConstructionPhase[] = [
  { phaseNumber: 1, name: 'เซ็นสัญญา', description: 'เซ็นสัญญาและทำข้อตกลง', isCompleted: false },
  { phaseNumber: 2, name: 'ฐานราก,ตอม่อ', description: 'งานทำฐานรากและงานตอม่อ', isCompleted: false },
  { phaseNumber: 3, name: 'คานคอดิน', description: 'งานสร้างคานคอดิน', isCompleted: false },
  { phaseNumber: 4, name: 'วางแผ่นพื้น,งานพื้นชั้น 1,วางระบบประปา', description: 'วางแผ่นพื้น งานพื้นชั้น 1 และวางระบบประปา', isCompleted: false },
  { phaseNumber: 5, name: 'ถาดห้องน้ำ,ผนังบ้าน', description: 'งานถาดห้องน้ำและผนังบ้าน', isCompleted: false },
  { phaseNumber: 6, name: 'งานโครงหลังคา,ยิงแป,ยิงไม้เชิงชาย', description: 'งานโครงหลังคา ยิงแป และยิงไม้เชิงชาย', isCompleted: false },
  { phaseNumber: 7, name: 'งานมุงหลังคา,ติดแผ่นสะท้อนความร้อน', description: 'งานมุงหลังคาและติดแผ่นสะท้อนความร้อน', isCompleted: false },
  { phaseNumber: 8, name: 'สีรองพื้น,วางระบบบำบัด ถังแซด,งานฝ้าเพดาน', description: 'สีรองพื้น วางระบบบำบัด ถังแซด และงานฝ้าเพดาน', isCompleted: false },
  { phaseNumber: 9, name: 'งานกระเบื้อง 70%,งานสี 80%,ติดสุขภัณฑ์ 50%', description: 'งานกระเบื้อง 70% งานสี 80% และติดสุขภัณฑ์ 50%', isCompleted: false },
  { phaseNumber: 10, name: 'งานประตูหน้าต่าง,งานสี,งานเบ็ดเตล็ดแล้วเสร็จ,งานกระเบื้องแล้วเสร็จ,งานติดสุขภัณฑ์แล้วเสร็จ,งานดวงโคมแล้วเสร็จ', description: 'งานประตูหน้าต่าง งานสี งานเบ็ดเตล็ดแล้วเสร็จ งานกระเบื้องแล้วเสร็จ งานติดสุขภัณฑ์แล้วเสร็จ งานดวงโคมแล้วเสร็จ', isCompleted: false },
];

// งวดงานสำหรับงาน Precast Concrete
export interface PrecastPhase {
  phaseNumber: number;
  name: string;
  description: string;
  isCompleted: boolean;
  completedDate?: Date;
  notes?: string;
}

// งวดงานเริ่มต้นสำหรับงาน Precast Concrete (บ้าน 2 ชั้น)
export const defaultPrecastPhases: PrecastPhase[] = [
  { phaseNumber: 1, name: 'เตรียมอุปกรณ์ในการสั่งผลิต', description: 'เตรียมอุปกรณ์และวัสดุสำหรับการสั่งผลิต', isCompleted: false },
  { phaseNumber: 2, name: 'งานติดตั้งคานคอดิน', description: 'งานติดตั้งคานคอดิน', isCompleted: false },
  { phaseNumber: 3, name: 'งานติดตั้งผนังชั้น 1', description: 'งานติดตั้งผนังชั้น 1', isCompleted: false },
  { phaseNumber: 4, name: 'งานวางแผ่นพื้น,ผนังชั้น 2,บันไดชั้น 2', description: 'งานวางแผ่นพื้น ผนังชั้น 2 และบันไดชั้น 2', isCompleted: false },
  { phaseNumber: 5, name: 'เกร๊าปูน,เก็บรายละเอียด,ส่งมอบงานติดตั้ง', description: 'เกร๊าปูน เก็บรายละเอียด และส่งมอบงานติดตั้ง', isCompleted: false },
];

// ข้อมูลใบส่งมอบงวดงาน
export interface WorkDelivery {
  id?: string;
  deliveryNumber: string; // หมายเลขใบส่งมอบ
  workType: WorkType; // ประเภทงาน
  
  // ข้อมูลบริษัท
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  companyLogoUrl?: string;
  
  // ข้อมูลลูกค้า
  customerId: string;
  customerName: string;
  buyer?: string;
  
  // ข้อมูลโครงการ
  projectId: string;
  projectName: string;
  projectLocation: string;
  
  // งวดงาน
  phases: (HouseConstructionPhase | PrecastPhase)[];
  currentPhase: number; // งวดปัจจุบัน
  
  // วันที่
  issueDate: Date;
  deliveryDate: Date;
  
  // หมายเหตุ
  additionalNotes?: string;
  
  // สถานะ
  status: 'draft' | 'delivered' | 'accepted' | 'completed';
  isActive: boolean;
  
  // Timestamp
  createdAt: Date;
  updatedAt: Date;
}

// ข้อมูลสำหรับแสดงในใบส่งมอบ
export interface WorkDeliveryDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  projectNameAndLocation: string;
  customerName: string;
  buyer?: string;
  workType: WorkType;
  phases: (HouseConstructionPhase | PrecastPhase)[];
  currentPhase: number;
  deliveryNumber: string;
  issueDate: string;
  deliveryDate: string;
  additionalNotes?: string;
}

// Template สำหรับสร้างงวดงานใหม่
export interface PhaseTemplate {
  workType: WorkType;
  buildingType?: 'single-story' | 'two-story'; // สำหรับงานรับสร้างบ้าน
  phases: (HouseConstructionPhase | PrecastPhase)[];
}

// Template เริ่มต้น
export const phaseTemplates: PhaseTemplate[] = [
  {
    workType: 'house-construction',
    buildingType: 'single-story',
    phases: defaultHouseConstructionPhases.slice(0, 8) // บ้าน 1 ชั้น ใช้ 8 งวดแรก
  },
  {
    workType: 'house-construction',
    buildingType: 'two-story',
    phases: defaultHouseConstructionPhases // บ้าน 2 ชั้น ใช้ครบ 10 งวด
  },
  {
    workType: 'precast-concrete',
    phases: defaultPrecastPhases // งาน Precast ใช้ 5 งวด
  }
];
