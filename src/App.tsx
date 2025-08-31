import React, { useState, useMemo, useEffect } from 'react';
import { CertificateForm } from './components/CertificateForm';
import { CertificatePreview } from './components/CertificatePreview';
import { FormData, CertificateDetails } from './types/certificate';
import { exportCertificateToPDF } from './utils/pdfGenerator';
import { saveAppState, loadAppState } from './utils/localStorage';
import './config/firebase'; // Initialize Firebase
import './styles/index.css'; // Import CSS styles

const App: React.FC = () => {
  // State สำหรับแบบฟอร์ม
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyWebsite: '',
    projectNameAndLocation: '',
    customerName: '',
    deliveryDate: '',
    productItems: '',
    batchNumber: '',
  });

  // State สำหรับโลโก้และใบรับประกัน
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [certificateDetails, setCertificateDetails] = useState<CertificateDetails | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // โหลดข้อมูลจาก LocalStorage เมื่อแอปเริ่มต้น
  useEffect(() => {
    const savedState = loadAppState();
    if (savedState) {
      if (savedState.formData) {
        setFormData(savedState.formData);
      }
      if (savedState.certificateDetails) {
        setCertificateDetails(savedState.certificateDetails);
      }
      if (savedState.logoSrc) {
        setLogoSrc(savedState.logoSrc);
      }
    }
  }, []);

  // ตรวจสอบว่าแบบฟอร์มกรอกครบหรือไม่
  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => value.trim() !== '');
  }, [formData]);

  // จัดการการเปลี่ยนแปลงในแบบฟอร์ม
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // จัดการการอัปโหลดโลโก้
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newLogoSrc = event.target?.result as string;
        setLogoSrc(newLogoSrc);
        saveAppState({ formData, certificateDetails, logoSrc: newLogoSrc });
      };
      reader.readAsDataURL(file);
    }
  };

  // สร้างใบรับประกัน
  const handleGenerate = () => {
    if (!isFormValid) return;

    // สร้างวันที่ปัจจุบันในรูปแบบไทย
    const issueDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // สร้างหมายเลขใบรับประกัน
    const certificateNumber = `PCW-${Date.now()}`;
    
    // แปลงวันที่ส่งมอบเป็นรูปแบบไทย
    const formattedDeliveryDate = new Date(formData.deliveryDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // สร้างข้อมูลใบรับประกันใหม่
    const newCertificateDetails: CertificateDetails = {
      ...formData,
      deliveryDate: formattedDeliveryDate,
      issueDate,
      certificateNumber,
    };
    
    setCertificateDetails(newCertificateDetails);
    saveAppState({ formData, certificateDetails: newCertificateDetails, logoSrc });
  };

  // ส่งออกเป็น PDF
  const handleExportPDF = async () => {
    if (!certificateDetails) return;

    setIsExporting(true);
    try {
      await exportCertificateToPDF(certificateDetails.certificateNumber);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <h1>โปรแกรมออกใบรับประกันงานติดตั้ง</h1>
      <main className="main-container">
        <CertificateForm
          formData={formData}
          onFormChange={handleFormChange}
          onLogoChange={handleLogoChange}
          onGenerate={handleGenerate}
          isFormValid={isFormValid}
        />
        
        <CertificatePreview
          certificateDetails={certificateDetails}
          logoSrc={logoSrc}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />
      </main>
    </>
  );
};

export default App;
