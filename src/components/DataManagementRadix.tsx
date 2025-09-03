import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
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
        return { name: '', address: '', phone: '', website: '', isActive: true };
      case 'customers':
        return { name: '', phone: '', email: '', address: '', isActive: true };
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

  const handleAdd = () => {
    setFormData(getEmptyFormData());
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setEditingItem(item);
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
        // Update functionality would go here
        console.log('Update functionality not implemented yet');
      }
      
      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
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
        return ['ชื่อลูกค้า', 'เบอร์โทรศัพท์', 'อีเมล', 'สถานะ', 'การจัดการ'];
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
                      <Button variant="soft" color="gray">
                        ยกเลิก
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button variant="solid" color="red" onClick={handleDeleteAll}>
                        ลบทั้งหมด
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          )}

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
                  <Button variant="soft" color="gray" onClick={() => setIsDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleSave}>
                    บันทึก
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
                <Button variant="soft" color="gray">
                  ยกเลิก
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="solid" color="red" onClick={handleDeleteItem}>
                  ลบ
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
    </Container>
  );
};
