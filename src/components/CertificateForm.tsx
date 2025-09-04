import React, { useEffect, useState } from 'react';
import { Box, Card, Heading, Flex, Text, TextField, Button, Section } from '@radix-ui/themes';
import { ImageIcon, CheckIcon, PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { FormSelect } from './FormSelect';
import { MultiTagInput } from './MultiTagInput';
import { FirestoreService } from '../services/firestoreService';
import { LogoStorageService } from '../services/logoStorageService';
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
  logoSrc: string | null; // เพิ่ม logoSrc
  logoFileName: string | null; // เพิ่ม logoFileName
  logoSize: 'small' | 'medium' | 'large'; // เพิ่ม logoSize
  onLogoSizeChange: (size: 'small' | 'medium' | 'large') => void; // เพิ่ม handler สำหรับขนาดโลโก้
  onRemoveLogo: () => void; // เพิ่ม handler สำหรับลบโลโก้
  onSelectLogoFromGallery?: (logoInfo: any) => void; // เพิ่ม handler สำหรับเลือกโลโก้จาก gallery
  isViewingMode?: boolean; // เพิ่ม prop เพื่อซ่อนปุ่มบันทึกเมื่อดูจากประวัติ
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  formData,
  onFormChange,
  onBatchNumbersChange,
  onLogoChange,
  onGenerate,
  isFormValid,
  logoSrc,
  logoFileName,
  logoSize,
  onLogoSizeChange,
  onRemoveLogo,
  onSelectLogoFromGallery,
  isViewingMode = false
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
  
  // States สำหรับ Logo Gallery
  const [showLogoGallery, setShowLogoGallery] = useState(false);
  const [availableLogos, setAvailableLogos] = useState<any[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);

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

  // ฟังก์ชันโหลดโลโก้ที่มีอยู่แล้ว
  const loadAvailableLogos = async () => {
    setLoadingLogos(true);
    try {
      const logos = await LogoStorageService.getCompanyLogos();
      setAvailableLogos(logos);
      console.log('📂 โหลดโลโก้ที่มีอยู่:', logos.length, 'ไฟล์');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการโหลดโลโก้:', error);
    } finally {
      setLoadingLogos(false);
    }
  };

  // ฟังก์ชันเลือกโลโก้จาก gallery
  const handleSelectLogoFromGallery = (logoInfo: any) => {
    console.log('🎯 เลือกโลโก้จาก gallery:', logoInfo.fileName);
    
    // เรียก callback ที่ส่งมาจาก App.tsx
    if (onSelectLogoFromGallery) {
      onSelectLogoFromGallery(logoInfo);
    }
    
    // ปิด gallery
    setShowLogoGallery(false);
  };

  // ฟังก์ชันลบโลโก้จาก gallery
  const handleDeleteLogoFromGallery = async (logoInfo: any) => {
    if (confirm(`คุณต้องการลบโลโก้ "${logoInfo.fileName}" หรือไม่?`)) {
      try {
        await LogoStorageService.deleteLogo(logoInfo.fullPath);
        await loadAvailableLogos(); // โหลดรายการใหม่
        console.log('✅ ลบโลโก้จาก gallery สำเร็จ');
      } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการลบโลโก้:', error);
        alert('ไม่สามารถลบโลโก้ได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

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
          
          {!logoSrc ? (
            // UI สำหรับการอัปโหลดเมื่อยังไม่มีโลโก้
            <Box>
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

              {/* ปุ่มเลือกจาก Gallery แสดงเสมอ */}
              <Box mt="3" style={{ textAlign: 'center' }}>
                <Button
                  variant="soft"
                  size="3"
                  onClick={() => {
                    setShowLogoGallery(true);
                    loadAvailableLogos();
                  }}
                  style={{
                    backgroundColor: 'var(--green-3)',
                    color: 'var(--green-11)',
                    border: '1px solid var(--green-6)',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  <Flex align="center" gap="2">
                    <ImageIcon width="16" height="16" />
                    <Text size="3">เลือกจาก Gallery</Text>
                  </Flex>
                </Button>
              </Box>
            </Box>
          ) : (
            // UI สำหรับแสดงโลโก้ที่อัปโหลดแล้ว
            <Box>
              {/* ตัวอย่างโลโก้ที่อัปโหลด */}
              <Box
                style={{
                  border: '2px solid var(--green-6)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backgroundColor: 'var(--green-2)',
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
                      alt="Logo Preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="3" weight="medium" style={{ color: 'var(--green-11)', display: 'block' }}>
                      ✅ อัปโหลดสำเร็จ
                    </Text>
                    <Text size="2" color="gray" style={{ marginTop: '2px' }}>
                      {logoFileName}
                    </Text>
                  </Box>
                  <Button
                    variant="soft"
                    size="2"
                    color="red"
                    onClick={onRemoveLogo}
                    style={{
                      minWidth: '32px',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                    title="ลบโลโก้"
                  >
                    <Cross2Icon width="14" height="14" />
                  </Button>
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

              {/* ปุ่มเปลี่ยนโลโก้และเลือกจาก Gallery */}
              <Box mt="3">
                <Flex gap="2">
                  {/* ปุ่มเปลี่ยนโลโก้ใหม่ */}
                  <Box
                    style={{
                      flex: 1,
                      border: '1px dashed var(--blue-6)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      backgroundColor: 'var(--blue-1)',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-8)';
                      e.currentTarget.style.backgroundColor = 'var(--blue-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-6)';
                      e.currentTarget.style.backgroundColor = 'var(--blue-1)';
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
                    <Text size="2" color="blue" weight="medium">
                      อัปโหลดใหม่
                    </Text>
                  </Box>

                  {/* ปุ่มเลือกจาก Gallery */}
                  <Button
                    variant="soft"
                    size="2"
                    onClick={() => {
                      setShowLogoGallery(true);
                      loadAvailableLogos();
                    }}
                    style={{
                      backgroundColor: 'var(--green-3)',
                      color: 'var(--green-11)',
                      border: '1px solid var(--green-6)',
                      borderRadius: '8px',
                      minWidth: 'fit-content'
                    }}
                  >
                    <Flex align="center" gap="1">
                      <ImageIcon width="14" height="14" />
                      <Text size="2">Gallery</Text>
                    </Flex>
                  </Button>
                </Flex>
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

        {/* แสดงปุ่มบันทึกเฉพาะเมื่อไม่ได้อยู่ในโหมดดูจากประวัติ */}
        {!isViewingMode && (
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

        {/* Logo Gallery Modal */}
        {showLogoGallery && (
          <Box
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setShowLogoGallery(false)}
          >
            <Card
              variant="surface"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex align="center" justify="between" mb="4">
                <Heading as="h3" size="5">โลโก้ที่เคยอัปโหลด</Heading>
                <Button
                  variant="soft"
                  size="2"
                  color="gray"
                  onClick={() => setShowLogoGallery(false)}
                >
                  <Cross2Icon width="16" height="16" />
                </Button>
              </Flex>

              {loadingLogos ? (
                <Box style={{ textAlign: 'center', padding: '2rem' }}>
                  <Text color="gray">กำลังโหลดโลโก้...</Text>
                </Box>
              ) : availableLogos.length === 0 ? (
                <Box style={{ textAlign: 'center', padding: '2rem' }}>
                  <Text color="gray">ยังไม่มีโลโก้ที่เคยอัปโหลด</Text>
                </Box>
              ) : (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  {availableLogos.map((logo, index) => (
                    <Box
                      key={index}
                      style={{
                        border: '1px solid var(--gray-6)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        backgroundColor: 'var(--gray-1)',
                        textAlign: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--blue-8)';
                        e.currentTarget.style.backgroundColor = 'var(--blue-2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gray-6)';
                        e.currentTarget.style.backgroundColor = 'var(--gray-1)';
                      }}
                      onClick={() => handleSelectLogoFromGallery(logo)}
                    >
                      {/* รูปโลโก้ */}
                      <Box
                        style={{
                          width: '80px',
                          height: '80px',
                          margin: '0 auto 0.5rem',
                          border: '1px solid var(--gray-6)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'white',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={logo.url}
                          alt={`Logo ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>

                      {/* ชื่อไฟล์ (ย่อ) */}
                      <Text size="1" color="gray" style={{ 
                        fontSize: '0.7rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {logo.fileName?.substring(0, 15) || `Logo ${index + 1}`}
                        {(logo.fileName?.length || 0) > 15 ? '...' : ''}
                      </Text>

                      {/* ปุ่มลบ */}
                      <Button
                        variant="soft"
                        size="1"
                        color="red"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          minWidth: '20px',
                          width: '20px',
                          height: '20px',
                          padding: '0',
                          borderRadius: '10px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLogoFromGallery(logo);
                        }}
                      >
                        <Cross2Icon width="10" height="10" />
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Card>
    </Section>
  );
};
