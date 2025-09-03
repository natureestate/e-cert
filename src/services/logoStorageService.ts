import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface LogoInfo {
  url: string;
  fileName: string;
  fullPath: string;
  size: 'small' | 'medium' | 'large';
  uploadedAt: Date;
}

/**
 * เซอร์วิสสำหรับจัดการโลโก้ใน Firebase Storage
 */
export class LogoStorageService {
  private static readonly LOGOS_PATH = 'company-logos';

  /**
   * อัปโหลดโลโก้ไปยัง Firebase Storage
   * @param file ไฟล์โลโก้ที่จะอัปโหลด
   * @param companyId ID ของบริษัท (optional)
   * @returns ข้อมูลโลโก้ที่อัปโหลดแล้ว
   */
  static async uploadLogo(file: File, companyId?: string): Promise<LogoInfo> {
    try {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = companyId 
        ? `${companyId}_${timestamp}.${fileExtension}`
        : `logo_${timestamp}.${fileExtension}`;
      
      // สร้าง reference ใน Storage
      const logoRef = ref(storage, `${this.LOGOS_PATH}/${fileName}`);
      
      console.log('🔄 กำลังอัปโหลดโลโก้...', fileName);
      
      // อัปโหลดไฟล์
      const snapshot = await uploadBytes(logoRef, file);
      console.log('✅ อัปโหลดโลโก้สำเร็จ!', snapshot.metadata.fullPath);
      
      // ดึง download URL
      const downloadURL = await getDownloadURL(logoRef);
      
      const logoInfo: LogoInfo = {
        url: downloadURL,
        fileName: file.name,
        fullPath: snapshot.metadata.fullPath,
        size: 'medium', // ค่าเริ่มต้น
        uploadedAt: new Date()
      };
      
      // บันทึกข้อมูลโลโก้ลง localStorage สำหรับการใช้งานในภายหลัง
      this.saveLogoToLocalStorage(logoInfo);
      
      return logoInfo;
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดโลโก้:', error);
      throw new Error('ไม่สามารถอัปโหลดโลโก้ได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  /**
   * ลบโลโก้จาก Firebase Storage
   * @param fullPath path เต็มของไฟล์ใน Storage
   */
  static async deleteLogo(fullPath: string): Promise<void> {
    try {
      const logoRef = ref(storage, fullPath);
      await deleteObject(logoRef);
      console.log('✅ ลบโลโก้สำเร็จ:', fullPath);
      
      // ลบข้อมูลจาก localStorage ด้วย
      this.removeLogoFromLocalStorage();
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการลบโลโก้:', error);
      throw new Error('ไม่สามารถลบโลโก้ได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  /**
   * ดึงรายการโลโก้ทั้งหมดของบริษัท
   * @param companyId ID ของบริษัท (optional)
   * @returns รายการโลโก้
   */
  static async getCompanyLogos(companyId?: string): Promise<LogoInfo[]> {
    try {
      const logosRef = ref(storage, this.LOGOS_PATH);
      const result = await listAll(logosRef);
      
      const logos: LogoInfo[] = [];
      
      for (const itemRef of result.items) {
        // ถ้าระบุ companyId ให้กรองเฉพาะโลโก้ของบริษัทนั้น
        if (companyId && !itemRef.name.startsWith(companyId)) {
          continue;
        }
        
        try {
          const downloadURL = await getDownloadURL(itemRef);
          logos.push({
            url: downloadURL,
            fileName: itemRef.name,
            fullPath: itemRef.fullPath,
            size: 'medium',
            uploadedAt: new Date() // จะต้องดึงจาก metadata จริงในการใช้งานจริง
          });
        } catch (error) {
          console.warn('⚠️ ไม่สามารถดึง URL ของโลโก้:', itemRef.name, error);
        }
      }
      
      return logos;
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการดึงรายการโลโก้:', error);
      return [];
    }
  }

  /**
   * บันทึกข้อมูลโลโก้ลง localStorage
   */
  static saveLogoToLocalStorage(logoInfo: LogoInfo): void {
    try {
      localStorage.setItem('currentLogo', JSON.stringify(logoInfo));
    } catch (error) {
      console.warn('⚠️ ไม่สามารถบันทึกข้อมูลโลโก้ลง localStorage:', error);
    }
  }

  /**
   * ดึงข้อมูลโลโก้จาก localStorage
   */
  static getLogoFromLocalStorage(): LogoInfo | null {
    try {
      const logoData = localStorage.getItem('currentLogo');
      if (logoData) {
        const logoInfo = JSON.parse(logoData);
        // แปลง uploadedAt กลับเป็น Date object
        logoInfo.uploadedAt = new Date(logoInfo.uploadedAt);
        return logoInfo;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ ไม่สามารถดึงข้อมูลโลโก้จาก localStorage:', error);
      return null;
    }
  }

  /**
   * ลบข้อมูลโลโก้จาก localStorage
   */
  private static removeLogoFromLocalStorage(): void {
    try {
      localStorage.removeItem('currentLogo');
    } catch (error) {
      console.warn('⚠️ ไม่สามารถลบข้อมูลโลโก้จาก localStorage:', error);
    }
  }

  /**
   * ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
   */
  static isValidFileSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }

  /**
   * อัปเดตขนาดโลโก้ใน localStorage
   */
  static updateLogoSize(size: 'small' | 'medium' | 'large'): void {
    const logoInfo = this.getLogoFromLocalStorage();
    if (logoInfo) {
      logoInfo.size = size;
      this.saveLogoToLocalStorage(logoInfo);
    }
  }
}
