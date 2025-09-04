import React, { useState, useEffect } from 'react';
import { Box, Flex, Card, Heading, Text, Button, Badge, TextArea } from '@radix-ui/themes';
import { WorkDelivery } from '../types/workDelivery';

interface WorkDeliveryHistoryProps {
  onViewDelivery?: (delivery: WorkDelivery) => void;
}

export const WorkDeliveryHistory: React.FC<WorkDeliveryHistoryProps> = ({
  onViewDelivery
}) => {
  const [deliveries, setDeliveries] = useState<WorkDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkType, setFilterWorkType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // โหลดข้อมูลใบส่งมอบงวดงาน
  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        // TODO: เพิ่ม Firestore Service สำหรับ Work Delivery
        // const deliveriesData = await FirestoreService.getWorkDeliveries();
        // setDeliveries(deliveriesData);
        
        // ข้อมูลจำลองสำหรับทดสอบ
        const mockDeliveries: WorkDelivery[] = [
          {
            id: '1',
            deliveryNumber: 'WD-HOUSE-001',
            workType: 'house-construction',
            companyId: 'comp1',
            companyName: 'บริษัท พรีคาสท์คอนกรีต จำกัด',
            companyAddress: '99/9 อาคารคอนกรีต ถนนพัฒนา แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
            companyPhone: '02-123-4567',
            companyWebsite: 'www.precast.co.th',
            customerId: 'cust1',
            customerName: 'คุณสมชาย รักบ้าน',
            buyer: 'นายสมชาย ใจดี',
            projectId: 'proj1',
            projectName: 'โครงการหมู่บ้านเจริญสุข',
            projectLocation: '123 หมู่ 4 ต.บางรัก อ.เมือง จ.นนทบุรี 11000',
            phases: [
              { phaseNumber: 1, name: 'เซ็นสัญญา', description: 'เซ็นสัญญาและทำข้อตกลง', isCompleted: true, completedDate: new Date('2024-01-15') },
              { phaseNumber: 2, name: 'ฐานราก,ตอม่อ', description: 'งานทำฐานรากและงานตอม่อ', isCompleted: true, completedDate: new Date('2024-02-01') },
              { phaseNumber: 3, name: 'คานคอดิน', description: 'งานสร้างคานคอดิน', isCompleted: false },
            ],
            currentPhase: 3,
            issueDate: new Date('2024-02-15'),
            deliveryDate: new Date('2024-02-20'),
            additionalNotes: 'โครงการบ้านเดี่ยว 2 ชั้น',
            status: 'delivered',
            isActive: true,
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-02-15'),
          },
          {
            id: '2',
            deliveryNumber: 'WD-PRECAST-001',
            workType: 'precast-concrete',
            companyId: 'comp1',
            companyName: 'บริษัท พรีคาสท์คอนกรีต จำกัด',
            companyAddress: '99/9 อาคารคอนกรีต ถนนพัฒนา แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
            companyPhone: '02-123-4567',
            companyWebsite: 'www.precast.co.th',
            customerId: 'cust2',
            customerName: 'คุณสมหญิง สร้างบ้าน',
            buyer: 'นางสาวสมหญิง สวยงาม',
            projectId: 'proj2',
            projectName: 'โครงการคอนโดมิเนียมสมัยใหม่',
            projectLocation: '456 ถนนรัชดา แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
            phases: [
              { phaseNumber: 1, name: 'เตรียมอุปกรณ์ในการสั่งผลิต', description: 'เตรียมอุปกรณ์และวัสดุสำหรับการสั่งผลิต', isCompleted: true, completedDate: new Date('2024-01-10') },
              { phaseNumber: 2, name: 'งานติดตั้งคานคอดิน', description: 'งานติดตั้งคานคอดิน', isCompleted: true, completedDate: new Date('2024-01-25') },
              { phaseNumber: 3, name: 'งานติดตั้งผนังชั้น 1', description: 'งานติดตั้งผนังชั้น 1', isCompleted: true, completedDate: new Date('2024-02-10') },
              { phaseNumber: 4, name: 'งานวางแผ่นพื้น,ผนังชั้น 2,บันไดชั้น 2', description: 'งานวางแผ่นพื้น ผนังชั้น 2 และบันไดชั้น 2', isCompleted: false },
              { phaseNumber: 5, name: 'เกร๊าปูน,เก็บรายละเอียด,ส่งมอบงานติดตั้ง', description: 'เกร๊าปูน เก็บรายละเอียด และส่งมอบงานติดตั้ง', isCompleted: false },
            ],
            currentPhase: 4,
            issueDate: new Date('2024-02-10'),
            deliveryDate: new Date('2024-02-15'),
            additionalNotes: 'โครงการ Precast บ้าน 2 ชั้น',
            status: 'accepted',
            isActive: true,
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-02-10'),
          }
        ];
        
        setDeliveries(mockDeliveries);
      } catch (error) {
        console.error('Error loading work deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  // กรองข้อมูล
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWorkType = filterWorkType === 'all' || delivery.workType === filterWorkType;
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    
    return matchesSearch && matchesWorkType && matchesStatus;
  });

  // จัดการดูรายละเอียด
  const handleViewDelivery = (delivery: WorkDelivery) => {
    if (onViewDelivery) {
      onViewDelivery(delivery);
    }
  };

  // คำนวณความคืบหน้า
  const calculateProgress = (phases: any[]) => {
    const completedPhases = phases.filter(phase => phase.isCompleted).length;
    return phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0;
  };

  // สีของสถานะ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'delivered': return 'blue';
      case 'accepted': return 'green';
      case 'completed': return 'emerald';
      default: return 'gray';
    }
  };

  // ข้อความสถานะ
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'ร่าง';
      case 'delivered': return 'ส่งมอบแล้ว';
      case 'accepted': return 'รับทราบแล้ว';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  // ข้อความประเภทงาน
  const getWorkTypeText = (workType: string) => {
    switch (workType) {
      case 'house-construction': return 'งานรับสร้างบ้าน';
      case 'precast-concrete': return 'งาน Precast Concrete';
      default: return workType;
    }
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
          ประวัติใบส่งมอบงวดงาน
        </Heading>
        <Text size="3" style={{ color: 'var(--gray-11)' }}>
          ดูและจัดการประวัติใบส่งมอบงวดงานทั้งหมด
        </Text>
      </Box>

      {/* ตัวกรองและค้นหา */}
      <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <Flex direction={{ initial: 'column', md: 'row' }} gap="4" align="end">
          <Box style={{ flex: 1 }}>
            <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              ค้นหา
            </Text>
            <input
              type="text"
              placeholder="ค้นหาหมายเลข, ลูกค้า, หรือโครงการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-7)',
                fontSize: '14px'
              }}
            />
          </Box>
          
          <Box>
            <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              ประเภทงาน
            </Text>
            <select
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-7)',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="house-construction">งานรับสร้างบ้าน</option>
              <option value="precast-concrete">งาน Precast Concrete</option>
            </select>
          </Box>
          
          <Box>
            <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              สถานะ
            </Text>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-7)',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="draft">ร่าง</option>
              <option value="delivered">ส่งมอบแล้ว</option>
              <option value="accepted">รับทราบแล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </Box>
        </Flex>
      </Card>

      {/* รายการใบส่งมอบ */}
      {filteredDeliveries.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <Text size="4" color="gray">
            {searchTerm || filterWorkType !== 'all' || filterStatus !== 'all' 
              ? 'ไม่พบข้อมูลที่ตรงกับการค้นหา' 
              : 'ยังไม่มีประวัติใบส่งมอบงวดงาน'}
          </Text>
        </Card>
      ) : (
        <Flex direction="column" gap="4">
          {filteredDeliveries.map((delivery) => {
            const progress = calculateProgress(delivery.phases);
            
            return (
              <Card key={delivery.id} style={{ padding: '1.5rem' }}>
                <Flex justify="between" align="start" mb="4">
                  <Box style={{ flex: 1 }}>
                    <Flex align="center" gap="3" mb="2">
                      <Heading as="h3" size="4">
                        {delivery.deliveryNumber}
                      </Heading>
                      <Badge color={getStatusColor(delivery.status)} size="2">
                        {getStatusText(delivery.status)}
                      </Badge>
                      <Badge color="blue" size="2">
                        {getWorkTypeText(delivery.workType)}
                      </Badge>
                    </Flex>
                    
                    <Text size="3" mb="1" weight="medium">
                      {delivery.customerName} - {delivery.projectName}
                    </Text>
                    <Text size="2" color="gray" mb="2">
                      {delivery.projectLocation}
                    </Text>
                    
                    <Flex align="center" gap="4" mb="3">
                      <Text size="2">
                        <strong>วันที่ออก:</strong> {delivery.issueDate.toLocaleDateString('th-TH')}
                      </Text>
                      <Text size="2">
                        <strong>วันที่ส่งมอบ:</strong> {delivery.deliveryDate.toLocaleDateString('th-TH')}
                      </Text>
                      <Text size="2">
                        <strong>งวดปัจจุบัน:</strong> งวดที่ {delivery.currentPhase}
                      </Text>
                    </Flex>

                    {/* ความคืบหน้า */}
                    <Box mb="3">
                      <Flex align="center" justify="between" mb="1">
                        <Text size="2" weight="medium">ความคืบหน้า</Text>
                        <Text size="2">{progress}%</Text>
                      </Flex>
                      <Box
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'var(--gray-4)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: 
                              progress === 100 ? 'var(--green-9)' : 
                              progress >= 50 ? 'var(--yellow-9)' : 'var(--red-9)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>

                    {delivery.additionalNotes && (
                      <Text size="2" color="gray" style={{ fontStyle: 'italic' }}>
                        หมายเหตุ: {delivery.additionalNotes}
                      </Text>
                    )}
                  </Box>
                  
                  <Flex direction="column" gap="2" style={{ minWidth: '120px' }}>
                    <Button
                      size="2"
                      variant="soft"
                      onClick={() => handleViewDelivery(delivery)}
                    >
                      ดูรายละเอียด
                    </Button>
                    
                    <Button
                      size="2"
                      variant="ghost"
                      onClick={() => {
                        console.log('Export delivery:', delivery.deliveryNumber);
                        alert('ฟีเจอร์ส่งออก PDF จะเพิ่มในขั้นตอนถัดไป');
                      }}
                    >
                      ส่งออก PDF
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}
    </Box>
  );
};
