import React, { useState, useMemo, useEffect } from 'react';
import { Theme, Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { Navigation } from './components/Navigation';
import { CertificateForm } from './components/CertificateForm';
import { CertificatePreview } from './components/CertificatePreview';
import { CertificateHistory } from './components/CertificateHistory';
import { DataManagementRadix } from './components/DataManagementRadix';
import { CertificateDetails, WarrantyTerms, defaultWarrantyTerms } from './types/certificate';
import { exportCertificateToPDF } from './utils/pdfGenerator';
import { FirestoreService } from './services/firestoreService';
import { Company, Customer, Project, Product, BatchNumber, Certificate } from './types/firestore';
import '@radix-ui/themes/styles.css'; // Import Radix Themes CSS
import './config/firebase'; // Initialize Firebase
import './styles/tailwind.css'; // Import Tailwind CSS
import './styles/index.css'; // Import custom CSS styles

interface FormData {
  companyId: string;
  customerId: string;
  projectId: string;
  productId: string;
  batchNumbers: string[]; // เปลี่ยนเป็น array สำหรับ multi-tag
  deliveryDate: string;
  additionalNotes: string;
}

const App: React.FC = () => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('create');
  
  // State สำหรับแบบฟอร์ม
  const [formData, setFormData] = useState<FormData>({
    companyId: '',
    customerId: '',
    projectId: '',
    productId: '',
    batchNumbers: [], // เปลี่ยนเป็น array เปล่า
    deliveryDate: '',
    additionalNotes: '',
  });

  // State สำหรับโลโก้และใบรับประกัน
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [certificateDetails, setCertificateDetails] = useState<CertificateDetails | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerms>(defaultWarrantyTerms);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  // Initialize default data when app loads
  useEffect(() => {
    const initializeData = async () => {
      try {
        await FirestoreService.initializeDefaultData();
      } catch (error) {
        console.error('Error initializing default data:', error);
      }
    };
    
    initializeData();
  }, []);

  // State สำหรับข้อมูลที่ดึงมาจาก Firestore
  const [relatedData, setRelatedData] = useState<{
    company: Company | null;
    customer: Customer | null;
    project: Project | null;
    product: Product | null;
    batchNumber: BatchNumber | null;
  }>({
    company: null,
    customer: null,
    project: null,
    product: null,
    batchNumber: null,
  });

  // ตรวจสอบว่าแบบฟอร์มกรอกครบหรือไม่
  const isFormValid = useMemo(() => {
    const requiredStringFields = ['companyId', 'customerId', 'projectId', 'productId', 'deliveryDate'];
    const stringFieldsValid = requiredStringFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' && value.trim() !== '';
    });
    
    // ตรวจสอบ batchNumbers array ต้องมีอย่างน้อย 1 รายการ
    const batchNumbersValid = formData.batchNumbers.length > 0;
    
    return stringFieldsValid && batchNumbersValid;
  }, [formData]);

  // จัดการการเปลี่ยนแปลงในแบบฟอร์ม
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลง batch numbers (multi-tag)
  const handleBatchNumbersChange = (name: string, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // โหลดข้อมูลที่เกี่ยวข้องจาก Firestore เมื่อ form data เปลี่ยน
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        const promises = [];
        const newRelatedData = { ...relatedData };

        if (formData.companyId) {
          promises.push(
            FirestoreService.getCompanies().then(companies => {
              newRelatedData.company = companies.find(c => c.id === formData.companyId) || null;
            })
          );
        }

        if (formData.customerId) {
          promises.push(
            FirestoreService.getCustomers().then(customers => {
              newRelatedData.customer = customers.find(c => c.id === formData.customerId) || null;
            })
          );
        }

        if (formData.projectId) {
          promises.push(
            FirestoreService.getProjects().then(projects => {
              newRelatedData.project = projects.find(p => p.id === formData.projectId) || null;
            })
          );
        }

        if (formData.productId) {
          promises.push(
            FirestoreService.getProducts().then(products => {
              newRelatedData.product = products.find(p => p.id === formData.productId) || null;
            })
          );
        }

        // ไม่ต้องโหลด batch data เพราะใช้ multi-tag input แล้ว

        await Promise.all(promises);
        setRelatedData(newRelatedData);
      } catch (error) {
        console.error('Error loading related data:', error);
      }
    };

    // ตรวจสอบว่ามีข้อมูลในฟอร์มหรือไม่ (ยกเว้น batchNumbers ที่เป็น array)
    const hasFormData = Object.entries(formData).some(([key, value]) => {
      if (key === 'batchNumbers') {
        return Array.isArray(value) && value.length > 0;
      }
      return typeof value === 'string' && value.trim() !== '';
    });

    if (hasFormData) {
      loadRelatedData();
    }
  }, [formData.companyId, formData.customerId, formData.projectId, formData.productId, formData.batchNumbers]);

  // สร้าง preview อัตโนมัติเมื่อข้อมูลครบถ้วน
  useEffect(() => {
    const generatePreview = async () => {
      // ตรวจสอบว่าฟอร์มถูกต้องและมีข้อมูลครบ และไม่ได้อยู่ในโหมดดูเอกสารเก่า
      if (isFormValid && 
          relatedData.company && 
          relatedData.customer && 
          relatedData.project && 
          relatedData.product &&
          !viewingCertificate) {
        
        try {
          // สร้างวันที่ปัจจุบันในรูปแบบไทย
          const issueDate = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // สร้างหมายเลขใบรับประกัน (ชั่วคราวสำหรับ preview)
          const certificateNumber = `PCW-PREVIEW-${Date.now()}`;
          
          // แปลงวันที่ส่งมอบเป็นรูปแบบไทย
          const formattedDeliveryDate = new Date(formData.deliveryDate).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // สร้างข้อมูลใบรับประกัน preview
          const previewCertificateDetails: CertificateDetails = {
            companyName: relatedData.company.name,
            companyAddress: relatedData.company.address,
            companyPhone: relatedData.company.phone,
            companyWebsite: relatedData.company.website,
            projectNameAndLocation: `${relatedData.project.name} - ${relatedData.project.location}`,
            customerName: relatedData.customer.name,
            deliveryDate: formattedDeliveryDate,
            productItems: relatedData.product.name,
            batchNumber: formData.batchNumbers,
            certificateNumber,
            issueDate,
            additionalNotes: formData.additionalNotes, // เพิ่มหมายเหตุเพิ่มเติม
          };
          
          setCertificateDetails(previewCertificateDetails);
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      } else if (!isFormValid || !relatedData.company || !relatedData.customer || !relatedData.project || !relatedData.product) {
        // ล้าง preview หากข้อมูลไม่ครบ (ยกเว้นเมื่อดูเอกสารเก่า)
        if (!viewingCertificate) {
          setCertificateDetails(null);
        }
      }
    };

    generatePreview();
  }, [isFormValid, relatedData, formData.batchNumbers, formData.deliveryDate, viewingCertificate]);

  // จัดการการอัปโหลดโลโก้
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newLogoSrc = event.target?.result as string;
        setLogoSrc(newLogoSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  // บันทึกใบรับประกันลง Firestore (เปลี่ยนจาก preview เป็นเอกสารจริง)
  const handleGenerate = async () => {
    console.log('🔘 กดปุ่มบันทึกใบรับประกัน');
    console.log('📊 สถานะฟอร์ม:', { isFormValid, relatedData });
    
    if (!isFormValid || !relatedData.company || !relatedData.customer || !relatedData.project || !relatedData.product) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      // สร้างหมายเลขใบรับประกันจริง (ไม่ใช่ preview)
      const certificateNumber = `PCW-${Date.now()}`;
      
      // อัปเดต certificateDetails ให้ใช้หมายเลขจริง
      if (certificateDetails) {
        const finalCertificateDetails = {
          ...certificateDetails,
          certificateNumber
        };
        setCertificateDetails(finalCertificateDetails);

        // บันทึกใบรับประกันลง Firestore
        await FirestoreService.createCertificate({
          certificateNumber,
          companyId: formData.companyId,
          companyName: relatedData.company.name,
          companyAddress: relatedData.company.address,
          companyPhone: relatedData.company.phone,
          companyWebsite: relatedData.company.website,
          companyLogoUrl: relatedData.company.logoUrl || '', // แก้ไข undefined เป็น empty string
          customerId: formData.customerId,
          customerName: relatedData.customer.name,
          projectId: formData.projectId,
          projectName: relatedData.project.name,
          projectLocation: relatedData.project.location,
          productItems: relatedData.product.name,
          batchNumbers: formData.batchNumbers,
          additionalNotes: formData.additionalNotes, // เพิ่มหมายเหตุเพิ่มเติม
          deliveryDate: new Date(formData.deliveryDate),
          issueDate: new Date(),
          warrantyExpiration: new Date(Date.now() + (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years
          status: 'issued',
          isActive: true,
        });

        alert('✅ บันทึกใบรับประกันเรียบร้อยแล้ว!');
        console.log('Certificate saved to Firestore successfully!');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('เกิดข้อผิดพลาดในการสร้างใบรับประกัน');
    }
  };

  // ส่งออกเป็น PDF
  const handleExportPDF = async () => {
    console.log('🔘 กดปุ่มส่งออก PDF');
    console.log('📋 certificateDetails:', certificateDetails);
    
    if (!certificateDetails) {
      alert('ไม่พบข้อมูลใบรับประกัน กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
      return;
    }

    setIsExporting(true);
    try {
      await exportCertificateToPDF(certificateDetails.certificateNumber);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการส่งออก PDF:', error);
      alert((error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle viewing certificate from history
  const handleViewCertificate = (certificate: Certificate) => {
    const certDetails: CertificateDetails = {
      companyName: certificate.companyName,
      companyAddress: certificate.companyAddress,
      companyPhone: certificate.companyPhone,
      companyWebsite: certificate.companyWebsite,
      projectNameAndLocation: `${certificate.projectName} - ${certificate.projectLocation}`,
      customerName: certificate.customerName,
      deliveryDate: new Date(certificate.deliveryDate).toLocaleDateString('th-TH'),
      productItems: certificate.productItems,
      batchNumber: certificate.batchNumbers || (Array.isArray(certificate.batchNumber) ? certificate.batchNumber : [certificate.batchNumber]), // รองรับทั้งแบบเก่าและใหม่
      certificateNumber: certificate.certificateNumber,
      issueDate: new Date(certificate.issueDate).toLocaleDateString('th-TH'),
      additionalNotes: certificate.additionalNotes || '', // เพิ่มหมายเหตุเพิ่มเติม
    };
    
    setCertificateDetails(certDetails);
    setViewingCertificate(certificate);
    setCurrentPage('create'); // Switch to create page to show preview
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'create':
        return (
          <Flex 
            gap="6" 
            p="6"
            style={{ 
              maxWidth: '1600px', 
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            direction={{ initial: 'column', lg: 'row' }}
          >
            <CertificateForm
              formData={formData}
              onFormChange={handleFormChange}
              onBatchNumbersChange={handleBatchNumbersChange}
              onLogoChange={handleLogoChange}
              onGenerate={handleGenerate}
              isFormValid={isFormValid}
            />
            
            <CertificatePreview
              certificateDetails={certificateDetails}
              logoSrc={logoSrc}
              onExportPDF={handleExportPDF}
              isExporting={isExporting}
              warrantyTerms={warrantyTerms}
              onWarrantyTermsChange={setWarrantyTerms}
              editable={!viewingCertificate} // Only editable when creating new certificate
            />
          </Flex>
        );
      
      case 'history':
        return <CertificateHistory onViewCertificate={handleViewCertificate} />;
      
      case 'companies':
        return <DataManagementRadix dataType="companies" />;
      
      case 'customers':
        return <DataManagementRadix dataType="customers" />;
      
      case 'projects':
        return <DataManagementRadix dataType="projects" />;
      
      case 'products':
        return <DataManagementRadix dataType="products" />;
      
      default:
        return (
          <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <Heading as="h2" size="6" mb="2">หน้าที่ยังไม่พร้อมใช้งาน</Heading>
            <Text color="gray" size="3">กำลังพัฒนา...</Text>
          </Box>
        );
    }
  };

  return (
    <Theme
      accentColor="blue"
      grayColor="slate" 
      radius="large"
      scaling="100%"
      appearance="light"
    >
      <Flex style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, var(--blue-1) 0%, var(--slate-1) 50%, var(--indigo-1) 100%)'
      }}>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <Box style={{ flex: 1, overflowY: 'auto' }} role="main" aria-label="เนื้อหาหลัก">
          {currentPage === 'create' && (
            <Box 
              style={{ 
                background: 'linear-gradient(135deg, var(--blue-1), var(--white))',
                borderBottom: '1px solid var(--blue-6)',
                padding: '1.5rem 2rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Heading as="h1" size="7" mb="3" style={{ color: 'var(--gray-12)' }}>
                โปรแกรมออกใบรับประกันงานติดตั้ง
              </Heading>
              {viewingCertificate && (
                <Flex 
                  align="center" 
                  gap="3" 
                  mt="3"
                  style={{ 
                    backgroundColor: 'var(--yellow-3)', 
                    border: '1px solid var(--yellow-6)', 
                    borderRadius: '8px', 
                    padding: '0.75rem 1rem'
                  }}
                >
                  <Text style={{ color: 'var(--yellow-11)' }}>
                    📋 กำลังดูใบรับประกัน: {viewingCertificate.certificateNumber}
                  </Text>
                  <Button 
                    size="2"
                    variant="soft"
                    color="gray"
                    onClick={() => {
                      setViewingCertificate(null);
                      setCertificateDetails(null);
                    }}
                  >
                    สร้างใหม่
                  </Button>
                </Flex>
              )}
            </Box>
          )}
          
          <Box style={{ padding: currentPage === 'create' ? '1.5rem' : '0' }}>
            {renderCurrentPage()}
          </Box>
        </Box>
      </Flex>
    </Theme>
  );
};

export default App;
