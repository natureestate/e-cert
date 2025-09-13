import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card,
  Badge,
  Dialog,
  TextField,
  TextArea,
  Select,
  Tabs,
  Grid,
  IconButton,
  Table
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  Pencil1Icon, 
  TrashIcon, 
  CopyIcon, 
  Cross2Icon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@radix-ui/react-icons';
import { FirestoreService } from '../services/firestoreService';
import { PhaseTemplateFirestore, WorkType, HouseConstructionPhase } from '../types/workDelivery';

interface PhaseData {
  phaseNumber: number;
  name: string;
  description: string;
  isCompleted: boolean;
  completedDate?: Date;
  notes?: string;
}

interface FormData {
  name: string;
  workType: WorkType;
  buildingType?: 'single-story' | 'two-story';
  description: string;
  phases: PhaseData[];
}

export const PhaseManagement: React.FC = () => {
  const [templates, setTemplates] = useState<PhaseTemplateFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PhaseTemplateFirestore | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    workType: 'house-construction',
    buildingType: undefined,
    description: '',
    phases: []
  });

  // โหลดข้อมูลเทมเพลต
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templateData = await FirestoreService.getPhaseTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลเทมเพลต');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // สร้างเทมเพลตเริ่มต้น
  const handleInitializeDefaults = async () => {
    try {
      await FirestoreService.initializeDefaultPhaseTemplates();
      alert('สร้างเทมเพลตเริ่มต้นเรียบร้อยแล้ว');
      loadTemplates();
    } catch (error) {
      console.error('Error initializing defaults:', error);
      alert('เกิดข้อผิดพลาดในการสร้างเทมเพลตเริ่มต้น');
    }
  };

  // ลบเทมเพลต
  const handleDeleteTemplate = async (template: PhaseTemplateFirestore) => {
    if (!confirm(`คุณต้องการลบเทมเพลต "${template.name}" หรือไม่?`)) {
      return;
    }

    try {
      await FirestoreService.deletePhaseTemplate(template.id);
      alert('ลบเทมเพลตเรียบร้อยแล้ว');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('เกิดข้อผิดพลาดในการลบเทมเพลต');
    }
  };

  // เปิด dialog สร้างใหม่
  const handleCreateNew = () => {
    setFormData({
      name: '',
      workType: 'house-construction',
      buildingType: undefined,
      description: '',
      phases: []
    });
    setIsCreateDialogOpen(true);
  };

  // เปิด dialog แก้ไข
  const handleEdit = (template: PhaseTemplateFirestore) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      workType: template.workType,
      buildingType: template.buildingType,
      description: template.description || '',
      phases: template.phases.map(phase => ({
        phaseNumber: phase.phaseNumber,
        name: phase.name,
        description: phase.description,
        isCompleted: false,
        completedDate: undefined,
        notes: undefined
      }))
    });
    setIsEditDialogOpen(true);
  };

  // คัดลอกเทมเพลต
  const handleCopy = (template: PhaseTemplateFirestore) => {
    setFormData({
      name: `${template.name} (คัดลอก)`,
      workType: template.workType,
      buildingType: template.buildingType,
      description: template.description || '',
      phases: template.phases.map(phase => ({
        phaseNumber: phase.phaseNumber,
        name: phase.name,
        description: phase.description,
        isCompleted: false,
        completedDate: undefined,
        notes: undefined
      }))
    });
    setIsCreateDialogOpen(true);
  };

  // บันทึกเทมเพลต
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อเทมเพลต');
      return;
    }

    if (formData.phases.length === 0) {
      alert('กรุณาเพิ่มงวดงานอย่างน้อย 1 งวด');
      return;
    }

    try {
      const templateData = {
        name: formData.name.trim(),
        workType: formData.workType,
        buildingType: formData.buildingType,
        description: formData.description.trim(),
        phases: formData.phases,
        isActive: true,
        isDefault: false
      };

      if (editingTemplate) {
        // แก้ไขเทมเพลต
        await FirestoreService.updatePhaseTemplate(editingTemplate.id, templateData);
        alert('แก้ไขเทมเพลตเรียบร้อยแล้ว');
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
      } else {
        // สร้างเทมเพลตใหม่
        await FirestoreService.createPhaseTemplate(templateData);
        alert('สร้างเทมเพลตเรียบร้อยแล้ว');
        setIsCreateDialogOpen(false);
      }

      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกเทมเพลต');
    }
  };

  // เพิ่มงวดงาน
  const handleAddPhase = () => {
    const newPhase: PhaseData = {
      phaseNumber: formData.phases.length + 1,
      name: '',
      description: '',
      isCompleted: false
    };
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase]
    }));
  };

  // ลบงวดงาน
  const handleRemovePhase = (index: number) => {
    const newPhases = formData.phases.filter((_, i) => i !== index);
    // อัปเดตหมายเลขงวด
    const updatedPhases = newPhases.map((phase, i) => ({
      ...phase,
      phaseNumber: i + 1
    }));
    setFormData(prev => ({
      ...prev,
      phases: updatedPhases
    }));
  };

  // อัปเดตข้อมูลงวดงาน
  const handlePhaseChange = (index: number, field: keyof PhaseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  // เลื่อนงวดงาน
  const handleMovePhase = (index: number, direction: 'up' | 'down') => {
    const newPhases = [...formData.phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPhases.length) return;
    
    // Swap phases
    [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
    
    // อัปเดตหมายเลขงวด
    const updatedPhases = newPhases.map((phase, i) => ({
      ...phase,
      phaseNumber: i + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      phases: updatedPhases
    }));
  };

  const getWorkTypeLabel = (workType: WorkType) => {
    return workType === 'house-construction' ? 'งานรับสร้างบ้าน' : 'งาน Precast Concrete';
  };

  const getBuildingTypeLabel = (buildingType?: 'single-story' | 'two-story') => {
    if (!buildingType) return '';
    return buildingType === 'single-story' ? 'บ้าน 1 ชั้น' : 'บ้าน 2 ชั้น';
  };

  if (loading) {
    return (
      <Box style={{ padding: '2rem', textAlign: 'center' }}>
        <Text>กำลังโหลดข้อมูล...</Text>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Box 
        style={{ 
          background: 'linear-gradient(135deg, var(--purple-1), var(--white))',
          borderBottom: '1px solid var(--purple-6)',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          borderRadius: '8px'
        }}
      >
        <Heading as="h1" size="7" mb="3" style={{ color: 'var(--gray-12)' }}>
          จัดการงวดงาน
        </Heading>
        <Text size="3" style={{ color: 'var(--gray-11)' }}>
          สร้างและจัดการเทมเพลตงวดงานสำหรับใบส่งมอบงาน
        </Text>
      </Box>

      {/* Actions */}
      <Flex gap="3" mb="4" justify="between" align="center">
        <Flex gap="3">
          <Button onClick={handleCreateNew}>
            <PlusIcon width="16" height="16" />
            สร้างเทมเพลตใหม่
          </Button>
          {templates.length === 0 && (
            <Button onClick={handleInitializeDefaults} variant="soft">
              สร้างเทมเพลตเริ่มต้น
            </Button>
          )}
        </Flex>
        <Text size="2" color="gray">
          มีเทมเพลตทั้งหมด {templates.length} รายการ
        </Text>
      </Flex>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <Text size="4" weight="medium" mb="2" style={{ display: 'block' }}>
            ยังไม่มีเทมเพลตงวดงาน
          </Text>
          <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
            เริ่มต้นด้วยการสร้างเทมเพลตเริ่มต้น
          </Text>
          <Button onClick={handleInitializeDefaults}>
            สร้างเทมเพลตเริ่มต้น
          </Button>
        </Card>
      ) : (
        <Box style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))', 
          gap: '1.5rem' 
        }}>
          {templates.map((template) => (
            <Card key={template.id} style={{ padding: '1.5rem' }}>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="start">
                  <Box style={{ flex: 1 }}>
                    <Flex align="center" gap="2" mb="2">
                      <Text size="4" weight="medium">
                        {template.name}
                      </Text>
                      {template.isDefault && (
                        <Badge color="blue" size="1">เริ่มต้น</Badge>
                      )}
                    </Flex>
                    <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
                      {getWorkTypeLabel(template.workType)}
                      {template.buildingType && ` - ${getBuildingTypeLabel(template.buildingType)}`}
                    </Text>
                    {template.description && (
                      <Text size="2" color="gray">
                        {template.description}
                      </Text>
                    )}
                  </Box>
                </Flex>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    งวดงาน ({template.phases.length} งวด):
                  </Text>
                  <Box style={{ maxHeight: '150px', overflow: 'auto' }}>
                    {template.phases.slice(0, 5).map((phase, index) => (
                      <Text key={index} size="1" color="gray" style={{ display: 'block', marginBottom: '2px' }}>
                        {phase.phaseNumber}. {phase.name}
                      </Text>
                    ))}
                    {template.phases.length > 5 && (
                      <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                        ... และอีก {template.phases.length - 5} งวด
                      </Text>
                    )}
                  </Box>
                </Box>

                <Flex gap="2" mt="2">
                  <Button 
                    size="2" 
                    variant="soft" 
                    onClick={() => handleEdit(template)}
                  >
                    <Pencil1Icon width="14" height="14" />
                    แก้ไข
                  </Button>
                  <Button 
                    size="2" 
                    variant="soft" 
                    onClick={() => handleCopy(template)}
                  >
                    <CopyIcon width="14" height="14" />
                    คัดลอก
                  </Button>
                  {!template.isDefault && (
                    <Button 
                      size="2" 
                      variant="soft" 
                      color="red" 
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <TrashIcon width="14" height="14" />
                      ลบ
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog.Root open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingTemplate(null);
        }
      }}>
        <Dialog.Content style={{ 
          maxWidth: 'min(800px, 95vw)', 
          maxHeight: '90vh', 
          overflow: 'auto',
          width: '100%'
        }}>
          <Dialog.Title>
            {editingTemplate ? 'แก้ไขเทมเพลตงวดงาน' : 'สร้างเทมเพลตงวดงานใหม่'}
          </Dialog.Title>
          <Dialog.Description>
            จัดการงวดงานสำหรับใบส่งมอบงาน
          </Dialog.Description>

          <Flex direction="column" gap="4" mt="4">
            {/* Basic Information */}
            <Box>
              <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                ชื่อเทมเพลต <span style={{ color: 'red' }}>*</span>
              </Text>
              <TextField.Root
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="เช่น บ้าน 2 ชั้น แบบมาตรฐาน"
              />
            </Box>

            <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
              <Box style={{ flex: 1 }}>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  ประเภทงาน <span style={{ color: 'red' }}>*</span>
                </Text>
                <Select.Root
                  value={formData.workType}
                  onValueChange={(value: WorkType) => setFormData(prev => ({ ...prev, workType: value }))}
                >
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="house-construction">งานรับสร้างบ้าน</Select.Item>
                    <Select.Item value="precast-concrete">งาน Precast Concrete</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              {formData.workType === 'house-construction' && (
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                    ประเภทบ้าน
                  </Text>
                  <Select.Root
                    value={formData.buildingType || ''}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      buildingType: value as 'single-story' | 'two-story' | undefined 
                    }))}
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="">ไม่ระบุ</Select.Item>
                      <Select.Item value="single-story">บ้าน 1 ชั้น</Select.Item>
                      <Select.Item value="two-story">บ้าน 2 ชั้น</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              )}
            </Flex>

            <Box>
              <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                คำอธิบาย
              </Text>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับเทมเพลตนี้"
                rows={3}
              />
            </Box>

            {/* Phases Management */}
            <Box>
              <Flex align="center" justify="between" mb="3" direction={{ initial: 'column', sm: 'row' }} gap="2">
                <Text size="3" weight="medium">
                  งวดงาน ({formData.phases.length} งวด)
                </Text>
                <Button size="2" onClick={handleAddPhase} style={{ width: { initial: '100%', sm: 'auto' } }}>
                  <PlusIcon width="14" height="14" />
                  เพิ่มงวด
                </Button>
              </Flex>

              {formData.phases.length === 0 ? (
                <Card style={{ padding: '2rem', textAlign: 'center' }}>
                  <Text size="2" color="gray">
                    ยังไม่มีงวดงาน คลิก "เพิ่มงวด" เพื่อเริ่มต้น
                  </Text>
                </Card>
              ) : (
                <Box style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid var(--gray-6)', borderRadius: '8px' }}>
                  <Table.Root size="2">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell style={{ width: '60px', minWidth: '60px' }}>งวด</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ minWidth: '150px' }}>ชื่องาน</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ minWidth: '150px' }}>คำอธิบาย</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '120px', minWidth: '120px' }}>จัดการ</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {formData.phases.map((phase, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>
                            <Text size="2" weight="medium">{phase.phaseNumber}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root
                              value={phase.name}
                              onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                              placeholder="ชื่องวดงาน"
                              size="1"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root
                              value={phase.description}
                              onChange={(e) => handlePhaseChange(index, 'description', e.target.value)}
                              placeholder="คำอธิบาย"
                              size="1"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <IconButton
                                size="1"
                                variant="ghost"
                                onClick={() => handleMovePhase(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUpIcon width="12" height="12" />
                              </IconButton>
                              <IconButton
                                size="1"
                                variant="ghost"
                                onClick={() => handleMovePhase(index, 'down')}
                                disabled={index === formData.phases.length - 1}
                              >
                                <ArrowDownIcon width="12" height="12" />
                              </IconButton>
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() => handleRemovePhase(index)}
                              >
                                <Cross2Icon width="12" height="12" />
                              </IconButton>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>
          </Flex>

          <Flex gap="3" mt="6" justify="end" direction={{ initial: 'column', sm: 'row' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray" style={{ width: { initial: '100%', sm: 'auto' } }}>
                ปิด
              </Button>
            </Dialog.Close>
            <Button onClick={handleSave} style={{ width: { initial: '100%', sm: 'auto' } }}>
              <CheckIcon width="16" height="16" />
              {editingTemplate ? 'บันทึกการแก้ไข' : 'สร้างเทมเพลต'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Note */}
      <Box mt="6" p="4" style={{ backgroundColor: 'var(--green-2)', borderRadius: '8px', border: '1px solid var(--green-6)' }}>
        <Text size="2" color="green">
          ✅ <strong>ระบบจัดการงวดงาน:</strong> ตอนนี้คุณสามารถสร้าง แก้ไข และจัดการเทมเพลตงวดงานได้แล้ว 
          เทมเพลตที่สร้างจะใช้ในการสร้างใบส่งมอบงานได้ทันที
        </Text>
      </Box>
    </Box>
  );
};