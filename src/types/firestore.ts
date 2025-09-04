// Firestore Schema และ Types สำหรับ E-Certificate System

export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  buyer?: string; // ผู้ซื้อสินค้า
  projects?: string[]; // Array of project IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  customerId: string;
  customerName: string; // Denormalized for easier queries
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  defaultWarrantyYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchNumber {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string; // Denormalized
  productionDate: Date;
  expiryDate?: Date;
  quantity?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  
  // Company Information
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  companyLogoUrl?: string;
  
  // Customer & Project Information
  customerId: string;
  customerName: string;
  buyer?: string; // ผู้ซื้อสินค้า
  projectId: string;
  projectName: string;
  projectLocation: string;
  
  // Product Information
  productItems: string;
  batchNumbers: string[]; // เปลี่ยนเป็น array สำหรับ multi-tag
  batchNumber?: string; // เก็บไว้เพื่อ backward compatibility
  additionalNotes?: string; // หมายเหตุเพิ่มเติม

  // Dates
  deliveryDate: Date;
  issueDate: Date;
  warrantyExpiration: Date;
  
  // Status
  status: 'draft' | 'issued' | 'expired' | 'claimed';
  isActive: boolean;
  
  // Metadata
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // PDF Information
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
}

// Dropdown Data Interfaces
export interface DropdownOption {
  value: string;
  label: string;
  isActive?: boolean;
}

export interface FormDropdownData {
  companies: DropdownOption[];
  customers: DropdownOption[];
  projects: DropdownOption[];
  products: DropdownOption[];
  batchNumbers: DropdownOption[];
}

// Firebase Collections Names
export const COLLECTIONS = {
  COMPANIES: 'companies',
  CUSTOMERS: 'customers', 
  PROJECTS: 'projects',
  PRODUCTS: 'products',
  BATCH_NUMBERS: 'batch_numbers',
  CERTIFICATES: 'certificates',
} as const;
