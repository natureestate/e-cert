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
  DocumentReference
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

const db = getFirestore(app);
const storage = getStorage(app);

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
    const docRef = await addDoc(collection(db, COLLECTIONS.COMPANIES), {
      ...company,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
      ...customer,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...project,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...product,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.BATCH_NUMBERS), {
      ...batch,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.CERTIFICATES), {
      ...certificate,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
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

  // Initialize default data (เรียกใช้ครั้งแรกเพื่อสร้างข้อมูลตัวอย่าง)
  static async initializeDefaultData(): Promise<void> {
    try {
      // Check if data already exists
      const companies = await this.getCompanies();
      if (companies.length > 0) {
        console.log('Default data already exists');
        return;
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

  static async createWorkDelivery(delivery: any): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTIONS.WORK_DELIVERIES), {
      ...delivery,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  static async updateWorkDelivery(id: string, updates: any): Promise<void> {
    const docRef = doc(db, COLLECTIONS.WORK_DELIVERIES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }
}
