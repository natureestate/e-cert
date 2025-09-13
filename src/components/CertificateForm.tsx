import React, { useEffect, useState } from 'react';
import { Box, Card, Heading, Flex, Text, TextField, Button, Section } from '@radix-ui/themes';
import { ImageIcon, CheckIcon, PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { FormSelect } from './FormSelect';
import { MultiTagInput } from './MultiTagInput';
import { FirestoreService } from '../services/firestoreService';
import { FormDropdownData, Company, Customer, Project, Product, BatchNumber } from '../types/firestore';

interface FormData {
  companyId: string;
  customerId: string;
  projectId: string;
  productId: string;
  batchNumbers: string[]; // เปลี่ยนเป็น array สำหรับ multi-tag
  deliveryDate: string;
  additionalNotes: string;
}

interface CertificateFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBatchNumbersChange: (name: string, value: string[]) => void; // เพิ่ม handler สำหรับ batch numbers
  onGenerate: () => void;
  isFormValid: boolean;
  logoSrc: string | null; // โลโก้จากบริษัทที่เลือก
  logoSize: 'small' | 'medium' | 'large'; // ขนาดโลโก้
  onLogoSizeChange: (size: 'small' | 'medium' | 'large') => void; // handler สำหรับเปลี่ยนขนาดโลโก้
  isViewingMode?: boolean; // เพิ่ม prop เพื่อซ่อนปุ่มบันทึกเมื่อดูจากประวัติ
  onGeneratePreview?: () => void; // เพิ่ม handler สำหรับสร้าง preview ด้วยตนเอง
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  formData,
  onFormChange,
  onBatchNumbersChange,
  onGenerate,
  isFormValid,
  logoSrc,
  logoSize,
  onLogoSizeChange,
  isViewingMode = false,
  onGeneratePreview
}) => {
  const [dropdownData, setDropdownData] = useState<FormDropdownData>({
    companies: [],
    customers: [],
    projects: [],
    products: [],
    batchNumbers: []
  });
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState(dropdownData.projects);
  
  // Logo Gallery ไม่ใช้แล้ว - โลโก้โหลดจากบริษัทอัตโนมัติ

  // โหลดข้อมูล dropdown จาก Firestore
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        console.log('🔄 กำลังโหลดข้อมูล dropdown...');
        
        // Initialize default data if needed
        await FirestoreService.initializeDefaultData();
        
        // Load dropdown options
        const data = await FirestoreService.getFormDropdownData();
        console.log('📊 ข้อมูล dropdown ที่โหลดได้:', data);
        
        setDropdownData(data);
        setFilteredProjects(data.projects);
        
        console.log('✅ โหลดข้อมูลเสร็จแล้ว');
      } catch (error) {
        console.error('❌ Error loading dropdown data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // กรอง projects ตาม customer ที่เลือก
  useEffect(() => {
    if (formData.customerId) {
      // ในการใช้งานจริง ควรเรียก API เพื่อกรอง projects ตาม customerId
      // ตอนนี้ใช้ข้อมูลทั้งหมดไปก่อน
      setFilteredProjects(dropdownData.projects);
    } else {
      setFilteredProjects(dropdownData.projects);
    }
  }, [formData.customerId, dropdownData.projects]);

  // Logo Gallery functions ไม่ใช้แล้ว - โลโก้โหลดจากบริษัทอัตโนมัติ

  if (loading) {
    return (
      <Section className="form-panel">
        <Card variant="surface" style={{ padding: '1.5rem' }}>
          <Heading as="h2" size="6" mb="4">กรอกข้อมูลเพื่อออกใบรับประกัน</Heading>
          <Text color="gray" style={{ textAlign: 'center', fontStyle: 'italic' }}>
            กำลังโหลดข้อมูล...
          </Text>
        </Card>
      </Section>
    );
  }

  return (
    <Section className="form-panel">
      <Card 
        variant="surface" 
        style={{ 
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--blue-1), var(--slate-1))',
          border: '1px solid var(--blue-6)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <Flex align="center" gap="3" mb="6">
          <Box
            style={{
              background: 'linear-gradient(135deg, var(--blue-9), var(--blue-10))',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlusIcon width="24" height="24" color="white" />
          </Box>
          <Heading as="h2" size="6" style={{ color: 'var(--blue-11)' }}>
            กรอกข้อมูลเพื่อออกใบรับประกัน
          </Heading>
        </Flex>
        
        {/* Logo Display Field - แสดงโลโก้จากบริษัทที่เลือก */}
        <Box mb="6">
          <Flex align="center" gap="2" mb="3">
            <ImageIcon width="18" height="18" color="var(--blue-9)" />
            <Text as="label" size="3" weight="medium" style={{ color: 'var(--blue-11)' }}>
              โลโก้บริษัท
            </Text>
          </Flex>
          
          {!logoSrc ? (
            // แสดงข้อความเมื่อไม่มีโลโก้
            <Box
              style={{
                border: '2px dashed var(--gray-6)',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'var(--gray-2)',
                textAlign: 'center'
              }}
            >
              <ImageIcon width="32" height="32" color="var(--gray-9)" style={{ margin: '0 auto 8px' }} />
              <Text size="3" color="gray" weight="medium" style={{ display: 'block' }}>
                เลือกบริษัทเพื่อแสดงโลโก้
                </Text>
                <Text size="2" color="gray" style={{ marginTop: '4px' }}>
                  โลโก้จะแสดงอัตโนมัติจากข้อมูลบริษัท
                </Text>
              </Box>
          ) : (
            // UI สำหรับแสดงโลโก้จากบริษัท
            <Box>
              <Box
                style={{
                  border: '2px solid var(--blue-6)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backgroundColor: 'var(--blue-2)',
                  position: 'relative'
                }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--gray-6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white'
                    }}
                  >
                    <img 
                      src={logoSrc} 
                      alt="Company Logo" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('❌ โหลดโลโก้ไม่สำเร็จ:', logoSrc);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('✅ โหลดโลโก้สำเร็จ:', logoSrc);
                      }}
                    />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="3" weight="medium" style={{ color: 'var(--blue-11)', display: 'block' }}>
                      🏢 โลโก้บริษัท
                    </Text>
                    <Text size="2" color="gray" style={{ marginTop: '2px' }}>
                      โหลดจากข้อมูลบริษัท
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {/* ตัวเลือกขนาดโลโก้ */}
              <Box mt="4">
                <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--blue-11)' }}>
                  ขนาดโลโก้ในใบรับประกัน
                </Text>
                <Flex gap="2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={logoSize === size ? 'solid' : 'soft'}
                      size="2"
                      onClick={() => onLogoSizeChange(size)}
                      style={{
                        flex: 1,
                        backgroundColor: logoSize === size 
                          ? 'var(--blue-9)' 
                          : 'var(--blue-3)',
                        color: logoSize === size 
                          ? 'white' 
                          : 'var(--blue-11)',
                        border: logoSize === size 
                          ? '2px solid var(--blue-11)' 
                          : '1px solid var(--blue-6)'
                      }}
                    >
                      <Text size="2">
                        {size === 'small' ? 'เล็ก' : size === 'medium' ? 'กลาง' : 'ใหญ่'}
                      </Text>
                    </Button>
                  ))}
                </Flex>
              </Box>

              {/* หมายเหตุ: โลโก้จะอัปเดตอัตโนมัติจากการตั้งค่าบริษัท */}
              <Box mt="3" p="3" style={{
                backgroundColor: 'var(--blue-1)',
                border: '1px solid var(--blue-4)',
                borderRadius: '8px'
              }}>
                <Text size="2" color="blue" style={{ display: 'block', textAlign: 'center' }}>
                  💡 โลโก้จะแสดงอัตโนมัติจากข้อมูลบริษัทที่เลือก<br/>
                  หากต้องการเปลี่ยนโลโก้ กรุณาไปที่หน้า "จัดการข้อมูลบริษัท"
                </Text>
              </Box>
            </Box>
          )}
        </Box>

      {/* Company Selection */}
      <FormSelect
        id="companyId"
        name="companyId"
        label="เลือกบริษัท"
        value={formData.companyId}
        options={dropdownData.companies}
        onChange={onFormChange}
        placeholder="เลือกบริษัท..."
        required={true}
      />

        <Box my="4" style={{ height: '1px', backgroundColor: 'var(--gray-6)' }} />

      {/* Customer Selection */}
      <FormSelect
        id="customerId"
        name="customerId"
        label="เลือกลูกค้า"
        value={formData.customerId}
        options={dropdownData.customers}
        onChange={onFormChange}
        placeholder="เลือกลูกค้า..."
        required={true}
      />

      {/* Project Selection */}
      <FormSelect
        id="projectId"
        name="projectId"
        label="เลือกโครงการ"
        value={formData.projectId}
        options={filteredProjects}
        onChange={onFormChange}
        placeholder="เลือกโครงการ..."
        required={true}
      />

      {/* Product Selection */}
      <FormSelect
        id="productId"
        name="productId"
        label="เลือกประเภทสินค้า"
        value={formData.productId}
        options={dropdownData.products}
        onChange={onFormChange}
        placeholder="เลือกประเภทสินค้า..."
        required={true}
      />

      {/* Lot การผลิต - Multi Tag Input */}
      <MultiTagInput
        id="batchNumbers"
        name="batchNumbers"
        label="Lot การผลิต"
        value={formData.batchNumbers}
        onChange={onBatchNumbersChange}
        placeholder="พิมพ์หมายเลข Lot และกด Enter..."
        required={true}
      />

        <Box mb="4">
          <Text as="label" size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            วันที่ส่งมอบสินค้า <span style={{ color: 'var(--red-9)' }}>*</span>
          </Text>
          <input 
            type="date" 
            id="deliveryDate" 
            name="deliveryDate" 
            value={formData.deliveryDate} 
            onChange={onFormChange} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: '#fcfcfc'
            }}
          />
        </Box>

        <Box mb="4">
          <Text as="label" size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            หมายเหตุเพิ่มเติม
          </Text>
          <textarea 
            id="additionalNotes" 
            name="additionalNotes" 
            value={formData.additionalNotes} 
            onChange={onFormChange} 
            placeholder="หมายเหตุหรือรายละเอียดเพิ่มเติม (ไม่บังคับ)" 
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: '#fcfcfc',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </Box>

        {/* แสดงปุ่มเฉพาะเมื่อไม่ได้อยู่ในโหมดดูจากประวัติ */}
        {!isViewingMode && (
          <Flex gap="3" style={{ marginTop: '2rem' }}>
            {/* ปุ่ม Preview */}
            {onGeneratePreview && (
              <Button 
                size="4"
                variant="soft"
                style={{ 
                  flex: 1,
                  background: isFormValid 
                    ? 'linear-gradient(135deg, var(--blue-9), var(--indigo-9))' 
                    : 'var(--gray-6)',
                  border: isFormValid ? '2px solid var(--blue-11)' : '2px solid var(--gray-7)',
                  boxShadow: isFormValid 
                    ? '0 8px 24px rgba(0, 0, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isFormValid ? 'white' : 'var(--gray-10)',
                  padding: '1.2rem 2rem',
                  minHeight: '60px'
                }}
                onClick={onGeneratePreview} 
                disabled={!isFormValid}
                onMouseEnter={(e) => {
                  if (isFormValid) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--blue-10), var(--indigo-10))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormValid) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--blue-9), var(--indigo-9))';
                  }
                }}
              >
                <Flex align="center" gap="2" justify="center">
                  <ImageIcon width="20" height="20" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                  <Text size="4" weight="bold" style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    letterSpacing: '0.5px'
                  }}>
                    Preview
                  </Text>
                </Flex>
              </Button>
            )}

            {/* ปุ่มบันทึก */}
            <Button 
              size="4"
              style={{ 
                flex: 1,
                background: isFormValid 
                  ? 'linear-gradient(135deg, var(--green-9), var(--emerald-9))' 
                  : 'var(--gray-6)',
                border: isFormValid ? '2px solid var(--green-11)' : '2px solid var(--gray-7)',
                boxShadow: isFormValid 
                  ? '0 8px 24px rgba(0, 128, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                  : 'none',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                fontWeight: 'bold',
                color: isFormValid ? 'white' : 'var(--gray-10)',
                padding: '1.2rem 2rem',
                minHeight: '60px'
              }}
              onClick={onGenerate} 
              disabled={!isFormValid}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 128, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--green-10), var(--emerald-10))';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 128, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--green-9), var(--emerald-9))';
                }
              }}
            >
              <Flex align="center" gap="2" justify="center">
                <CheckIcon width="20" height="20" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                <Text size="4" weight="bold" style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px'
                }}>
                  บันทึก
                </Text>
              </Flex>
            </Button>
          </Flex>
        )}

        {/* แสดงข้อความแจ้งเตือนเมื่ออยู่ในโหมดดูจากประวัติ */}
        {isViewingMode && (
          <Box mt="2rem" p="4" style={{
            backgroundColor: 'var(--yellow-2)',
            border: '1px solid var(--yellow-6)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Text color="yellow" size="3" weight="medium">
              📋 กำลังดูใบรับประกันจากประวัติ - ไม่สามารถแก้ไขหรือบันทึกใหม่ได้
            </Text>
          </Box>
        )}

        {/* Logo Gallery Modal ถูกลบออกแล้ว - ไม่ใช้ในระบบใหม่ */}
      </Card>
    </Section>
  );
};
