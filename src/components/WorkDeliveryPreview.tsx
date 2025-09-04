import React from 'react';
import { Box, Flex, Card, Heading, Text, Button, Badge } from '@radix-ui/themes';
import { WorkDeliveryDetails, HouseConstructionPhase, PrecastPhase } from '../types/workDelivery';

interface WorkDeliveryPreviewProps {
  deliveryDetails: WorkDeliveryDetails | null;
  logoSrc?: string | null;
  logoSize?: 'small' | 'medium' | 'large';
  onExportPDF?: () => void;
  onPrint?: () => void;
  isExporting?: boolean;
  isPrinting?: boolean;
  editable?: boolean;
  onRefreshPreview?: () => void;
}

export const WorkDeliveryPreview: React.FC<WorkDeliveryPreviewProps> = ({
  deliveryDetails,
  logoSrc,
  logoSize = 'medium',
  onExportPDF,
  onPrint,
  isExporting = false,
  isPrinting = false,
  editable = true,
  onRefreshPreview
}) => {
  
  // กำหนดขนาดโลโก้
  const getLogoSizeInPx = () => {
    switch (logoSize) {
      case 'small': return { width: '60px', height: '60px' };
      case 'large': return { width: '120px', height: '120px' };
      default: return { width: '80px', height: '80px' }; // medium
    }
  };

  // นับจำนวนงวดที่เสร็จแล้ว
  const completedPhases = deliveryDetails?.phases.filter(phase => phase.isCompleted).length || 0;
  const totalPhases = deliveryDetails?.phases.length || 0;
  const completionPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  if (!deliveryDetails) {
    return (
      <Card style={{ padding: '2rem', flex: 1, textAlign: 'center' }}>
        <Text size="4" color="gray">
          กรุณากรอกข้อมูลให้ครบถ้วนเพื่อแสดงตัวอย่างใบส่งมอบงวดงาน
        </Text>
      </Card>
    );
  }

  return (
    <Box style={{ flex: 1 }}>
      {/* ปุ่มควบคุม */}
      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <Flex justify="between" align="center">
          <Heading as="h3" size="4">
            ตัวอย่างใบส่งมอบงวดงาน
          </Heading>
          
          <Flex gap="2">
            {editable && onRefreshPreview && (
              <Button 
                variant="soft" 
                size="2"
                onClick={onRefreshPreview}
              >
                🔄 รีเฟรช
              </Button>
            )}
            
            {onPrint && (
              <Button 
                variant="soft" 
                size="2"
                onClick={onPrint}
                disabled={isPrinting}
              >
                {isPrinting ? '⏳ กำลังพิมพ์...' : '🖨️ พิมพ์'}
              </Button>
            )}
            
            {onExportPDF && (
              <Button 
                size="2"
                onClick={onExportPDF}
                disabled={isExporting}
                style={{ 
                  backgroundColor: 'var(--blue-9)', 
                  color: 'white' 
                }}
              >
                {isExporting ? '⏳ กำลังส่งออก...' : '📄 ส่งออก PDF'}
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* ใบส่งมอบงวดงาน */}
      <Card 
        id="work-delivery-preview"
        style={{ 
          padding: '2rem',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        {/* หัวกระดาษ */}
        <Flex align="center" justify="between" mb="6">
          {/* โลโก้บริษัท */}
          {logoSrc && (
            <Box style={{ flexShrink: 0 }}>
              <img 
                src={logoSrc} 
                alt="โลโก้บริษัท" 
                style={{ 
                  ...getLogoSizeInPx(),
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '2px solid var(--gray-6)'
                }} 
              />
            </Box>
          )}
          
          <Box style={{ textAlign: logoSrc ? 'left' : 'center', flex: 1, marginLeft: logoSrc ? '1rem' : '0' }}>
            <Heading as="h1" size="6" mb="2" style={{ color: 'var(--blue-12)' }}>
              ใบส่งมอบงวดงาน
            </Heading>
            <Text size="3" weight="medium" style={{ color: 'var(--gray-11)' }}>
              หมายเลข: {deliveryDetails.deliveryNumber}
            </Text>
          </Box>
        </Flex>

        {/* ข้อมูลบริษัท */}
        <Box mb="6" p="4" style={{ backgroundColor: 'var(--blue-2)', borderRadius: '8px' }}>
          <Heading as="h2" size="4" mb="3" style={{ color: 'var(--blue-12)' }}>
            ข้อมูลบริษัท
          </Heading>
          <Text as="div" size="3" mb="1" weight="bold" style={{ color: 'var(--blue-11)' }}>
            {deliveryDetails.companyName}
          </Text>
          <Text as="div" size="2" mb="1" style={{ color: 'var(--gray-11)' }}>
            ที่อยู่: {deliveryDetails.companyAddress}
          </Text>
          <Text as="div" size="2" mb="1" style={{ color: 'var(--gray-11)' }}>
            โทรศัพท์: {deliveryDetails.companyPhone}
          </Text>
          {deliveryDetails.companyWebsite && (
            <Text as="div" size="2" style={{ color: 'var(--gray-11)' }}>
              เว็บไซต์: {deliveryDetails.companyWebsite}
            </Text>
          )}
        </Box>

        {/* ข้อมูลลูกค้าและโครงการ */}
        <Flex direction={{ initial: 'column', md: 'row' }} gap="4" mb="6">
          <Card style={{ flex: 1, padding: '1rem' }}>
            <Heading as="h3" size="3" mb="3" style={{ color: 'var(--green-11)' }}>
              ข้อมูลลูกค้า
            </Heading>
            <Text as="div" size="3" mb="1" weight="medium">
              {deliveryDetails.customerName}
            </Text>
            {deliveryDetails.buyer && (
              <Text as="div" size="2" style={{ color: 'var(--gray-11)' }}>
                ผู้ซื้อ: {deliveryDetails.buyer}
              </Text>
            )}
          </Card>
          
          <Card style={{ flex: 1, padding: '1rem' }}>
            <Heading as="h3" size="3" mb="3" style={{ color: 'var(--purple-11)' }}>
              ข้อมูลโครงการ
            </Heading>
            <Text as="div" size="3" mb="1" weight="medium">
              {deliveryDetails.projectNameAndLocation}
            </Text>
          </Card>
        </Flex>

        {/* ข้อมูลงาน */}
        <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
          <Flex align="center" justify="between" mb="3">
            <Heading as="h3" size="4" style={{ color: 'var(--indigo-11)' }}>
              รายละเอียดงาน
            </Heading>
            <Badge color="blue" size="2">
              {deliveryDetails.workType === 'house-construction' ? 'งานรับสร้างบ้าน' : 'งาน Precast Concrete'}
            </Badge>
          </Flex>
          
          <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" mb="1" style={{ color: 'var(--gray-11)' }}>
                วันที่ออกใบส่งมอบ:
              </Text>
              <Text size="3">{deliveryDetails.issueDate}</Text>
            </Box>
            
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" mb="1" style={{ color: 'var(--gray-11)' }}>
                วันที่ส่งมอบ:
              </Text>
              <Text size="3">{deliveryDetails.deliveryDate}</Text>
            </Box>
            
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" mb="1" style={{ color: 'var(--gray-11)' }}>
                งวดปัจจุบัน:
              </Text>
              <Text size="3">งวดที่ {deliveryDetails.currentPhase}</Text>
            </Box>
          </Flex>
        </Card>

        {/* ความคืบหน้างาน */}
        <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
          <Flex align="center" justify="between" mb="3">
            <Heading as="h3" size="4" style={{ color: 'var(--green-11)' }}>
              ความคืบหน้างาน
            </Heading>
            <Badge 
              color={completionPercentage === 100 ? "green" : completionPercentage >= 50 ? "yellow" : "red"} 
              size="2"
            >
              {completionPercentage}% เสร็จสิ้น
            </Badge>
          </Flex>
          
          {/* Progress Bar */}
          <Box mb="3">
            <Box
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--gray-4)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <Box
                style={{
                  width: `${completionPercentage}%`,
                  height: '100%',
                  backgroundColor: 
                    completionPercentage === 100 ? 'var(--green-9)' : 
                    completionPercentage >= 50 ? 'var(--yellow-9)' : 'var(--red-9)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
          
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            เสร็จสิ้นแล้ว {completedPhases} จาก {totalPhases} งวด
          </Text>
        </Card>

        {/* รายการงวดงาน */}
        <Box mb="6">
          <Heading as="h3" size="4" mb="4" style={{ color: 'var(--orange-11)' }}>
            รายการงวดงาน
          </Heading>
          
          <Flex direction="column" gap="2">
            {deliveryDetails.phases.map((phase, index) => (
              <Card 
                key={index} 
                style={{ 
                  padding: '1rem',
                  backgroundColor: phase.isCompleted ? 'var(--green-2)' : 'var(--gray-2)',
                  border: (index + 1) === deliveryDetails.currentPhase ? '2px solid var(--blue-8)' : '1px solid var(--gray-6)'
                }}
              >
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
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    {phase.isCompleted ? '✓' : (index + 1)}
                  </Box>
                  
                  <Box style={{ flex: 1 }}>
                    <Flex align="center" gap="2" mb="1">
                      <Text weight="medium" size="3">
                        งวดที่ {index + 1}: {phase.name}
                      </Text>
                      {(index + 1) === deliveryDetails.currentPhase && (
                        <Badge color="blue" size="1">ปัจจุบัน</Badge>
                      )}
                      {phase.isCompleted && (
                        <Badge color="green" size="1">เสร็จแล้ว</Badge>
                      )}
                    </Flex>
                    
                    <Text size="2" style={{ color: 'var(--gray-11)' }}>
                      {phase.description}
                    </Text>
                    
                    {phase.isCompleted && phase.completedDate && (
                      <Text size="2" style={{ color: 'var(--green-11)', marginTop: '4px' }}>
                        วันที่เสร็จ: {new Date(phase.completedDate).toLocaleDateString('th-TH')}
                      </Text>
                    )}
                    
                    {phase.notes && (
                      <Text size="2" style={{ color: 'var(--gray-11)', marginTop: '4px' }}>
                        หมายเหตุ: {phase.notes}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Box>

        {/* หมายเหตุเพิ่มเติม */}
        {deliveryDetails.additionalNotes && (
          <Card style={{ padding: '1rem', marginBottom: '2rem', backgroundColor: 'var(--yellow-2)' }}>
            <Heading as="h3" size="3" mb="2" style={{ color: 'var(--yellow-11)' }}>
              หมายเหตุเพิ่มเติม
            </Heading>
            <Text size="3" style={{ whiteSpace: 'pre-wrap' }}>
              {deliveryDetails.additionalNotes}
            </Text>
          </Card>
        )}

        {/* ลายเซ็นท้าย */}
        <Flex direction={{ initial: 'column', md: 'row' }} justify="between" gap="6" mt="8" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <Box style={{ textAlign: 'center', flex: 1 }}>
            <Text size="2" mb="4" style={{ display: 'block' }}>
              ผู้ส่งมอบ
            </Text>
            <Box style={{ height: '60px', borderBottom: '1px solid var(--gray-8)', marginBottom: '8px' }} />
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              ({deliveryDetails.companyName})
            </Text>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              วันที่: ........................
            </Text>
          </Box>
          
          <Box style={{ textAlign: 'center', flex: 1 }}>
            <Text size="2" mb="4" style={{ display: 'block' }}>
              ผู้รับมอบ
            </Text>
            <Box style={{ height: '60px', borderBottom: '1px solid var(--gray-8)', marginBottom: '8px' }} />
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              ({deliveryDetails.customerName})
            </Text>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              วันที่: ........................
            </Text>
          </Box>
        </Flex>

        {/* หมายเหตุท้าย */}
        <Box mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)', textAlign: 'center' }}>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            เอกสารฉบับนี้สร้างขึ้นโดยระบบ E-Certificate
          </Text>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}
          </Text>
        </Box>
      </Card>
    </Box>
  );
};
