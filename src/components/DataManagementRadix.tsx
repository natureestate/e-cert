import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { LogoStorageService, LogoInfo } from '../services/logoStorageService';
import { Company, Customer, Project, Product, BatchNumber } from '../types/firestore';
import {
  Button,
  Flex,
  Text,
  Card,
  Heading,
  Table,
  Badge,
  Box,
  Container,
  Section
} from '@radix-ui/themes';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ImageIcon, UploadIcon, TrashIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons';

interface DataManagementRadixProps {
  dataType: 'companies' | 'customers' | 'projects' | 'products' | 'batches';
}

export const DataManagementRadix: React.FC<DataManagementRadixProps> = ({ dataType }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  
  // States สำหรับจัดการโลโก้ (ใช้เฉพาะกับ companies)
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoInfo, setLogoInfo] = useState<LogoInfo | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // States สำหรับ Logo Gallery
  const [showLogoGallery, setShowLogoGallery] = useState(false);
  const [availableLogos, setAvailableLogos] = useState<LogoInfo[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);

  useEffect(() => {
    loadData();
  }, [dataType]);

  const loadData = async () => {
    try {
      setLoading(true);
      let result: any[] = [];
      
      switch (dataType) {
        case 'companies':
          result = await FirestoreService.getCompanies();
          break;
        case 'customers':
          result = await FirestoreService.getCustomers();
          break;
        case 'projects':
          result = await FirestoreService.getProjects();
          break;
        case 'products':
          result = await FirestoreService.getProducts();
          break;
        case 'batches':
          result = await FirestoreService.getBatchNumbers();
          break;
      }
      
      setData(result);
    } catch (error) {
      console.error(`Error loading ${dataType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getEmptyFormData = () => {
    switch (dataType) {
      case 'companies':
        return { name: '', address: '', phone: '', website: '', logoUrl: '', isActive: true };
      case 'customers':
        return { name: '', phone: '', email: '', address: '', buyer: '', isActive: true };
      case 'projects':
        return { name: '', location: '', customerId: '', customerName: '', description: '', isActive: true };
      case 'products':
        return { name: '', category: '', description: '', defaultWarrantyYears: 3, isActive: true };
      case 'batches':
        return { batchNumber: '', productId: '', productName: '', productionDate: new Date(), quantity: 0, notes: '', isActive: true };
      default:
        return {};
    }
  };

  // ฟังก์ชันสำหรับจัดการโลโก้
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && dataType === 'companies') {
      try {
        setIsUploadingLogo(true);
        
        // ตรวจสอบไฟล์
        if (!LogoStorageService.isValidImageFile(file)) {
          alert('กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, SVG, WebP)');
          return;
        }
        
        if (!LogoStorageService.isValidFileSize(file)) {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
          return;
        }

        console.log('📷 กำลังอัปโหลดโลโก้...', file.name);
        
        // อัปโหลดไฟล์ไปยัง Firebase Storage
        const uploadedLogoInfo = await LogoStorageService.uploadLogo(file);
        
        // อัปเดต state
        setLogoSrc(uploadedLogoInfo.url);
        setLogoFileName(uploadedLogoInfo.fileName);
        setLogoInfo(uploadedLogoInfo);
        
        // อัปเดต formData ด้วย URL ของโลโก้
        setFormData(prev => ({ ...prev, logoUrl: uploadedLogoInfo.url }));
        
        console.log('✅ อัปโหลดโลโก้สำเร็จ:', uploadedLogoInfo);
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลดโลโก้');
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (logoInfo?.url) {
      try {
        await LogoStorageService.deleteLogo(logoInfo.url);
        console.log('🗑️ ลบโลโก้สำเร็จ');
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }
    
    setLogoSrc(null);
    setLogoFileName(null);
    setLogoInfo(null);
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  // ฟังก์ชันโหลดโลโก้ที่มีอยู่แล้วใน Gallery
  const loadAvailableLogos = async () => {
    setLoadingLogos(true);
    try {
      const logos = await LogoStorageService.getCompanyLogos();
      setAvailableLogos(logos);
    } catch (error) {
      console.error('Error loading available logos:', error);
    } finally {
      setLoadingLogos(false);
    }
  };

  // ฟังก์ชันเลือกโลโก้จาก Gallery
  const handleSelectLogoFromGallery = (logo: LogoInfo) => {
    setLogoSrc(logo.url);
    setLogoFileName(logo.fileName);
    setLogoInfo(logo);
    setFormData(prev => ({ ...prev, logoUrl: logo.url }));
    setShowLogoGallery(false);
  };

  // ฟังก์ชันลบโลโก้จาก Gallery
  const handleDeleteLogoFromGallery = async (logo: LogoInfo) => {
    try {
      await LogoStorageService.deleteLogo(logo.fullPath);
      // โหลดรายการโลโก้ใหม่
      await loadAvailableLogos();
      // ถ้าโลโก้ที่ลบคือโลโก้ที่เลือกอยู่ ให้ลบออกจากฟอร์ม
      if (logoSrc === logo.url) {
        handleRemoveLogo();
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      alert('เกิดข้อผิดพลาดในการลบโลโก้');
    }
  };

  const handleAdd = () => {
    setFormData(getEmptyFormData());
    setEditingItem(null);
    // รีเซ็ต logo state
    setLogoSrc(null);
    setLogoFileName(null);
    setLogoInfo(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setEditingItem(item);
    
    // ตั้งค่า logo state สำหรับการแก้ไข
    if (dataType === 'companies' && item.logoUrl) {
      console.log('🏢 โหลดโลโก้บริษัทสำหรับการแก้ไข:', item.logoUrl);
      setLogoSrc(item.logoUrl);
      // ดึงชื่อไฟล์จาก URL หรือใช้ชื่อบริษัท
      const fileName = item.logoUrl.split('/').pop()?.split('?')[0] || `${item.name || 'company'}-logo`;
      setLogoFileName(fileName);
      setLogoInfo({
        url: item.logoUrl,
        fileName: fileName,
        fullPath: '', // ไม่มี fullPath สำหรับโลโก้เก่า
        size: 'medium',
        uploadedAt: new Date()
      });
    } else {
      setLogoSrc(null);
      setLogoFileName(null);
      setLogoInfo(null);
    }
    
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!editingItem) {
        // Adding new item
        switch (dataType) {
          case 'companies':
            await FirestoreService.createCompany(formData);
            break;
          case 'customers':
            await FirestoreService.createCustomer(formData);
            break;
          case 'projects':
            await FirestoreService.createProject(formData);
            break;
          case 'products':
            await FirestoreService.createProduct(formData);
            break;
          case 'batches':
            await FirestoreService.createBatchNumber(formData);
            break;
        }
      } else {
        // Updating existing item
        switch (dataType) {
          case 'companies':
            await FirestoreService.updateCompany(editingItem.id, formData);
            break;
          case 'customers':
            await FirestoreService.updateCustomer(editingItem.id, formData);
            break;
          case 'projects':
            await FirestoreService.updateProject(editingItem.id, formData);
            break;
          case 'products':
            await FirestoreService.updateProduct(editingItem.id, formData);
            break;
          case 'batches':
            await FirestoreService.updateBatchNumber(editingItem.id, formData);
            break;
        }
      }
      
      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
      // รีเซ็ต logo state
      setLogoSrc(null);
      setLogoFileName(null);
      setLogoInfo(null);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // ลบรายการข้อมูลทั้งหมด
  const handleDeleteAll = async () => {
    try {
      // ลูปลบข้อมูลทั้งหมดในหมวดหมู่นั้นๆ
      for (const item of data) {
        await FirestoreService.deleteDocument(getCollectionName(), item.id);
      }
      
      setIsDeleteAllDialogOpen(false);
      loadData(); // รีเฟรชข้อมูล
      alert(`ลบข้อมูล${getDataTypeLabel()}ทั้งหมดเรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error deleting all data:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // ฟังก์ชันลบข้อมูลใบส่งมอบงานทั้งหมด (ชั่วคราว)
  const handleClearWorkDeliveries = async () => {
    try {
      await FirestoreService.clearAllWorkDeliveries();
      alert('ลบข้อมูลใบส่งมอบงานทั้งหมดเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error clearing work deliveries:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูลใบส่งมอบงาน');
    }
  };

  // ลบรายการข้อมูลแต่ละตัว
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await FirestoreService.deleteDocument(getCollectionName(), itemToDelete.id);
      setIsDeleteItemDialogOpen(false);
      setItemToDelete(null);
      loadData(); // รีเฟรชข้อมูล
      alert(`ลบข้อมูล${getDataTypeLabel()}เรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // เปิดหน้าต่างยืนยันการลบรายการแต่ละตัว
  const confirmDeleteItem = (item: any) => {
    setItemToDelete(item);
    setIsDeleteItemDialogOpen(true);
  };

  // รับชื่อ collection ตามประเภทข้อมูล
  const getCollectionName = () => {
    switch (dataType) {
      case 'companies': return 'companies';
      case 'customers': return 'customers';
      case 'projects': return 'projects';
      case 'products': return 'products';
      case 'batches': return 'batch_numbers';
      default: return '';
    }
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'companies': return 'บริษัท';
      case 'customers': return 'ลูกค้า';
      case 'projects': return 'โครงการ';
      case 'products': return 'สินค้า';
      case 'batches': return 'Batch Number';
      default: return '';
    }
  };

  const renderFormFields = () => {
    const fields = getFormFields();
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map((field) => (
          <div key={field.key}>
            <label 
              htmlFor={field.key}
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--gray-11)'
              }}
            >
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.key}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-6)',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            ) : field.type === 'number' ? (
              <input
                id={field.key}
                type="number"
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-6)',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            ) : field.type === 'date' ? (
              <input
                id={field.key}
                type="date"
                value={formData[field.key] ? new Date(formData[field.key]).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, [field.key]: new Date(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-6)',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            ) : field.type === 'select' ? (
              <div>
                <select
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-6)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">{`เลือก${field.label}...`}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                id={field.key}
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-6)',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            )}
          </div>
        ))}
        
        {/* Logo Upload Section สำหรับบริษัท */}
        {dataType === 'companies' && (
          <div>
            <label 
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--gray-11)'
              }}
            >
              โลโก้บริษัท
            </label>
            
            {!logoSrc ? (
              <div>
                <div
                  style={{
                    border: '2px dashed var(--blue-6)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: 'var(--blue-2)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.75rem'
                  }}
                  onClick={() => document.getElementById('logoUpload')?.click()}
                >
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                    disabled={isUploadingLogo}
                  />
                  <UploadIcon 
                    width={32} 
                    height={32}
                    style={{ margin: '0 auto 8px', color: 'var(--blue-9)' }} 
                  />
                  <div style={{ color: 'var(--blue-11)', fontWeight: '500' }}>
                    {isUploadingLogo ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเลือกโลโก้'}
                  </div>
                  <div style={{ color: 'var(--gray-10)', fontSize: '0.875rem', marginTop: '4px' }}>
                    รองรับไฟล์ PNG, JPG, SVG, WebP (สูงสุด 5MB)
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Text size="2" color="gray" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    หรือ
                  </Text>
                  <Button
                    variant="outline"
                    size="2"
                    onClick={() => {
                      setShowLogoGallery(true);
                      loadAvailableLogos();
                    }}
                    disabled={isUploadingLogo}
                    style={{
                      borderColor: 'var(--blue-6)',
                      color: 'var(--blue-11)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <ImageIcon width={16} height={16} />
                    เลือกจาก Gallery
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1px solid var(--green-6)',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'var(--green-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <img
                  src={logoSrc}
                  alt="Logo preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--green-11)', fontWeight: '500', marginBottom: '4px' }}>
                    ✅ อัปโหลดโลโก้แล้ว
                  </div>
                  <div style={{ color: 'var(--gray-10)', fontSize: '0.875rem' }}>
                    {logoFileName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    background: 'var(--red-9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getFormFields = () => {
    switch (dataType) {
      case 'companies':
        return [
          { key: 'name', label: 'ชื่อบริษัท', type: 'text' },
          { key: 'address', label: 'ที่อยู่', type: 'textarea' },
          { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'text' },
          { key: 'website', label: 'เว็บไซต์', type: 'text' },
        ];
      case 'customers':
        return [
          { key: 'name', label: 'ชื่อลูกค้า', type: 'text' },
          { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'text' },
          { key: 'email', label: 'อีเมล', type: 'text' },
          { key: 'address', label: 'ที่อยู่', type: 'textarea' },
          { key: 'buyer', label: 'ผู้ซื้อสินค้า', type: 'text' },
        ];
      case 'projects':
        return [
          { key: 'name', label: 'ชื่อโครงการ', type: 'text' },
          { key: 'location', label: 'สถานที่', type: 'textarea' },
          { key: 'customerName', label: 'ชื่อลูกค้า', type: 'text' },
          { key: 'description', label: 'รายละเอียด', type: 'textarea' },
        ];
      case 'products':
        return [
          { key: 'name', label: 'ชื่อสินค้า', type: 'text' },
          { key: 'category', label: 'หมวดหมู่', type: 'text' },
          { key: 'description', label: 'รายละเอียด', type: 'textarea' },
          { key: 'defaultWarrantyYears', label: 'การรับประกัน (ปี)', type: 'number' },
        ];
      case 'batches':
        return [
          { key: 'batchNumber', label: 'หมายเลข Batch', type: 'text' },
          { key: 'productName', label: 'ชื่อสินค้า', type: 'text' },
          { key: 'productionDate', label: 'วันที่ผลิต', type: 'date' },
          { key: 'quantity', label: 'จำนวน', type: 'number' },
          { key: 'notes', label: 'หมายเหตุ', type: 'textarea' },
        ];
      default:
        return [];
    }
  };

  const renderTableHeaders = () => {
    switch (dataType) {
      case 'companies':
        return ['ชื่อบริษัท', 'ที่อยู่', 'เบอร์โทรศัพท์', 'เว็บไซต์', 'สถานะ', 'การจัดการ'];
      case 'customers':
        return ['ชื่อลูกค้า', 'เบอร์โทรศัพท์', 'อีเมล', 'ผู้ซื้อสินค้า', 'สถานะ', 'การจัดการ'];
      case 'projects':
        return ['ชื่อโครงการ', 'สถานที่', 'ลูกค้า', 'สถานะ', 'การจัดการ'];
      case 'products':
        return ['ชื่อสินค้า', 'หมวดหมู่', 'การรับประกัน', 'สถานะ', 'การจัดการ'];
      case 'batches':
        return ['หมายเลข Batch', 'สินค้า', 'วันที่ผลิต', 'จำนวน', 'สถานะ', 'การจัดการ'];
      default:
        return [];
    }
  };

  const renderTableRow = (item: any) => {
    switch (dataType) {
      case 'companies':
        return [
          item.name,
          item.address?.substring(0, 50) + (item.address?.length > 50 ? '...' : ''),
          item.phone,
          item.website,
          item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        ];
      case 'customers':
        return [
          item.name,
          item.phone,
          item.email,
          item.buyer || '-',
          item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        ];
      case 'projects':
        return [
          item.name,
          item.location?.substring(0, 50) + (item.location?.length > 50 ? '...' : ''),
          item.customerName,
          item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        ];
      case 'products':
        return [
          item.name,
          item.category,
          `${item.defaultWarrantyYears} ปี`,
          item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        ];
      case 'batches':
        return [
          item.batchNumber,
          item.productName,
          new Date(item.productionDate).toLocaleDateString('th-TH'),
          item.quantity,
          item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '16rem' }}>
        <Text color="gray">กำลังโหลดข้อมูล...</Text>
      </Flex>
    );
  }

  return (
    <Container size="4" p="6">
      <Flex justify="between" align="center" mb="6">
        <Box>
          <Heading size="7" mb="2">จัดการ{getDataTypeLabel()}</Heading>
          <Text color="gray">เพิ่ม แก้ไข และจัดการข้อมูล{getDataTypeLabel()}</Text>
        </Box>
        
        <Flex gap="3" align="center">
          {data.length > 0 && (
            <AlertDialog.Root open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
              <AlertDialog.Trigger asChild>
                <Button variant="soft" color="red">
                  🗑️ ลบทั้งหมด ({data.length})
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="AlertDialogOverlay" />
                <AlertDialog.Content className="AlertDialogContent">
                  <AlertDialog.Title className="AlertDialogTitle">ยืนยันการลบข้อมูลทั้งหมด</AlertDialog.Title>
                  <AlertDialog.Description className="AlertDialogDescription">
                    คุณแน่ใจหรือไม่ที่จะลบข้อมูล{getDataTypeLabel()}ทั้งหมด {data.length} รายการ? การกระทำนี้ไม่สามารถยกเลิกได้
                  </AlertDialog.Description>

                  <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel asChild>
                      <Button variant="soft" color="gray" size="3">
                        <Flex align="center" gap="2">
                          <Cross2Icon width="16" height="16" />
                          <Text>ยกเลิก</Text>
                        </Flex>
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button variant="solid" color="red" size="3" onClick={handleDeleteAll}>
                        <Flex align="center" gap="2">
                          <TrashIcon width="16" height="16" />
                          <Text>ลบทั้งหมด</Text>
                        </Flex>
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          )}
          
          {/* ปุ่มลบข้อมูลใบส่งมอบงานทั้งหมด (ชั่วคราว) */}
          <Button variant="soft" color="orange" onClick={handleClearWorkDeliveries}>
            🧹 ลบข้อมูลใบส่งมอบงานทั้งหมด
          </Button>

          <Button onClick={handleAdd}>
            + เพิ่ม{getDataTypeLabel()}
          </Button>

          {isDialogOpen && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              onClick={() => setIsDialogOpen(false)}
            >
              <div 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '2rem',
                  maxWidth: '450px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Heading size="5" mb="2">
                  {editingItem ? 'แก้ไข' : 'เพิ่ม'}{getDataTypeLabel()}
                </Heading>
                <Text size="2" mb="4" color="gray">
                  กรอกข้อมูล{getDataTypeLabel()}ในฟอร์มด้านล่าง
                </Text>
                
                {renderFormFields()}
                
                <Flex gap="3" mt="4" justify="end">
                  <Button variant="soft" color="gray" size="3" onClick={() => setIsDialogOpen(false)}>
                    <Flex align="center" gap="2">
                      <Cross2Icon width="16" height="16" />
                      <Text>ยกเลิก</Text>
                    </Flex>
                  </Button>
                  <Button size="3" onClick={handleSave}>
                    <Flex align="center" gap="2">
                      <CheckIcon width="16" height="16" />
                      <Text>บันทึก</Text>
                    </Flex>
                  </Button>
                </Flex>
              </div>
            </div>
          )}
        </Flex>
      </Flex>

      {/* Dialog สำหรับยืนยันการลบรายการแต่ละตัว */}
      <AlertDialog.Root open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="AlertDialogOverlay" />
          <AlertDialog.Content className="AlertDialogContent">
            <AlertDialog.Title className="AlertDialogTitle">ยืนยันการลบรายการ</AlertDialog.Title>
            <AlertDialog.Description className="AlertDialogDescription">
              คุณแน่ใจหรือไม่ที่จะลบ{getDataTypeLabel()}: {itemToDelete?.name || itemToDelete?.batchNumber}? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel asChild>
                <Button variant="soft" color="gray" size="3">
                  <Flex align="center" gap="2">
                    <Cross2Icon width="16" height="16" />
                    <Text>ยกเลิก</Text>
                  </Flex>
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="solid" color="red" size="3" onClick={handleDeleteItem}>
                  <Flex align="center" gap="2">
                    <TrashIcon width="16" height="16" />
                    <Text>ลบ</Text>
                  </Flex>
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {renderTableHeaders().map((header, index) => (
                <Table.ColumnHeaderCell key={index}>
                  {header}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((item) => (
              <Table.Row key={item.id}>
                {renderTableRow(item).map((cell, index) => (
                  <Table.Cell key={index}>
                    {cell}
                  </Table.Cell>
                ))}
                <Table.Cell>
                  <Flex gap="2">
                    <Button
                      variant="soft"
                      size="2"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ แก้ไข
                    </Button>
                    <Button
                      variant="soft"
                      color="red"
                      size="2"
                      onClick={() => confirmDeleteItem(item)}
                    >
                      🗑️ ลบ
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        
        {data.length === 0 && (
          <Flex direction="column" align="center" py="9">
            <Text color="gray" mb="4">ยังไม่มีข้อมูล{getDataTypeLabel()}</Text>
            <Button onClick={handleAdd}>
              เพิ่ม{getDataTypeLabel()}แรก
            </Button>
          </Flex>
        )}
      </Card>

      {/* Logo Gallery Modal */}
      {showLogoGallery && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowLogoGallery(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative',
              margin: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-12)' }}>
                🖼️ เลือกโลโก้จาก Gallery
              </h3>
              <button
                onClick={() => setShowLogoGallery(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--gray-10)',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {loadingLogos ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Text color="gray">🔄 กำลังโหลดโลโก้...</Text>
              </div>
            ) : availableLogos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Text color="gray">😔 ยังไม่มีโลโก้ใน Gallery</Text>
                <br />
                <Text size="1" color="gray">อัปโหลดโลโก้ใหม่เพื่อเริ่มต้นใช้งาน</Text>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem'
                }}
              >
                {availableLogos.map((logo, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid var(--gray-6)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--gray-1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-6)';
                      e.currentTarget.style.backgroundColor = 'var(--blue-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gray-6)';
                      e.currentTarget.style.backgroundColor = 'var(--gray-1)';
                    }}
                  >
                    <img
                      src={logo.url}
                      alt={logo.fileName}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-11)', marginBottom: '0.5rem' }}>
                      {logo.fileName.length > 15 ? `${logo.fileName.substring(0, 15)}...` : logo.fileName}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleSelectLogoFromGallery(logo)}
                        style={{
                          background: 'var(--blue-9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        เลือก
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('ต้องการลบโลโก้นี้หรือไม่?')) {
                            handleDeleteLogoFromGallery(logo);
                          }
                        }}
                        style={{
                          background: 'var(--red-9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};
