import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { Company, Customer, Project, Product, BatchNumber } from '../types/firestore';

interface DataManagementProps {
  dataType: 'companies' | 'customers' | 'projects' | 'products' | 'batches';
}

export const DataManagement: React.FC<DataManagementProps> = ({ dataType }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleAdd = () => {
    setFormData(getEmptyFormData());
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
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
        // Update logic would go here
        console.log('Update functionality not implemented yet');
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({});
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const renderFormFields = () => {
    const fields = getFormFields();
    
    return (
      <div className="form-modal">
        <div className="form-modal-content">
          <h3>{isAdding ? 'เพิ่ม' : 'แก้ไข'}{getDataTypeLabel()}</h3>
          
          <div className="form-grid">
            {fields.map((field) => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    rows={3}
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  />
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    value={formData[field.key] ? new Date(formData[field.key]).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, [field.key]: new Date(e.target.value)})}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              บันทึก
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              ยกเลิก
            </button>
          </div>
        </div>
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
      <div className="page-content">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>จัดการ{getDataTypeLabel()}</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่ม{getDataTypeLabel()}
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              {renderTableHeaders().map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {renderTableRow(item).map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(isAdding || editingId) && renderFormFields()}
    </div>
  );
};
