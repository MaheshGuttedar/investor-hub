import { getStoredToken } from './authService';

export interface ApiTaxDocument {
  _id: string;
  name: string;
  investingEntity: string;
  asset: string;
  year: number;
  sharedDate: string;
  projectName: string;
  url: string;
  isNew?: boolean;
}

export interface ApiFinancialDocument {
  _id: string;
  name: string;
  investingEntity: string;
  asset: string;
  category: string;
  year: number;
  sharedDate: string;
  projectName: string;
  url: string;
}

interface ListTaxDocumentsResponse {
  taxDocuments: ApiTaxDocument[];
}

interface ListFinancialDocumentsResponse {
  financialDocuments: ApiFinancialDocument[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function listTaxDocuments(): Promise<ApiTaxDocument[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/tax-documents`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch tax documents (${res.status})`);
  }

  const data = (await res.json()) as ListTaxDocumentsResponse;
  return Array.isArray(data.taxDocuments) ? data.taxDocuments : [];
}

export async function listFinancialDocuments(): Promise<ApiFinancialDocument[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/financial-documents`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch financial documents (${res.status})`);
  }

  const data = (await res.json()) as ListFinancialDocumentsResponse;
  return Array.isArray(data.financialDocuments) ? data.financialDocuments : [];
}
