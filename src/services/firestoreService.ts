import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentReference,
  setDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import app from '../config/firebase';
import {
  Company,
  Customer,
  Project,
  Product,
  BatchNumber,
  Certificate,
  DropdownOption,
  FormDropdownData,
  COLLECTIONS
} from '../types/firestore';
import { PhaseTemplateFirestore } from '../types/workDelivery';

const db = getFirestore(app);
const storage = getStorage(app);

// ฟังก์ชันสร้าง Document ID รูปแบบ UUID YY MM DD
const generateDocumentId = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // เอาปีสองหลักสุดท้าย
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // เดือนสองหลัก
  const day = now.getDate().toString().padStart(2, '0'); // วันสองหลัก
  
  // สร้าง UUID ง่ายๆ สำหรับส่วนที่เหลือ
  const chars = '0123456789ABCDEF';
  let uuid = '';
  for (let i = 0; i < 8; i++) {
    uuid += chars[Math.floor(Math.random() * 16)];
  }
  
  return `${year}${month}${day}-${uuid}`;
};

// Helper function to convert Firestore timestamps
const convertTimestamp = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Generic CRUD Operations
export class FirestoreService {
  
  // Companies
  static async getCompanies(): Promise<Company[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.COMPANIES), 
            where('isActive', '==', true))
    );
    const companies = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Company);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return companies.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.COMPANIES, customId);
    await setDoc(docRef, {
      ...company,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.COMPANIES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Customers
  static async getCustomers(): Promise<Customer[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.CUSTOMERS), 
            where('isActive', '==', true))
    );
    const customers = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Customer);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return customers.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customId);
    await setDoc(docRef, {
      ...customer,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PROJECTS), 
            where('isActive', '==', true))
    );
    const projects = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Project);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async getProjectsByCustomer(customerId: string): Promise<Project[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PROJECTS), 
            where('customerId', '==', customerId),
            where('isActive', '==', true))
    );
    const projects = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Project);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.PROJECTS, customId);
    await setDoc(docRef, {
      ...project,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PRODUCTS), 
            where('isActive', '==', true))
    );
    const products = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Product);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.PRODUCTS, customId);
    await setDoc(docRef, {
      ...product,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Batch Numbers
  static async getBatchNumbers(): Promise<BatchNumber[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.BATCH_NUMBERS), 
            where('isActive', '==', true))
    );
    const batchNumbers = querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as BatchNumber);
    
    // Sort in memory แทนการใช้ orderBy ใน Firestore
    return batchNumbers.sort((a, b) => a.batchNumber.localeCompare(b.batchNumber));
  }

  static async createBatchNumber(batch: Omit<BatchNumber, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.BATCH_NUMBERS, customId);
    await setDoc(docRef, {
      ...batch,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateBatchNumber(id: string, updates: Partial<Omit<BatchNumber, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BATCH_NUMBERS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Certificates
  static async getCertificates(): Promise<Certificate[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.CERTIFICATES), 
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as Certificate);
  }

  static async createCertificate(certificate: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.CERTIFICATES, customId);
    await setDoc(docRef, {
      ...certificate,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateCertificate(id: string, updates: Partial<Certificate>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CERTIFICATES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // ลบ document ใดๆ จาก collection
  static async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  }

  // Get dropdown data for forms
  static async getFormDropdownData(): Promise<FormDropdownData> {
    const [companies, customers, projects, products, batchNumbers] = await Promise.all([
      this.getCompanies(),
      this.getCustomers(),
      this.getProjects(),
      this.getProducts(),
      this.getBatchNumbers()
    ]);

    return {
      companies: companies.map(c => ({ value: c.id, label: c.name })),
      customers: customers.map(c => ({ value: c.id, label: c.name })),
      projects: projects.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` })),
      products: products.map(p => ({ value: p.id, label: p.name })),
      batchNumbers: batchNumbers.map(b => ({ value: b.id, label: b.batchNumber }))
    };
  }

  // File Storage Operations
  static async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  static async deleteFile(url: string): Promise<void> {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }

  // Clear all data (for reset)
  static async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all data...');
      
      const [companies, customers, projects, products, batchNumbers, certificates] = await Promise.all([
        this.getCompanies(),
        this.getCustomers(),
        this.getProjects(),
        this.getProducts(),
        this.getBatchNumbers(),
        this.getCertificates()
      ]);

      // Delete all documents
      const deletePromises = [
        ...companies.map(item => this.deleteDocument(COLLECTIONS.COMPANIES, item.id)),
        ...customers.map(item => this.deleteDocument(COLLECTIONS.CUSTOMERS, item.id)),
        ...projects.map(item => this.deleteDocument(COLLECTIONS.PROJECTS, item.id)),
        ...products.map(item => this.deleteDocument(COLLECTIONS.PRODUCTS, item.id)),
        ...batchNumbers.map(item => this.deleteDocument(COLLECTIONS.BATCH_NUMBERS, item.id)),
        ...certificates.map(item => this.deleteDocument(COLLECTIONS.CERTIFICATES, item.id))
      ];

      await Promise.all(deletePromises);
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Initialize default data (เรียกใช้ครั้งแรกเพื่อสร้างข้อมูลตัวอย่าง)
  static async initializeDefaultData(force = false): Promise<void> {
    try {
      // Check if data already exists
      const companies = await this.getCompanies();
      if (companies.length > 0 && !force) {
        console.log('Default data already exists');
        return;
      }

      if (force) {
        await this.clearAllData();
      }

      console.log('Creating default data...');

      // Create default company
      const companyId = await this.createCompany({
        name: 'บริษัท พรีคาสท์คอนกรีต จำกัด (มหาชน)',
        address: '99/9 อาคารคอนกรีต ถนนพัฒนา แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
        phone: '02-123-4567',
        website: 'www.precast.co.th',
        isActive: true
      });

      // Create default customers
      const customerId1 = await this.createCustomer({
        name: 'คุณสมชาย รักบ้าน',
        phone: '081-234-5678',
        email: 'somchai@email.com',
        buyer: 'นายสมชาย ใจดี',
        isActive: true
      });

      const customerId2 = await this.createCustomer({
        name: 'คุณสมหญิง สร้างบ้าน',
        phone: '089-765-4321',
        email: 'somying@email.com',
        buyer: 'นางสาวสมหญิง สวยงาม',
        isActive: true
      });

      // Create additional test customer
      const customerId3 = await this.createCustomer({
        name: 'คุณทดสอบ เพิ่มข้อมูล',
        phone: '02-555-1234',
        email: 'test@email.com',
        buyer: 'นายทดสอบ ระบบ',
        isActive: true
      });

      // Create default projects
      await this.createProject({
        name: 'โครงการหมู่บ้านเจริญสุข',
        location: '123 หมู่ 4 ต.บางรัก อ.เมือง จ.นนทบุรี 11000',
        customerId: customerId1,
        customerName: 'คุณสมชาย รักบ้าน',
        description: 'โครงการบ้านเดี่ยว 50 หลัง',
        isActive: true
      });

      await this.createProject({
        name: 'โครงการคอนโดมิเนียมสมัยใหม่',
        location: '456 ถนนรัชดา แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
        customerId: customerId2,
        customerName: 'คุณสมหญิง สร้างบ้าน',
        description: 'อาคารสูง 30 ชั้น',
        isActive: true
      });

      // Create additional test projects
      await this.createProject({
        name: 'โครงการทดสอบ บ้านเดี่ยว',
        location: '789 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100',
        customerId: customerId3,
        customerName: 'คุณทดสอบ เพิ่มข้อมูล',
        description: 'โครงการทดสอบระบบ',
        isActive: true
      });

      await this.createProject({
        name: 'โครงการทดสอบ บ้านแฝด',
        location: '321 ถนนทดสอบ2 แขวงทดสอบ2 เขตทดสอบ2 กรุงเทพฯ 10200',
        customerId: customerId3,
        customerName: 'คุณทดสอบ เพิ่มข้อมูล',
        description: 'โครงการทดสอบระบบ แบบที่ 2',
        isActive: true
      });

      // Create default products
      const productId1 = await this.createProduct({
        name: 'แผ่นพื้นสำเร็จ',
        category: 'โครงสร้าง',
        description: 'แผ่นพื้นสำเร็จรูป Precast Concrete',
        defaultWarrantyYears: 3,
        isActive: true
      });

      const productId2 = await this.createProduct({
        name: 'ผนังรับน้ำหนัก',
        category: 'โครงสร้าง',
        description: 'ผนังรับน้ำหนัก Precast Concrete',
        defaultWarrantyYears: 3,
        isActive: true
      });

      // Create default batch numbers
      await this.createBatchNumber({
        batchNumber: 'BATCH-2024-08-A01',
        productId: productId1,
        productName: 'แผ่นพื้นสำเร็จ',
        productionDate: new Date('2024-08-01'),
        quantity: 100,
        notes: 'ผลิตในช่วงต้นเดือน',
        isActive: true
      });

      await this.createBatchNumber({
        batchNumber: 'BATCH-2024-08-B01',
        productId: productId2,
        productName: 'ผนังรับน้ำหนัก',
        productionDate: new Date('2024-08-15'),
        quantity: 50,
        notes: 'ผลิตในช่วงกลางเดือน',
        isActive: true
      });

      console.log('Default data created successfully!');
    } catch (error) {
      console.error('Error creating default data:', error);
    }
  }

  // Work Deliveries
  static async getWorkDeliveries(): Promise<any[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.WORK_DELIVERIES), 
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getWorkDeliveryById(id: string): Promise<any | null> {
    const docRef = doc(db, COLLECTIONS.WORK_DELIVERIES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamp({
        id: docSnap.id,
        ...docSnap.data()
      });
    }
    return null;
  }

  static async createWorkDelivery(delivery: any): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    
    // สร้างหมายเลขใบส่งมอบ
    const deliveryNumber = `WD-${delivery.workType.toUpperCase()}-${customId}`;
    
    const docRef = doc(db, COLLECTIONS.WORK_DELIVERIES, customId);
    await setDoc(docRef, {
      ...delivery,
      id: customId,
      deliveryNumber,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updateWorkDelivery(id: string, updates: any): Promise<void> {
    const docRef = doc(db, COLLECTIONS.WORK_DELIVERIES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteWorkDelivery(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.WORK_DELIVERIES, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date()
    });
  }

  // Phase Templates
  static async getPhaseTemplates(): Promise<PhaseTemplateFirestore[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PHASE_TEMPLATES), 
            where('isActive', '==', true),
            orderBy('workType', 'asc'),
            orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => convertTimestamp({
      id: doc.id,
      ...doc.data()
    }) as PhaseTemplateFirestore);
  }

  static async getPhaseTemplateById(id: string): Promise<PhaseTemplateFirestore | null> {
    const docRef = doc(db, COLLECTIONS.PHASE_TEMPLATES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamp({
        id: docSnap.id,
        ...docSnap.data()
      }) as PhaseTemplateFirestore;
    }
    return null;
  }

  static async createPhaseTemplate(template: Omit<PhaseTemplateFirestore, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const customId = generateDocumentId();
    const docRef = doc(db, COLLECTIONS.PHASE_TEMPLATES, customId);
    await setDoc(docRef, {
      ...template,
      createdAt: now,
      updatedAt: now
    });
    return customId;
  }

  static async updatePhaseTemplate(id: string, updates: Partial<Omit<PhaseTemplateFirestore, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PHASE_TEMPLATES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deletePhaseTemplate(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PHASE_TEMPLATES, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date()
    });
  }

  // Initialize default phase templates
  static async initializeDefaultPhaseTemplates(): Promise<void> {
    try {
      const existingTemplates = await this.getPhaseTemplates();
      if (existingTemplates.length > 0) {
        console.log('Phase templates already exist');
        return;
      }

      console.log('Creating default phase templates...');

      // สร้าง default templates จากข้อมูลเดิม
      const { defaultHouseConstructionPhases, defaultPrecastPhases } = await import('../types/workDelivery');

      // Template สำหรับบ้าน 1 ชั้น
      await this.createPhaseTemplate({
        name: 'งานรับสร้างบ้าน 1 ชั้น (เทมเพลตมาตรฐาน)',
        workType: 'house-construction',
        buildingType: 'single-story',
        description: 'เทมเพลตงวดงานมาตรฐานสำหรับงานรับสร้างบ้าน 1 ชั้น',
        phases: defaultHouseConstructionPhases.slice(0, 8),
        isActive: true,
        isDefault: true
      });

      // Template สำหรับบ้าน 2 ชั้น
      await this.createPhaseTemplate({
        name: 'งานรับสร้างบ้าน 2 ชั้น (เทมเพลตมาตรฐาน)',
        workType: 'house-construction',
        buildingType: 'two-story',
        description: 'เทมเพลตงวดงานมาตรฐานสำหรับงานรับสร้างบ้าน 2 ชั้น',
        phases: defaultHouseConstructionPhases,
        isActive: true,
        isDefault: true
      });

      // Template สำหรับ Precast Concrete
      await this.createPhaseTemplate({
        name: 'งาน Precast Concrete (เทมเพลตมาตรฐาน)',
        workType: 'precast-concrete',
        description: 'เทมเพลตงวดงานมาตรฐานสำหรับงาน Precast Concrete',
        phases: defaultPrecastPhases,
        isActive: true,
        isDefault: true
      });

      console.log('Default phase templates created successfully!');
    } catch (error) {
      console.error('Error creating default phase templates:', error);
    }
  }
}
