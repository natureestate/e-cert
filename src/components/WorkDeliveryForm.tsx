import React, { useState, useEffect } from 'react';
import { Box, Flex, Card, Heading, Text, Button, Select, TextArea } from '@radix-ui/themes';
import { FormSelect } from './FormSelect';
import { FirestoreService } from '../services/firestoreService';
import { Company, Customer, Project } from '../types/firestore';
import { WorkType, PhaseTemplate, phaseTemplates, HouseConstructionPhase, PrecastPhase } from '../types/workDelivery';

interface WorkDeliveryFormData {
  companyId: string;
  customerId: string;
  projectId: string;
  workType: WorkType;
  buildingType?: 'single-story' | 'two-story'; // สำหรับงานรับสร้างบ้าน
  currentPhase: number;
  deliveryDate: string;
  additionalNotes: string;
}

interface WorkDeliveryFormProps {
  formData: WorkDeliveryFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onWorkTypeChange: (workType: WorkType) => void;
  onBuildingTypeChange: (buildingType: 'single-story' | 'two-story') => void;
  onPhaseToggle: (phaseIndex: number, isCompleted: boolean, notes?: string) => void;
  phases: (HouseConstructionPhase | PrecastPhase)[];
  onGenerate: () => void;
  isFormValid: boolean;
  isViewingMode?: boolean;
}

export const WorkDeliveryForm: React.FC<WorkDeliveryFormProps> = ({
  formData,
  onFormChange,
  onWorkTypeChange,
  onBuildingTypeChange,
  onPhaseToggle,
  phases,
  onGenerate,
  isFormValid,
  isViewingMode = false
}) => {
  // State สำหรับ dropdown options
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, customersData, projectsData] = await Promise.all([
          FirestoreService.getCompanies(),
          FirestoreService.getCustomers(),
          FirestoreService.getProjects()
        ]);
        
        // Data loaded successfully
        
        setCompanies(companiesData);
        setCustomers(customersData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // กรองโครงการตามลูกค้าที่เลือก
  useEffect(() => {
    if (formData.customerId) {
      const filtered = projects.filter(p => p.customerId === formData.customerId);
      setFilteredProjects(filtered);
      
      // ล้างการเลือกโครงการหากโครงการที่เลือกไว้ไม่ตรงกับลูกค้าใหม่
      if (formData.projectId && !filtered.some(p => p.id === formData.projectId)) {
        onFormChange({ target: { name: 'projectId', value: '' } } as any);
      }
    } else {
      setFilteredProjects(projects);
    }
  }, [formData.customerId, projects]);

  // จัดการการเปลี่ยนประเภทงาน
  const handleWorkTypeChange = (value: string) => {
    const workType = value as WorkType;
    onWorkTypeChange(workType);
  };

  // จัดการการเปลี่ยนประเภทอาคาร
  const handleBuildingTypeChange = (value: string) => {
    const buildingType = value as 'single-story' | 'two-story';
    onBuildingTypeChange(buildingType);
  };

  // ตัวเลือกประเภทงาน
  const workTypeOptions = [
    { value: 'house-construction', label: 'งานรับสร้างบ้าน' },
    { value: 'precast-concrete', label: 'งาน Precast Concrete' }
  ];

  // ตัวเลือกประเภทอาคาร (สำหรับงานรับสร้างบ้าน)
  const buildingTypeOptions = [
    { value: 'single-story', label: 'บ้าน 1 ชั้น' },
    { value: 'two-story', label: 'บ้าน 2 ชั้น' }
  ];

  if (loading) {
    return (
      <Card style={{ padding: '2rem' }}>
        <Text>กำลังโหลดข้อมูล...</Text>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '2rem', flex: 1 }}>
      <Heading as="h2" size="6" mb="4">
        {isViewingMode ? 'รายละเอียดใบส่งมอบงวดงาน' : 'สร้างใบส่งมอบงวดงาน'}
      </Heading>

      <Box mb="6">
        <Flex direction="column" gap="4">
          {/* ข้อมูลพื้นฐาน */}
          <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
            <Box style={{ flex: 1 }}>
              <FormSelect
                label="บริษัท *"
                name="companyId"
                value={formData.companyId}
                onChange={onFormChange}
                options={companies.map(c => ({ value: c.id, label: c.name }))}
                placeholder="เลือกบริษัท"
                disabled={isViewingMode}
              />
            </Box>
            
            <Box style={{ flex: 1 }}>
              <FormSelect
                label="ลูกค้า *"
                name="customerId"
                value={formData.customerId}
                onChange={onFormChange}
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                placeholder="เลือกลูกค้า"
                disabled={isViewingMode}
              />
            </Box>
          </Flex>

          <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
            <Box style={{ flex: 1 }}>
              <FormSelect
                label="โครงการ *"
                name="projectId"
                value={formData.projectId}
                onChange={onFormChange}
                options={filteredProjects.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` }))}
                placeholder={formData.customerId ? "เลือกโครงการ" : "กรุณาเลือกลูกค้าก่อน"}
                disabled={isViewingMode || !formData.customerId}
              />
            </Box>
            
            <Box style={{ flex: 1 }}>
              <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                ประเภทงาน *
              </Text>
              <Select.Root
                value={formData.workType}
                onValueChange={handleWorkTypeChange}
                disabled={isViewingMode}
              >
                <Select.Trigger style={{ width: '100%' }} placeholder="เลือกประเภทงาน" />
                <Select.Content>
                  {workTypeOptions.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          {/* ตัวเลือกประเภทอาคาร (แสดงเฉพาะงานรับสร้างบ้าน) */}
          {formData.workType === 'house-construction' && (
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                ประเภทอาคาร *
              </Text>
              <Select.Root
                value={formData.buildingType || ''}
                onValueChange={handleBuildingTypeChange}
                disabled={isViewingMode}
              >
                <Select.Trigger style={{ width: '100%' }} placeholder="เลือกประเภทอาคาร" />
                <Select.Content>
                  {buildingTypeOptions.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}

          {/* วันที่ส่งมอบ */}
          <Box>
            <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              วันที่ส่งมอบ *
            </Text>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={onFormChange}
              disabled={isViewingMode}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-7)',
                fontSize: '14px'
              }}
            />
          </Box>

          {/* หมายเหตุเพิ่มเติม */}
          <Box>
            <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              หมายเหตุเพิ่มเติม
            </Text>
            <TextArea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={onFormChange}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              disabled={isViewingMode}
              rows={3}
              style={{ width: '100%' }}
            />
          </Box>
        </Flex>
      </Box>

      {/* รายการงวดงาน */}
      {phases.length > 0 && (
        <Box mb="6">
          <Heading as="h3" size="4" mb="4">
            รายการงวดงาน ({phases.length} งวด)
          </Heading>
          
          <Flex direction="column" gap="3">
            {phases.map((phase, index) => (
              <Card key={index} style={{ padding: '1rem' }}>
                <Flex align="center" justify="between" mb="2">
                  <Flex align="center" gap="3">
                    <Box
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: phase.isCompleted ? 'var(--green-9)' : 'var(--gray-6)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {phase.phaseNumber}
                    </Box>
                    <Box>
                      <Text weight="medium" size="3">
                        {phase.name}
                      </Text>
                      <Text size="2" color="gray">
                        {phase.description}
                      </Text>
                    </Box>
                  </Flex>
                  
                  {!isViewingMode && (
                    <Button
                      variant={phase.isCompleted ? "solid" : "soft"}
                      color={phase.isCompleted ? "green" : "gray"}
                      size="2"
                      onClick={() => onPhaseToggle(index, !phase.isCompleted)}
                    >
                      {phase.isCompleted ? '✓ เสร็จแล้ว' : 'ทำเครื่องหมายเสร็จ'}
                    </Button>
                  )}
                </Flex>
                
                {phase.isCompleted && (
                  <Box mt="2" p="2" style={{ backgroundColor: 'var(--green-2)', borderRadius: '6px' }}>
                    <Text size="2" color="green">
                      ✓ เสร็จสิ้นแล้ว
                      {phase.completedDate && (
                        <span> - {new Date(phase.completedDate).toLocaleDateString('th-TH')}</span>
                      )}
                    </Text>
                    {phase.notes && (
                      <Text size="2" style={{ display: 'block', marginTop: '4px' }}>
                        หมายเหตุ: {phase.notes}
                      </Text>
                    )}
                  </Box>
                )}
              </Card>
            ))}
          </Flex>
        </Box>
      )}

      {/* ปุ่มดำเนินการ */}
      {!isViewingMode && (
        <Flex justify="end" gap="3">
          <Button
            size="3"
            onClick={onGenerate}
            disabled={!isFormValid}
            style={{
              backgroundColor: isFormValid ? 'var(--green-9)' : 'var(--gray-6)',
              color: 'white'
            }}
          >
            บันทึกใบส่งมอบ
          </Button>
        </Flex>
      )}
    </Card>
  );
};
