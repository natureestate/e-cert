import React from 'react';

interface FormData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  projectNameAndLocation: string;
  customerName: string;
  deliveryDate: string;
  productItems: string;
  batchNumber: string;
}

interface CertificateFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isFormValid: boolean;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  formData,
  onFormChange,
  onLogoChange,
  onGenerate,
  isFormValid
}) => {
  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <h2 id="form-heading">กรอกข้อมูลเพื่อออกใบรับประกัน</h2>
      
      {/* Logo Upload Field */}
      <div className="form-group">
        <label htmlFor="logoUpload">โลโก้บริษัท</label>
        <input 
          type="file" 
          id="logoUpload" 
          name="logoUpload" 
          accept="image/*" 
          onChange={onLogoChange} 
        />
      </div>

      {/* Company Information */}
      <div className="form-group">
        <label htmlFor="companyName">ชื่อบริษัท/ร้านค้า</label>
        <input 
          type="text" 
          id="companyName" 
          name="companyName" 
          value={formData.companyName} 
          onChange={onFormChange} 
          placeholder="เช่น บริษัท พรีคาสท์คอนกรีต จำกัด (มหาชน)" 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="companyAddress">ที่อยู่บริษัท</label>
        <input 
          type="text" 
          id="companyAddress" 
          name="companyAddress" 
          value={formData.companyAddress} 
          onChange={onFormChange} 
          placeholder="เช่น 99/9 อาคารคอนกรีต ถนนพัฒนา แขวง..." 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="companyPhone">เบอร์โทรศัพท์บริษัท</label>
        <input 
          type="text" 
          id="companyPhone" 
          name="companyPhone" 
          value={formData.companyPhone} 
          onChange={onFormChange} 
          placeholder="เช่น 02-123-4567" 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="companyWebsite">เว็บไซต์/อีเมลบริษัท</label>
        <input 
          type="text" 
          id="companyWebsite" 
          name="companyWebsite" 
          value={formData.companyWebsite} 
          onChange={onFormChange} 
          placeholder="เช่น www.precast.co.th" 
          required 
        />
      </div>

      <hr className="form-divider" />

      {/* Project Information */}
      <div className="form-group">
        <label htmlFor="customerName">ชื่อลูกค้า</label>
        <input 
          type="text" 
          id="customerName" 
          name="customerName" 
          value={formData.customerName} 
          onChange={onFormChange} 
          placeholder="เช่น คุณสมชาย รักบ้าน" 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="projectNameAndLocation">ชื่อและที่ตั้งโครงการ</label>
        <textarea 
          id="projectNameAndLocation" 
          name="projectNameAndLocation" 
          value={formData.projectNameAndLocation} 
          onChange={onFormChange} 
          placeholder="เช่น โครงการหมู่บ้านเจริญสุข 123 หมู่ 4 ต.บางรัก อ.เมือง จ.นนทบุรี" 
          required 
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="deliveryDate">วันที่ส่งมอบสินค้า</label>
        <input 
          type="date" 
          id="deliveryDate" 
          name="deliveryDate" 
          value={formData.deliveryDate} 
          onChange={onFormChange} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="productItems">รายการสินค้า</label>
        <input 
          type="text" 
          id="productItems" 
          name="productItems" 
          value={formData.productItems} 
          onChange={onFormChange} 
          placeholder="เช่น แผ่นพื้นสำเร็จ, ผนังรับน้ำหนัก" 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="batchNumber">หมายเลขการผลิต/ล็อต (Batch No.)</label>
        <input 
          type="text" 
          id="batchNumber" 
          name="batchNumber" 
          value={formData.batchNumber} 
          onChange={onFormChange} 
          placeholder="เช่น BATCH-2024-07-A01" 
          required 
        />
      </div>

      <button 
        className="btn" 
        onClick={onGenerate} 
        disabled={!isFormValid}
      >
        สร้างใบรับประกัน
      </button>
    </section>
  );
};
