// Type definitions สำหรับใบรับประกัน
export interface FormData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  projectNameAndLocation: string;
  customerName: string;
  deliveryDate: string;
  productItems: string;
  batchNumber: string;
}

export interface CertificateDetails extends FormData {
  certificateNumber: string;
  issueDate: string;
}

export interface AppState {
  formData: FormData;
  certificateDetails: CertificateDetails | null;
  logoSrc: string | null;
}
