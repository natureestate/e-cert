import React, { useState, useMemo, useEffect } from 'react';
import { Theme, Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { Navigation } from './components/Navigation';
import { CertificateForm } from './components/CertificateForm';
import { CertificatePreview } from './components/CertificatePreview';
import { CertificateHistory } from './components/CertificateHistory';
import { DataManagementRadix } from './components/DataManagementRadix';
import { WorkDeliveryHouse } from './components/WorkDeliveryHouse';
import { WorkDeliveryPrecast } from './components/WorkDeliveryPrecast';
import { WorkDeliveryHistory } from './components/WorkDeliveryHistory';
import { PhaseManagement } from './components/PhaseManagement';
import { CertificateDetails, WarrantyTerms, defaultWarrantyTerms } from './types/certificate';
import { WorkDelivery, WorkDeliveryDetails } from './types/workDelivery';
import { exportCertificateToPDF } from './utils/pdfGenerator';
import { printCertificate } from './utils/printUtils';
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
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium'); // ขนาดโลโก้ที่ผู้ใช้เลือก
  const [certificateDetails, setCertificateDetails] = useState<CertificateDetails | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false); // เพิ่ม state สำหรับ printing
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerms>(defaultWarrantyTerms);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  
  // State สำหรับ Work Delivery viewing
  const [viewingWorkDelivery, setViewingWorkDelivery] = useState<WorkDelivery | null>(null);
  const [workDeliveryDetails, setWorkDeliveryDetails] = useState<WorkDeliveryDetails | null>(null);

  // Initialize default data when app loads
  useEffect(() => {
    const initializeData = async () => {
      try {
        await FirestoreService.initializeDefaultData();
        await FirestoreService.initializeDefaultPhaseTemplates();
        
        // ตรวจสอบและสร้างโครงการสำหรับ "คุณทดสอบ เพิ่มข้อมูล" หากยังไม่มี
        const projects = await FirestoreService.getProjects();
        const testCustomerId = '3vbYjRC6L3OMbSq2XKDc';
        const testProjects = projects.filter(p => p.customerId === testCustomerId);
        
        if (testProjects.length === 0) {
          console.log('🔧 Creating projects for test customer...');
          
          await FirestoreService.createProject({
            name: 'โครงการทดสอบ บ้านเดี่ยว',
            location: '789 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100',
            customerId: testCustomerId,
            customerName: 'คุณทดสอบ เพิ่มข้อมูล',
            description: 'โครงการทดสอบระบบ',
            isActive: true
          });
          
          await FirestoreService.createProject({
            name: 'โครงการทดสอบ บ้านแฝด',
            location: '321 ถนนทดสอบ2 แขวงทดสอบ2 เขตทดสอบ2 กรุงเทพฯ 10200',
            customerId: testCustomerId,
            customerName: 'คุณทดสอบ เพิ่มข้อมูล',
            description: 'โครงการทดสอบระบบ แบบที่ 2',
            isActive: true
          });
          
          console.log('✅ Test projects created successfully!');
        }
        
        // Add reset function to global scope for debugging
        (window as any).resetFirebaseData = async () => {
          console.log('🔄 Resetting Firebase data...');
          await FirestoreService.initializeDefaultData(true);
          window.location.reload();
        };

        // Add debug functions for data management
        (window as any).checkFirebaseData = async () => {
          console.log('📊 Checking Firebase data...');
          const companies = await FirestoreService.getCompanies();
          const customers = await FirestoreService.getCustomers();
          const projects = await FirestoreService.getProjects();
          
          console.log('Companies:', companies);
          console.log('Customers:', customers);
          console.log('Projects:', projects);
          
          // Show relationships
          projects.forEach(project => {
            const customer = customers.find(c => c.id === project.customerId);
            console.log(`Project "${project.name}" belongs to customer "${customer?.name || 'NOT FOUND'}" (ID: ${project.customerId})`);
          });
        };

        (window as any).createTestData = async () => {
          console.log('🔧 Creating test data manually...');
          
          // Create test customer
          const customerId = await FirestoreService.createCustomer({
            name: 'คุณทดสอบ ใหม่',
            phone: '02-999-8888',
            email: 'testnew@email.com',
            buyer: 'นายทดสอบ ใหม่',
            isActive: true
          });
          
          // Create test projects for this customer
          await FirestoreService.createProject({
            name: 'โครงการทดสอบใหม่ A',
            location: 'ที่อยู่ทดสอบ A',
            customerId: customerId,
            customerName: 'คุณทดสอบ ใหม่',
            description: 'โครงการทดสอบ A',
            isActive: true
          });
          
          await FirestoreService.createProject({
            name: 'โครงการทดสอบใหม่ B',
            location: 'ที่อยู่ทดสอบ B',
            customerId: customerId,
            customerName: 'คุณทดสอบ ใหม่',
            description: 'โครงการทดสอบ B',
            isActive: true
          });
          
          console.log('✅ Test data created with customer ID:', customerId);
          window.location.reload();
        };
      } catch (error) {
        console.error('Error initializing default data:', error);
      }
    };
    
    initializeData();
  }, []);

  // โหลดการตั้งค่าขนาดโลโก้จาก localStorage เมื่อ app เริ่มต้น
  useEffect(() => {
    const loadLogoPreferences = () => {
      try {
        const savedLogoSize = localStorage.getItem('preferredLogoSize') as 'small' | 'medium' | 'large';
        if (savedLogoSize && ['small', 'medium', 'large'].includes(savedLogoSize)) {
          setLogoSize(savedLogoSize);
          console.log('✅ โหลดการตั้งค่าขนาดโลโก้:', savedLogoSize);
        }
      } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการโหลดการตั้งค่าโลโก้:', error);
      }
    };
    
    loadLogoPreferences();
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
              const selectedCompany = companies.find(c => c.id === formData.companyId) || null;
              newRelatedData.company = selectedCompany;
              
              console.log('🔍 Debug บริษัทที่เลือก:', {
                companyId: formData.companyId,
                selectedCompany: selectedCompany,
                logoUrl: selectedCompany?.logoUrl,
                hasLogo: !!selectedCompany?.logoUrl
              });
              
              // โหลดโลโก้อัตโนมัติเมื่อเลือกบริษัท
              if (selectedCompany?.logoUrl && selectedCompany.logoUrl.trim() !== '') {
                setLogoSrc(selectedCompany.logoUrl);
                console.log('🏢 โหลดโลโก้บริษัทอัตโนมัติ:', selectedCompany.logoUrl);
              } else {
                // ล้างโลโก้หากบริษัทไม่มีโลโก้
                setLogoSrc(null);
                console.log('🏢 บริษัทไม่มีโลโก้หรือ logoUrl ว่าง:', selectedCompany?.logoUrl);
              }
            })
          );
        } else {
          // ล้างโลโก้หากไม่ได้เลือกบริษัท
          setLogoSrc(null);
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

  // ฟังก์ชันสร้าง preview แบบด้วยตนเอง (ไม่อัตโนมัติ)
  const generatePreviewManually = async () => {
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
          buyer: relatedData.customer.buyer, // เพิ่มผู้ซื้อสินค้า
          deliveryDate: formattedDeliveryDate,
          productItems: relatedData.product.name,
          batchNumber: formData.batchNumbers,
          certificateNumber,
          issueDate,
          additionalNotes: formData.additionalNotes, // เพิ่มหมายเหตุเพิ่มเติม
        };
        
        console.log('🔄 สร้าง preview ด้วยตนเอง - additionalNotes:', formData.additionalNotes);
        
        setCertificateDetails(previewCertificateDetails);
        alert('✅ สร้าง Preview สำเร็จ!');
      } catch (error) {
        console.error('Error generating preview:', error);
        alert('❌ เกิดข้อผิดพลาดในการสร้าง Preview');
      }
    } else {
      alert('❌ กรุณากรอกข้อมูลให้ครบถ้วนก่อนสร้าง Preview');
    }
  };

  // ฟังก์ชันนี้ไม่ใช้แล้วเพราะโลโก้โหลดอัตโนมัติจากบริษัท
  // const handleLogoChange = ... (ถูกลบออกแล้ว)

  // ฟังก์ชันสำหรับเปลี่ยนขนาดโลโก้
  const handleLogoSizeChange = (size: 'small' | 'medium' | 'large') => {
    setLogoSize(size);
    // บันทึกขนาดโลโก้ลง localStorage (ใช้สำหรับบันทึกการตั้งค่าผู้ใช้)
    try {
      localStorage.setItem('preferredLogoSize', size);
    } catch (error) {
      console.warn('ไม่สามารถบันทึกขนาดโลโก้ลง localStorage:', error);
    }
  };

  // บันทึกใบรับประกันลง Firestore (เปลี่ยนจาก preview เป็นเอกสารจริง)
  const handleGenerate = async () => {
    console.log('🔘 กดปุ่มบันทึกใบรับประกัน');
    console.log('📊 สถานะฟอร์ม:', { isFormValid, relatedData, viewingCertificate });
    
    // ป้องกันการบันทึกใหม่เมื่อกำลังดูใบรับประกันจากประวัติ
    if (viewingCertificate) {
      alert('กำลังดูใบรับประกันจากประวัติ ไม่สามารถบันทึกใหม่ได้\nกรุณากดปุ่ม "สร้างใหม่" หากต้องการสร้างใบรับประกันใหม่');
      return;
    }
    
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

        // เตรียมข้อมูลสำหรับบันทึก (ลบ undefined values)
        const certificateData = {
          certificateNumber,
          companyId: formData.companyId,
          companyName: relatedData.company.name || '',
          companyAddress: relatedData.company.address || '',
          companyPhone: relatedData.company.phone || '',
          companyWebsite: relatedData.company.website || '',
          ...(relatedData.company.logoUrl && { companyLogoUrl: relatedData.company.logoUrl }),
          customerId: formData.customerId,
          customerName: relatedData.customer.name || '',
          ...(relatedData.customer.buyer && { buyer: relatedData.customer.buyer }),
          projectId: formData.projectId,
          projectName: relatedData.project.name || '',
          projectLocation: relatedData.project.location || '',
          productItems: relatedData.product.name || '',
          batchNumbers: formData.batchNumbers,
          ...(formData.additionalNotes && { additionalNotes: formData.additionalNotes }),
          deliveryDate: new Date(formData.deliveryDate),
          issueDate: new Date(),
          warrantyExpiration: new Date(Date.now() + (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years
          status: 'issued' as const,
          isActive: true,
        };

        console.log('📋 ข้อมูลใบรับประกันที่จะบันทึก:', certificateData);

        // บันทึกใบรับประกันลง Firestore
        await FirestoreService.createCertificate(certificateData);

        alert('✅ บันทึกใบรับประกันเรียบร้อยแล้ว!');
        console.log('Certificate saved to Firestore successfully!');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('เกิดข้อผิดพลาดในการสร้างใบรับประกัน');
    }
  };

  // รีเฟรช preview
  const handleRefreshPreview = () => {
    console.log('🔄 รีเฟรช preview - formData:', formData);
    // Force re-render โดยการ clear และสร้างใหม่
    setCertificateDetails(null);
    setTimeout(() => {
      // Trigger useEffect ใหม่ด้วยการเปลี่ยน dependency
      if (isFormValid && relatedData.company && relatedData.customer && relatedData.project && relatedData.product) {
        const generatePreviewNow = async () => {
          try {
            const issueDate = new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const certificateNumber = `PCW-PREVIEW-${Date.now()}`;
            const formattedDeliveryDate = new Date(formData.deliveryDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            const previewCertificateDetails: CertificateDetails = {
              companyName: relatedData.company.name,
              companyAddress: relatedData.company.address,
              companyPhone: relatedData.company.phone,
              companyWebsite: relatedData.company.website,
              projectNameAndLocation: `${relatedData.project.name} - ${relatedData.project.location}`,
              customerName: relatedData.customer.name,
              buyer: relatedData.customer.buyer, // เพิ่มผู้ซื้อสินค้า
              deliveryDate: formattedDeliveryDate,
              productItems: relatedData.product.name,
              batchNumber: formData.batchNumbers,
              certificateNumber,
              issueDate,
              additionalNotes: formData.additionalNotes,
            };
            
            console.log('🔄 รีเฟรช preview เรียบร้อย - additionalNotes:', formData.additionalNotes);
            setCertificateDetails(previewCertificateDetails);
          } catch (error) {
            console.error('Error refreshing preview:', error);
          }
        };
        generatePreviewNow();
      }
    }, 100);
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

  // พิมพ์เอกสาร
  const handlePrint = async () => {
    console.log('🔘 กดปุ่มพิมพ์เอกสาร');
    console.log('📋 certificateDetails:', certificateDetails);
    
    if (!certificateDetails) {
      alert('ไม่พบข้อมูลใบรับประกัน กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
      return;
    }

    setIsPrinting(true);
    try {
      await printCertificate(certificateDetails.certificateNumber);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการพิมพ์:', error);
      alert((error as Error).message);
    } finally {
      setIsPrinting(false);
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
      buyer: certificate.buyer, // เพิ่มผู้ซื้อสินค้า
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

  // Handle viewing work delivery from history
  const handleViewWorkDelivery = (workDelivery: WorkDelivery) => {
    const deliveryDetails: WorkDeliveryDetails = {
      companyName: workDelivery.companyName,
      companyAddress: workDelivery.companyAddress,
      companyPhone: workDelivery.companyPhone,
      companyWebsite: workDelivery.companyWebsite,
      projectNameAndLocation: `${workDelivery.projectName} - ${workDelivery.projectLocation}`,
      customerName: workDelivery.customerName,
      buyer: workDelivery.buyer,
      workType: workDelivery.workType,
      phases: workDelivery.phases,
      currentPhase: workDelivery.currentPhase,
      deliveryNumber: workDelivery.deliveryNumber,
      issueDate: new Date(workDelivery.issueDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      deliveryDate: new Date(workDelivery.deliveryDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      additionalNotes: workDelivery.additionalNotes,
    };
    
    setWorkDeliveryDetails(deliveryDetails);
    setViewingWorkDelivery(workDelivery);
    
    // Switch to appropriate work delivery page based on work type
    if (workDelivery.workType === 'house-construction') {
      setCurrentPage('work-delivery-house');
    } else {
      setCurrentPage('work-delivery-precast');
    }
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
              onGenerate={handleGenerate}
              isFormValid={isFormValid}
              logoSrc={logoSrc}
              logoSize={logoSize}
              onLogoSizeChange={handleLogoSizeChange}
              isViewingMode={!!viewingCertificate}
              onGeneratePreview={generatePreviewManually}
            />
            
            <CertificatePreview
              certificateDetails={certificateDetails}
              logoSrc={logoSrc}
              logoSize={logoSize}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              isExporting={isExporting}
              isPrinting={isPrinting}
              warrantyTerms={warrantyTerms}
              onWarrantyTermsChange={setWarrantyTerms}
              editable={!viewingCertificate} // Only editable when creating new certificate
              onRefreshPreview={!viewingCertificate ? handleRefreshPreview : undefined} // เฉพาะเมื่อสร้างใหม่
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
      
      case 'work-delivery-house':
        return <WorkDeliveryHouse viewingWorkDelivery={viewingWorkDelivery} workDeliveryDetails={workDeliveryDetails} />;
      
      case 'work-delivery-precast':
        return <WorkDeliveryPrecast viewingWorkDelivery={viewingWorkDelivery} workDeliveryDetails={workDeliveryDetails} />;
      
      case 'work-delivery-history':
        return <WorkDeliveryHistory onViewDelivery={handleViewWorkDelivery} />;
      
      case 'phase-management':
        return <PhaseManagement />;
      
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
          {/* Header สำหรับใบรับประกัน */}
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

          {/* Header สำหรับใบส่งมอบงาน */}
          {(currentPage === 'work-delivery-house' || currentPage === 'work-delivery-precast') && viewingWorkDelivery && (
            <Box 
              style={{ 
                background: 'linear-gradient(135deg, var(--green-1), var(--white))',
                borderBottom: '1px solid var(--green-6)',
                padding: '1.5rem 2rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Flex 
                align="center" 
                gap="3" 
                style={{ 
                  backgroundColor: 'var(--orange-3)', 
                  border: '1px solid var(--orange-6)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem'
                }}
              >
                <Text style={{ color: 'var(--orange-11)' }}>
                  📋 กำลังดูใบส่งมอบงาน: {viewingWorkDelivery.deliveryNumber} ({viewingWorkDelivery.workType === 'house-construction' ? 'งานรับสร้างบ้าน' : 'งาน Precast Concrete'})
                </Text>
                <Button 
                  size="2"
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setViewingWorkDelivery(null);
                    setWorkDeliveryDetails(null);
                  }}
                >
                  สร้างใหม่
                </Button>
              </Flex>
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
