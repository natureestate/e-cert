import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { Company, Customer, Project, Product, BatchNumber } from '../types/firestore';
import {
  Button,
  Dialog,
  Flex,
  Text,
  TextField,
  Select,
  Card,
  Heading,
  Table,
  Badge,
  Box,
  Container,
  Section
} from '@radix-ui/themes';

interface DataManagementRadixProps {
  dataType: 'companies' | 'customers' | 'projects' | 'products' | 'batches';
}

export const DataManagementRadix: React.FC<DataManagementRadixProps> = ({ dataType }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

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
      <Flex direction="column" gap="4">
        {fields.map((field) => (
          <Box key={field.key}>
            <Text as="label" size="2" weight="medium" htmlFor={field.key}>
              {field.label}
            </Text>
            {field.type === 'textarea' ? (
              <TextField.Root>
                <TextField.Input
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                />
              </TextField.Root>
            ) : field.type === 'number' ? (
              <TextField.Root>
                <TextField.Input
                  id={field.key}
                  type="number"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                />
              </TextField.Root>
            ) : field.type === 'date' ? (
              <TextField.Root>
                <TextField.Input
                  id={field.key}
                  type="date"
                  value={formData[field.key] ? new Date(formData[field.key]).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, [field.key]: new Date(e.target.value)})}
                />
              </TextField.Root>
            ) : field.type === 'select' ? (
              <Select.Root
                value={formData[field.key] || ''}
                onValueChange={(value) => setFormData({...formData, [field.key]: value})}
              >
                <Select.Trigger placeholder={`เลือก${field.label}...`} />
                <Select.Content>
                  {field.options?.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            ) : (
              <TextField.Root>
                <TextField.Input
                  id={field.key}
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                />
              </TextField.Root>
            )}
          </Box>
        ))}
      </Flex>
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
        
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger>
            <Button onClick={handleAdd}>
              + เพิ่ม{getDataTypeLabel()}
            </Button>
          </Dialog.Trigger>
          
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>
              {editingItem ? 'แก้ไข' : 'เพิ่ม'}{getDataTypeLabel()}
            </Dialog.Title>
            <Dialog.Description size="2" mb="4">
              กรอกข้อมูล{getDataTypeLabel()}ในฟอร์มด้านล่าง
            </Dialog.Description>
            
            {renderFormFields()}
            
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
              </Dialog.Close>
              <Button onClick={handleSave}>
                บันทึก
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

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
                  <Button
                    variant="soft"
                    size="2"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </Button>
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
