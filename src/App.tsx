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
  batchNumberId: string;
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
    batchNumberId: '',
    deliveryDate: '',
    additionalNotes: '',
  });

  // State สำหรับโลโก้และใบรับประกัน
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [certificateDetails, setCertificateDetails] = useState<CertificateDetails | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerms>(defaultWarrantyTerms);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

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
    const requiredFields = ['companyId', 'customerId', 'projectId', 'productId', 'batchNumberId', 'deliveryDate'];
    return requiredFields.every(field => formData[field as keyof FormData].trim() !== '');
  }, [formData]);

  // จัดการการเปลี่ยนแปลงในแบบฟอร์ม
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

        if (formData.batchNumberId) {
          promises.push(
            FirestoreService.getBatchNumbers().then(batches => {
              newRelatedData.batchNumber = batches.find(b => b.id === formData.batchNumberId) || null;
            })
          );
        }

        await Promise.all(promises);
        setRelatedData(newRelatedData);
      } catch (error) {
        console.error('Error loading related data:', error);
      }
    };

    if (Object.values(formData).some(value => value.trim() !== '')) {
      loadRelatedData();
    }
  }, [formData.companyId, formData.customerId, formData.projectId, formData.productId, formData.batchNumberId]);

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

  // สร้างใบรับประกัน
  const handleGenerate = async () => {
    if (!isFormValid || !relatedData.company || !relatedData.customer || !relatedData.project || !relatedData.product || !relatedData.batchNumber) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
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
        companyName: relatedData.company.name,
        companyAddress: relatedData.company.address,
        companyPhone: relatedData.company.phone,
        companyWebsite: relatedData.company.website,
        projectNameAndLocation: `${relatedData.project.name} - ${relatedData.project.location}`,
        customerName: relatedData.customer.name,
        deliveryDate: formattedDeliveryDate,
        productItems: relatedData.product.name,
        batchNumber: relatedData.batchNumber.batchNumber,
        certificateNumber,
        issueDate,
      };
      
      setCertificateDetails(newCertificateDetails);

      // บันทึกใบรับประกันลง Firestore
      await FirestoreService.createCertificate({
        certificateNumber,
        companyId: formData.companyId,
        companyName: relatedData.company.name,
        companyAddress: relatedData.company.address,
        companyPhone: relatedData.company.phone,
        companyWebsite: relatedData.company.website,
        companyLogoUrl: relatedData.company.logoUrl,
        customerId: formData.customerId,
        customerName: relatedData.customer.name,
        projectId: formData.projectId,
        projectName: relatedData.project.name,
        projectLocation: relatedData.project.location,
        productItems: relatedData.product.name,
        batchNumberId: formData.batchNumberId,
        batchNumber: relatedData.batchNumber.batchNumber,
        deliveryDate: new Date(formData.deliveryDate),
        issueDate: new Date(),
        warrantyExpiration: new Date(Date.now() + (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years
        status: 'issued',
        isActive: true,
      });

      console.log('Certificate saved to Firestore successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('เกิดข้อผิดพลาดในการสร้างใบรับประกัน');
    }
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
      batchNumber: certificate.batchNumber,
      certificateNumber: certificate.certificateNumber,
      issueDate: new Date(certificate.issueDate).toLocaleDateString('th-TH'),
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
        
        <Box style={{ flex: 1, overflowY: 'auto' }}>
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
