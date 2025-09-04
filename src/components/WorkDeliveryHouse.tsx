import React, { useState, useMemo, useEffect } from 'react';
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { WorkDeliveryForm } from './WorkDeliveryForm';
import { WorkDeliveryPreview } from './WorkDeliveryPreview';
import { FirestoreService } from '../services/firestoreService';
import { Company, Customer, Project } from '../types/firestore';
import { 
  WorkType, 
  WorkDeliveryDetails, 
  HouseConstructionPhase, 
  defaultHouseConstructionPhases,
  phaseTemplates 
} from '../types/workDelivery';
import { exportWorkDeliveryToPDF } from '../utils/pdfGenerator';
import { printWorkDelivery } from '../utils/printUtils';

interface FormData {
  companyId: string;
  customerId: string;
  projectId: string;
  workType: WorkType;
  buildingType?: 'single-story' | 'two-story';
  currentPhase: number;
  deliveryDate: string;
  additionalNotes: string;
}

export const WorkDeliveryHouse: React.FC = () => {
  // State สำหรับแบบฟอร์ม
  const [formData, setFormData] = useState<FormData>({
    companyId: '',
    customerId: '',
    projectId: '',
    workType: 'house-construction',
    buildingType: undefined,
    currentPhase: 1,
    deliveryDate: '',
    additionalNotes: '',
  });

  // State สำหรับงวดงาน
  const [phases, setPhases] = useState<HouseConstructionPhase[]>([]);
  const [deliveryDetails, setDeliveryDetails] = useState<WorkDeliveryDetails | null>(null);
  
  // State สำหรับข้อมูลที่ดึงมาจาก Firestore
  const [relatedData, setRelatedData] = useState<{
    company: Company | null;
    customer: Customer | null;
    project: Project | null;
  }>({
    company: null,
    customer: null,
    project: null,
  });
  
  // State สำหรับ PDF และ Print
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // ตรวจสอบว่าแบบฟอร์มกรอกครบหรือไม่ (สำหรับปุ่มบันทึก)
  const isFormValid = useMemo(() => {
    const requiredFields = ['companyId', 'customerId', 'projectId', 'deliveryDate'];
    const fieldsValid = requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' && value.trim() !== '';
    });
    
    // ตรวจสอบประเภทอาคารสำหรับงานรับสร้างบ้าน
    const buildingTypeValid = formData.workType !== 'house-construction' || formData.buildingType;
    
    // ตรวจสอบว่ามีงวดงานอย่างน้อย 1 งวด
    const phasesValid = phases.length > 0;
    
    return fieldsValid && buildingTypeValid && phasesValid;
  }, [formData, phases]);

  // จัดการการเปลี่ยนแปลงในแบบฟอร์ม
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนประเภทงาน
  const handleWorkTypeChange = (workType: WorkType) => {
    setFormData(prev => ({ 
      ...prev, 
      workType,
      buildingType: workType === 'house-construction' ? undefined : prev.buildingType 
    }));
    
    // โหลดงวดงานใหม่ตามประเภทงาน
    loadPhasesByWorkType(workType, formData.buildingType);
  };

  // จัดการการเปลี่ยนประเภทอาคาร
  const handleBuildingTypeChange = (buildingType: 'single-story' | 'two-story') => {
    setFormData(prev => ({ ...prev, buildingType }));
    
    // โหลดงวดงานใหม่ตามประเภทอาคาร
    loadPhasesByWorkType(formData.workType, buildingType);
  };

  // โหลดงวดงานตามประเภทงานและประเภทอาคาร
  const loadPhasesByWorkType = (workType: WorkType, buildingType?: 'single-story' | 'two-story') => {
    let selectedTemplate = phaseTemplates.find(template => {
      if (workType === 'house-construction') {
        return template.workType === workType && template.buildingType === buildingType;
      }
      return template.workType === workType;
    });

    if (selectedTemplate) {
      setPhases([...selectedTemplate.phases] as HouseConstructionPhase[]);
      
      // หาตำแหน่งงวดปัจจุบัน (งวดแรกที่ยังไม่เสร็จ)
      const currentPhaseIndex = selectedTemplate.phases.findIndex(phase => !phase.isCompleted);
      const currentPhaseNumber = currentPhaseIndex !== -1 ? currentPhaseIndex + 1 : selectedTemplate.phases.length;
      
      setFormData(prev => ({ ...prev, currentPhase: currentPhaseNumber }));
    }
  };

  // จัดการการ toggle งวดงาน
  const handlePhaseToggle = (phaseIndex: number, isCompleted: boolean, notes?: string) => {
    setPhases(prev => prev.map((phase, index) => {
      if (index === phaseIndex) {
        return {
          ...phase,
          isCompleted,
          completedDate: isCompleted ? new Date() : undefined,
          notes: notes || phase.notes
        };
      }
      return phase;
    }));

    // อัปเดตงวดปัจจุบัน
    if (isCompleted) {
      // หาตำแหน่งงวดถัดไปที่ยังไม่เสร็จ
      const updatedPhases = [...phases];
      updatedPhases[phaseIndex] = {
        ...updatedPhases[phaseIndex],
        isCompleted: true,
        completedDate: new Date(),
        notes: notes || updatedPhases[phaseIndex].notes
      };
      
      const nextIncompleteIndex = updatedPhases.findIndex(phase => !phase.isCompleted);
      const nextPhaseNumber = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : updatedPhases.length;
      
      setFormData(prev => ({ ...prev, currentPhase: nextPhaseNumber }));
    }
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

        await Promise.all(promises);
        setRelatedData(newRelatedData);
        console.log('📊 Related data loaded:', newRelatedData);
      } catch (error) {
        console.error('Error loading related data:', error);
      }
    };

    // ตรวจสอบว่ามีข้อมูลในฟอร์มหรือไม่
    const hasFormData = Object.entries(formData).some(([key, value]) => {
      return typeof value === 'string' && value.trim() !== '';
    });

    if (hasFormData) {
      loadRelatedData();
    }
  }, [formData.companyId, formData.customerId, formData.projectId]);

  // สร้าง preview อัตโนมัติเมื่อข้อมูลครบถ้วน
  useEffect(() => {
    const generatePreview = async () => {
      // ตรวจสอบเงื่อนไขการแสดง preview แบบผ่อนคลาย
      const hasBasicData = formData.companyId && formData.customerId && formData.projectId && formData.deliveryDate;
      
      if (hasBasicData && 
          relatedData.company && 
          relatedData.customer && 
          relatedData.project && 
          phases.length > 0) {
        
        try {
          console.log('🔄 Generating preview for house construction', {
            formData,
            relatedData,
            phases: phases.length
          });
          
          // สร้างวันที่ปัจจุบันในรูปแบบไทย
          const issueDate = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // สร้างหมายเลขใบส่งมอบ (ชั่วคราวสำหรับ preview)
          const deliveryNumber = `WD-HOUSE-PREVIEW-${Date.now()}`;
          
          // แปลงวันที่ส่งมอบเป็นรูปแบบไทย
          const formattedDeliveryDate = new Date(formData.deliveryDate).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // สร้างข้อมูลใบส่งมอบ preview
          const previewDeliveryDetails: WorkDeliveryDetails = {
            companyName: relatedData.company.name,
            companyAddress: relatedData.company.address,
            companyPhone: relatedData.company.phone,
            companyWebsite: relatedData.company.website,
            projectNameAndLocation: `${relatedData.project.name} - ${relatedData.project.location}`,
            customerName: relatedData.customer.name,
            buyer: relatedData.customer.buyer,
            workType: formData.workType,
            phases: phases,
            currentPhase: formData.currentPhase,
            deliveryNumber,
            issueDate,
            deliveryDate: formattedDeliveryDate,
            additionalNotes: formData.additionalNotes,
          };
          
          setDeliveryDetails(previewDeliveryDetails);
          console.log('✅ Preview generated successfully', previewDeliveryDetails);
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      } else {
        console.log('❌ Preview conditions not met', {
          hasBasicData: formData.companyId && formData.customerId && formData.projectId && formData.deliveryDate,
          formData: formData,
          company: !!relatedData.company,
          companyData: relatedData.company,
          customer: !!relatedData.customer,
          customerData: relatedData.customer,
          project: !!relatedData.project,
          projectData: relatedData.project,
          phases: phases.length,
          phasesData: phases
        });
        setDeliveryDetails(null);
      }
    };

    generatePreview();
  }, [formData, relatedData, phases]);

  // เริ่มต้นด้วยงวดงานเริ่มต้นและตั้งค่าเริ่มต้น
  useEffect(() => {
    if (phases.length === 0) {
      console.log('🔧 Initializing default phases for house construction');
      setPhases([...defaultHouseConstructionPhases]);
    }
    
    // ตั้งค่าเริ่มต้นสำหรับฟอร์ม
    if (!formData.workType) {
      console.log('🔧 Setting default work type');
      setFormData(prev => ({
        ...prev,
        workType: 'house-construction',
        buildingType: 'two-story'
      }));
    }
  }, []);

  // Debug formData changes
  useEffect(() => {
    console.log('📝 Form data changed:', formData);
  }, [formData]);

  // บันทึกใบส่งมอบงวดงาน
  const handleGenerate = async () => {
    console.log('🔘 กดปุ่มบันทึกใบส่งมอบงวดงาน');
    console.log('📊 สถานะฟอร์ม:', { isFormValid, relatedData });
    
    if (!isFormValid || !relatedData.company || !relatedData.customer || !relatedData.project) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      // สร้างหมายเลขใบส่งมอบจริง
      const deliveryNumber = `WD-HOUSE-${Date.now()}`;
      
      // TODO: บันทึกลง Firestore (รอการเพิ่ม Firestore Service สำหรับ Work Delivery)
      console.log('📋 ข้อมูลที่จะบันทึก:', {
        deliveryNumber,
        workType: formData.workType,
        buildingType: formData.buildingType,
        companyId: formData.companyId,
        customerId: formData.customerId,
        projectId: formData.projectId,
        phases: phases,
        currentPhase: formData.currentPhase,
        deliveryDate: new Date(formData.deliveryDate),
        additionalNotes: formData.additionalNotes,
      });

      alert('✅ บันทึกใบส่งมอบงวดงานเรียบร้อยแล้ว!\n(ฟีเจอร์บันทึกลงฐานข้อมูลจะเพิ่มในขั้นตอนถัดไป)');
    } catch (error) {
      console.error('Error generating work delivery:', error);
      alert('เกิดข้อผิดพลาดในการสร้างใบส่งมอบงวดงาน');
    }
  };

  // รีเฟรช preview
  const handleRefreshPreview = () => {
    console.log('🔄 รีเฟรช preview สำหรับงานรับสร้างบ้าน');
    setDeliveryDetails(null);
    setTimeout(() => {
      if (isFormValid && relatedData.company && relatedData.customer && relatedData.project) {
        const generatePreviewNow = async () => {
          try {
            const issueDate = new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const deliveryNumber = `WD-HOUSE-PREVIEW-${Date.now()}`;
            const formattedDeliveryDate = new Date(formData.deliveryDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            const previewDeliveryDetails: WorkDeliveryDetails = {
              companyName: relatedData.company.name,
              companyAddress: relatedData.company.address,
              companyPhone: relatedData.company.phone,
              companyWebsite: relatedData.company.website,
              projectNameAndLocation: `${relatedData.project.name} - ${relatedData.project.location}`,
              customerName: relatedData.customer.name,
              buyer: relatedData.customer.buyer,
              workType: formData.workType,
              phases: phases,
              currentPhase: formData.currentPhase,
              deliveryNumber,
              issueDate,
              deliveryDate: formattedDeliveryDate,
              additionalNotes: formData.additionalNotes,
            };
            
            setDeliveryDetails(previewDeliveryDetails);
          } catch (error) {
            console.error('Error refreshing preview:', error);
          }
        };
        generatePreviewNow();
      }
    }, 100);
  };

  // ฟังก์ชันส่งออก PDF
  const handleExportPDF = async () => {
    if (!deliveryDetails) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งออก PDF');
      return;
    }

    setIsExporting(true);
    try {
      await exportWorkDeliveryToPDF(deliveryDetails.deliveryNumber);
      alert('ส่งออก PDF สำเร็จ!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('เกิดข้อผิดพลาดในการส่งออก PDF: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // ฟังก์ชันพิมพ์
  const handlePrint = async () => {
    if (!deliveryDetails) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนพิมพ์');
      return;
    }

    setIsPrinting(true);
    try {
      await printWorkDelivery(deliveryDetails.deliveryNumber);
    } catch (error) {
      console.error('Error printing:', error);
      alert('เกิดข้อผิดพลาดในการพิมพ์: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Box style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Box 
        style={{ 
          background: 'linear-gradient(135deg, var(--green-1), var(--white))',
          borderBottom: '1px solid var(--green-6)',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          borderRadius: '8px'
        }}
      >
        <Heading as="h1" size="7" mb="3" style={{ color: 'var(--gray-12)' }}>
          ใบส่งมอบงวดงาน - งานรับสร้างบ้าน
        </Heading>
        <Text size="3" style={{ color: 'var(--gray-11)' }}>
          สร้างและจัดการใบส่งมอบงวดงานสำหรับโครงการรับสร้างบ้าน
        </Text>
      </Box>

      <Flex 
        gap="6" 
        style={{ 
          maxWidth: '1600px', 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}
        direction={{ initial: 'column', lg: 'row' }}
      >
        <WorkDeliveryForm
          formData={formData}
          onFormChange={handleFormChange}
          onWorkTypeChange={handleWorkTypeChange}
          onBuildingTypeChange={handleBuildingTypeChange}
          onPhaseToggle={handlePhaseToggle}
          phases={phases}
          onGenerate={handleGenerate}
          isFormValid={isFormValid}
        />
        
        <WorkDeliveryPreview
          deliveryDetails={deliveryDetails}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          isExporting={isExporting}
          isPrinting={isPrinting}
          editable={true}
          onRefreshPreview={handleRefreshPreview}
        />
      </Flex>
    </Box>
  );
};
