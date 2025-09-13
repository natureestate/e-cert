import React, { useState, useMemo, useEffect } from 'react';
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { WorkDeliveryForm } from './WorkDeliveryForm';
import { WorkDeliveryPreview } from './WorkDeliveryPreview';
import { FirestoreService } from '../services/firestoreService';
import { Company, Customer, Project } from '../types/firestore';
import { 
  WorkType, 
  WorkDelivery,
  WorkDeliveryDetails, 
  HouseConstructionPhase, 
  defaultHouseConstructionPhases,
  phaseTemplates,
  PhaseTemplateFirestore
} from '../types/workDelivery';
import { exportWorkDeliveryToPDF } from '../utils/pdfGenerator';
import { printWorkDelivery } from '../utils/printUtils';

// ลบ LogoInfo interface - ใช้โลโก้จากบริษัทโดยตรง

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

interface WorkDeliveryHouseProps {
  viewingWorkDelivery?: WorkDelivery | null;
  workDeliveryDetails?: WorkDeliveryDetails | null;
}

export const WorkDeliveryHouse: React.FC<WorkDeliveryHouseProps> = ({ 
  viewingWorkDelivery,
  workDeliveryDetails 
}) => {
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
  
  // State สำหรับโลโก้ (โหลดจากบริษัทอัตโนมัติ)
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');
  
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

  // Flag เพื่อป้องกันการโหลดข้อมูลซ้ำจาก Firestore เมื่อกำลังโหลดจาก history
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);
  
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

  // โหลดงวดงานตามประเภทงานและประเภทอาคาร (จากเทมเพลตเริ่มต้น)
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

  // โหลดงวดงานจากเทมเพลต
  const handlePhaseTemplateChange = async (templateId: string) => {
    try {
      const template = await FirestoreService.getPhaseTemplateById(templateId);
      if (template) {
        console.log('🔄 โหลดเทมเพลตงวดงาน:', template.name);
        setPhases([...template.phases] as HouseConstructionPhase[]);
        
        // หาตำแหน่งงวดปัจจุบัน (งวดแรกที่ยังไม่เสร็จ)
        const currentPhaseIndex = template.phases.findIndex(phase => !phase.isCompleted);
        const currentPhaseNumber = currentPhaseIndex !== -1 ? currentPhaseIndex + 1 : template.phases.length;
        
        setFormData(prev => ({ ...prev, currentPhase: currentPhaseNumber }));
      }
    } catch (error) {
      console.error('Error loading phase template:', error);
      alert('เกิดข้อผิดพลาดในการโหลดเทมเพลตงวดงาน');
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
    // ⚠️ ข้ามการโหลดถ้ากำลังโหลดจาก history
    if (isLoadingFromHistory) {
      console.log('⏭️ ข้ามการโหลด related data เพราะกำลังโหลดจาก history');
      return;
    }

    const loadRelatedData = async () => {
      try {
        const promises = [];
        const newRelatedData = { ...relatedData };

        if (formData.companyId) {
          promises.push(
            FirestoreService.getCompanies().then(companies => {
              const selectedCompany = companies.find(c => c.id === formData.companyId) || null;
              newRelatedData.company = selectedCompany;
              
              // โหลดโลโก้อัตโนมัติจากบริษัท
              if (selectedCompany?.logoUrl && selectedCompany.logoUrl.trim() !== '') {
                setLogoSrc(selectedCompany.logoUrl);
                console.log('🏢 WorkDeliveryHouse: โหลดโลโก้บริษัทอัตโนมัติ:', selectedCompany.logoUrl);
              } else {
                setLogoSrc(null);
                console.log('🏢 WorkDeliveryHouse: บริษัทไม่มีโลโก้');
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
  }, [formData.companyId, formData.customerId, formData.projectId, isLoadingFromHistory]);

  // ฟังก์ชันสร้าง preview แบบด้วยตนเอง (ไม่อัตโนมัติ)
  const generatePreviewManually = async () => {
    // ตรวจสอบเงื่อนไขการแสดง preview แบบผ่อนคลาย
    const hasBasicData = formData.companyId && formData.customerId && formData.projectId && formData.deliveryDate;
    
    // 🔍 Detailed logging สำหรับ debug
    console.log('🔍 Manual Preview condition check:', {
      hasBasicData,
      formData: {
        companyId: formData.companyId,
        customerId: formData.customerId, 
        projectId: formData.projectId,
        deliveryDate: formData.deliveryDate
      },
      relatedData: {
        hasCompany: !!relatedData.company,
        hasCustomer: !!relatedData.customer,
        hasProject: !!relatedData.project,
        companyName: relatedData.company?.name,
        customerName: relatedData.customer?.name,
        projectName: relatedData.project?.name
      },
      phases: phases.length
    });
    
    // เงื่อนไขที่ผ่อนคลายสำหรับ viewing mode จาก history
    const canGeneratePreview = viewingWorkDelivery ? 
      (formData.deliveryDate && phases.length > 0) : // สำหรับ viewing mode เช็คแค่ deliveryDate และ phases
      (hasBasicData && relatedData.company && relatedData.customer && relatedData.project && phases.length > 0);

    if (canGeneratePreview) {
      
      try {
        console.log('✅ Manual preview - All conditions met');
        
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
        // ใช้ข้อมูลจาก workDeliveryDetails หากมี (กรณี viewing mode) หรือใช้ relatedData
        const previewDeliveryDetails: WorkDeliveryDetails = {
          companyName: workDeliveryDetails?.companyName || relatedData.company?.name || '',
          companyAddress: workDeliveryDetails?.companyAddress || relatedData.company?.address || '',
          companyPhone: workDeliveryDetails?.companyPhone || relatedData.company?.phone || '',
          companyWebsite: workDeliveryDetails?.companyWebsite || relatedData.company?.website || '',
          projectNameAndLocation: workDeliveryDetails?.projectNameAndLocation || 
            (relatedData.project ? `${relatedData.project.name} - ${relatedData.project.location}` : ''),
          customerName: workDeliveryDetails?.customerName || relatedData.customer?.name || '',
          buyer: workDeliveryDetails?.buyer || relatedData.customer?.buyer || '',
          workType: formData.workType,
          phases: phases,
          currentPhase: formData.currentPhase,
          deliveryNumber: workDeliveryDetails?.deliveryNumber || deliveryNumber,
          issueDate: workDeliveryDetails?.issueDate || issueDate,
          deliveryDate: workDeliveryDetails?.deliveryDate || formattedDeliveryDate,
          additionalNotes: formData.additionalNotes,
        };
        
        setDeliveryDetails(previewDeliveryDetails);
        console.log('🎉 Manual Preview generated successfully');
        alert('✅ สร้าง Preview สำเร็จ!');
      } catch (error) {
        console.error('Error generating manual preview:', error);
        alert('❌ เกิดข้อผิดพลาดในการสร้าง Preview');
      }
    } else {
      console.log('❌ Manual Preview conditions not met');
      alert('❌ กรุณากรอกข้อมูลให้ครบถ้วนและเลือกงวดงานก่อนสร้าง Preview');
    }
  };

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

  // ตั้งค่า deliveryDetails เมื่อมีการดูใบส่งมอบจาก history
  useEffect(() => {
    if (workDeliveryDetails && viewingWorkDelivery) {
      console.log('🔄 Loading work delivery from history:', workDeliveryDetails.deliveryNumber);
      
      // 🔒 ตั้งค่า flag เพื่อป้องกันการโหลดข้อมูลซ้ำ
      setIsLoadingFromHistory(true);
      
      // 🔄 ใช้ setTimeout เพื่อให้ state updates ทำงานเป็นลำดับ
      setTimeout(() => {
        // ขั้นที่ 1: ตั้งค่า deliveryDetails และ phases ก่อน
        setDeliveryDetails(workDeliveryDetails);
        setPhases(viewingWorkDelivery.phases as HouseConstructionPhase[]);
        
        // ขั้นที่ 2: ตั้งค่า formData
        const newFormData = {
          companyId: viewingWorkDelivery.companyId,
          customerId: viewingWorkDelivery.customerId,
          projectId: viewingWorkDelivery.projectId,
          workType: viewingWorkDelivery.workType,
          buildingType: viewingWorkDelivery.buildingType as 'single-story' | 'two-story' | undefined,
          currentPhase: viewingWorkDelivery.currentPhase,
          deliveryDate: viewingWorkDelivery.deliveryDate.toISOString().split('T')[0],
          additionalNotes: viewingWorkDelivery.additionalNotes || '',
        };
        setFormData(newFormData);

        // ขั้นที่ 3: ตั้งค่า relatedData
        const newRelatedData = {
          company: {
            id: viewingWorkDelivery.companyId,
            name: viewingWorkDelivery.companyName,
            address: viewingWorkDelivery.companyAddress,
            phone: viewingWorkDelivery.companyPhone,
            website: viewingWorkDelivery.companyWebsite,
            logoUrl: viewingWorkDelivery.companyLogoUrl,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          customer: {
            id: viewingWorkDelivery.customerId,
            name: viewingWorkDelivery.customerName,
            buyer: viewingWorkDelivery.buyer,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          project: {
            id: viewingWorkDelivery.projectId,
            name: viewingWorkDelivery.projectName,
            location: viewingWorkDelivery.projectLocation,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
        setRelatedData(newRelatedData);
        
        // ขั้นที่ 4: ตั้งค่าโลโก้หากมี
        if (viewingWorkDelivery.companyLogoUrl) {
          setLogoSrc(viewingWorkDelivery.companyLogoUrl);
        }

        console.log('✅ โหลดข้อมูลจาก history สำเร็จ:', {
          formData: newFormData,
          relatedData: newRelatedData
        });

        // 🔓 ปิด flag หลังจากโหลดเสร็จ
        setTimeout(() => {
          setIsLoadingFromHistory(false);
          console.log('🔓 ปิด loading flag - สามารถโหลด related data ปกติได้แล้ว');
        }, 200);
      }, 100);
    }
  }, [workDeliveryDetails, viewingWorkDelivery]);

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
      // ฟังก์ชันลบ undefined values ออกจาก object อย่างละเอียด
      const cleanObject = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return undefined;
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => cleanObject(item)).filter(item => item !== undefined);
        }
        
        if (typeof obj === 'object' && obj.constructor === Object) {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            const value = cleanObject(obj[key]);
            if (value !== undefined && value !== null && value !== '') {
              cleaned[key] = value;
            }
          });
          return Object.keys(cleaned).length > 0 ? cleaned : undefined;
        }
        
        return obj;
      };

      // ฟังก์ชันตรวจสอบความครบถ้วนของข้อมูล
      const validateRequiredFields = (data: any) => {
        const requiredFields = [
          'workType', 'companyId', 'companyName', 'customerId', 'customerName',
          'projectId', 'projectName', 'projectLocation', 'phases', 'deliveryDate'
        ];
        
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`ข้อมูลที่จำเป็นไม่ครบถ้วน: ${missingFields.join(', ')}`);
        }

        // ตรวจสอบงวดงาน
        if (!Array.isArray(data.phases) || data.phases.length === 0) {
          throw new Error('ต้องมีอย่างน้อย 1 งวดงาน');
        }

        // ตรวจสอบวันที่
        if (isNaN(Date.parse(data.deliveryDate))) {
          throw new Error('วันที่ส่งมอบไม่ถูกต้อง');
        }

        return true;
      };

      // เตรียมข้อมูลสำหรับบันทึก (ลบ undefined values)
      const rawWorkDeliveryData = {
        workType: formData.workType,
        buildingType: formData.buildingType,
        
        // ข้อมูลบริษัท
        companyId: formData.companyId,
        companyName: relatedData.company.name || '',
        companyAddress: relatedData.company.address || '',
        companyPhone: relatedData.company.phone || '',
        companyWebsite: relatedData.company.website || '',
        companyLogoUrl: relatedData.company.logoUrl,
        
        // ข้อมูลลูกค้า
        customerId: formData.customerId,
        customerName: relatedData.customer.name || '',
        buyer: relatedData.customer.buyer,
        
        // ข้อมูลโครงการ
        projectId: formData.projectId,
        projectName: relatedData.project.name || '',
        projectLocation: relatedData.project.location || '',
        
        // งวดงาน
        phases: phases,
        currentPhase: formData.currentPhase,
        
        // วันที่
        issueDate: new Date(),
        deliveryDate: new Date(formData.deliveryDate),
        
        // หมายเหตุ
        additionalNotes: formData.additionalNotes,
        
        // สถานะ
        status: 'draft',
        isActive: true
      };

      // ทำความสะอาดข้อมูลโดยลบฟิลด์ที่เป็น undefined
      const workDeliveryData = cleanObject(rawWorkDeliveryData);

      // Debug: ตรวจสอบข้อมูลก่อนและหลังทำความสะอาด
      console.log('🔍 ข้อมูลก่อนทำความสะอาด:', rawWorkDeliveryData);
      console.log('🧹 ข้อมูลหลังทำความสะอาด:', workDeliveryData);
      
      // ตรวจสอบว่ายังมี undefined values หรือไม่
      const hasUndefined = JSON.stringify(workDeliveryData).includes('undefined');
      if (hasUndefined) {
        console.error('❌ ยังมี undefined values ในข้อมูล:', workDeliveryData);
        throw new Error('ข้อมูลยังไม่ถูกต้อง มี undefined values');
      }

      // ตรวจสอบความครบถ้วนของข้อมูลก่อนบันทึก
      validateRequiredFields(workDeliveryData);

      console.log('✅ ข้อมูลที่จะบันทึก (ผ่านการตรวจสอบแล้ว):', workDeliveryData);

      // บันทึกลง Firestore
      const savedId = await FirestoreService.createWorkDelivery(workDeliveryData);
      
      console.log('✅ บันทึกสำเร็จ ID:', savedId);
      alert(`✅ บันทึกใบส่งมอบงวดงานเรียบร้อยแล้ว!\nID: ${savedId}`);

      // รีเซ็ตฟอร์มหลังบันทึกสำเร็จ
      setFormData({
        companyId: '',
        customerId: '',
        projectId: '',
        workType: 'house-construction',
        buildingType: undefined,
        currentPhase: 1,
        deliveryDate: '',
        additionalNotes: '',
      });
      setPhases([...defaultHouseConstructionPhases]);
      setDeliveryDetails(null);
      
    } catch (error) {
      console.error('Error generating work delivery:', error);
      alert('เกิดข้อผิดพลาดในการสร้างใบส่งมอบงวดงาน: ' + (error as Error).message);
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
      await exportWorkDeliveryToPDF(
        deliveryDetails.deliveryNumber,
        deliveryDetails,
        logoSrc
      );
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
          onPhaseTemplateChange={handlePhaseTemplateChange}
          logoSrc={logoSrc}
          logoSize={logoSize}
          onLogoSizeChange={handleLogoSizeChange}
          onGeneratePreview={generatePreviewManually}
        />
        
        <WorkDeliveryPreview
          deliveryDetails={deliveryDetails}
          logoSrc={logoSrc}
          logoSize={logoSize}
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
