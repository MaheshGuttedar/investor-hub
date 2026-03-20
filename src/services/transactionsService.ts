import { getStoredToken } from './authService';

export interface ApiTransaction {
  _id: string;
  investmentName?: string;
  projectName: string;
  type: "investment" | "distribution" | "return";
  amount: number;
  status: "completed" | "pending" | "processing";
  entity: string;
  date: string;
}

interface ListTransactionsResponse {
  transactions: ApiTransaction[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function listTransactions(): Promise<ApiTransaction[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch transactions (${res.status})`);
  }

  const data = (await res.json()) as ListTransactionsResponse;
  return Array.isArray(data.transactions) ? data.transactions : [];
}
