export interface NewAssociate {
  id: string;
  first_name: string;
  last_name: string;
  doc_type: 'CC' | 'PPT' | 'CE' | 'PASAPORTE' | 'TI';
  doc_number: string;
  phone: string;
  email: string;
  department: string;
  municipality: string;
  address: string;
  habeas_data: boolean;
  certificate_folio: string;
  created_at: string;
}

export interface ExistingAssociateUpdate {
  id: string;
  full_name: string;
  doc_type: 'CC' | 'PPT' | 'CE' | 'PASAPORTE';
  doc_number: string;
  phone: string;
  email: string;
  intl_account_number: string;
  bank_name: string;
  country_bank: string;
  swift_bic: string;
  habeas_data: boolean;
  certificate_folio: string;
  created_at: string;
}

export interface CertificateData {
  title: string;
  fullName: string;
  docType: string;
  docNumber: string;
  email: string;
  phone: string;
  location?: string;
  intlAccount?: string;
  bankName?: string;
  folio: string;
  issuedAt: string;
  type: 'NEW_ASSOCIATE' | 'EXISTING_UPDATE';
}
