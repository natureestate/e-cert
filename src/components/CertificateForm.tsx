import React, { useEffect, useState } from 'react';
import { Box, Card, Heading, Flex, Text, TextField, Button, Section } from '@radix-ui/themes';
import { ImageIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
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
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isFormValid: boolean;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  formData,
  onFormChange,
  onBatchNumbersChange,
  onLogoChange,
  onGenerate,
  isFormValid
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
        
        {/* Logo Upload Field */}
        <Box mb="6">
          <Flex align="center" gap="2" mb="3">
            <ImageIcon width="18" height="18" color="var(--blue-9)" />
            <Text as="label" size="3" weight="medium" style={{ color: 'var(--blue-11)' }}>
              โลโก้บริษัท
            </Text>
          </Flex>
          <Box
            style={{
              border: '2px dashed var(--blue-6)',
              borderRadius: '12px',
              padding: '1.5rem',
              backgroundColor: 'var(--blue-2)',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue-8)';
              e.currentTarget.style.backgroundColor = 'var(--blue-3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue-6)';
              e.currentTarget.style.backgroundColor = 'var(--blue-2)';
            }}
          >
            <input 
              type="file" 
              id="logoUpload" 
              name="logoUpload" 
              accept="image/*" 
              onChange={onLogoChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <ImageIcon width="32" height="32" color="var(--blue-9)" style={{ margin: '0 auto 8px' }} />
            <Text size="3" color="blue" weight="medium" style={{ display: 'block' }}>
              คลิกเพื่อเลือกไฟล์โลโก้
            </Text>
            <Text size="2" color="gray" style={{ marginTop: '4px' }}>
              รองรับไฟล์ PNG, JPG, SVG
            </Text>
          </Box>
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

        <Button 
          size="4"
          style={{ 
            width: '100%', 
            marginTop: '2rem',
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
          <Flex align="center" gap="3" justify="center">
            <CheckIcon width="24" height="24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            <Text size="5" weight="bold" style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}>
              บันทึกใบรับประกัน
            </Text>
          </Flex>
        </Button>
      </Card>
    </Section>
  );
};
