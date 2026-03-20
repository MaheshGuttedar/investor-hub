import { AuthUser, getStoredToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function requireToken(): string {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  return token;
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text) as { error?: string };
    return parsed.error || fallback;
  } catch {
    return text || fallback;
  }
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${requireToken()}`,
    "Content-Type": "application/json",
  };
}

function normalizeUser(user: Partial<AuthUser> & { _id?: string }): AuthUser | null {
  const id = user.id || user._id;
  if (!id) return null;

  return {
    id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone,
    role: user.role,
    entities: Array.isArray(user.entities) ? user.entities : [],
    isApproved: user.isApproved,
  };
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  location?: string;
  targetRaise?: number;
  targetIrr?: number;
  status?: "active" | "funded" | "exited";
}

export interface CreateInvestmentPayload {
  userId: string;
  projectId: string;
  amount: number;
  date: string;
  entity?: string;
}

export interface CreateTransactionPayload {
  projectName: string;
  investmentName?: string;
  type: "investment" | "distribution" | "return";
  amount: number;
  status: "completed" | "pending" | "processing";
  entity: string;
  date: string;
}

export interface CreateTaxDocumentPayload {
  name: string;
  investingEntity: string;
  asset?: string;
  year: number;
  sharedDate: string;
  projectName: string;
  url?: string;
  isNew?: boolean;
}

export interface CreateFinancialDocumentPayload {
  name: string;
  investingEntity: string;
  asset?: string;
  category?: string;
  year: number;
  sharedDate: string;
  projectName: string;
  url?: string;
}

export async function listAdminUsers(): Promise<AuthUser[]> {
  const res = await fetch(`${API_BASE_URL}/auth/users`, {
    headers: {
      Authorization: `Bearer ${requireToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to load investors"));
  }

  const data = (await res.json()) as { users?: Array<Partial<AuthUser> & { _id?: string }> };
  return Array.isArray(data.users)
    ? data.users.map(normalizeUser).filter((user): user is AuthUser => Boolean(user))
    : [];
}

export async function createProject(payload: CreateProjectPayload) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to create project"));
  }

  return res.json();
}

export async function createInvestment(payload: CreateInvestmentPayload) {
  const res = await fetch(`${API_BASE_URL}/investments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to assign investment"));
  }

  return res.json();
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to create transaction"));
  }

  return res.json();
}

export async function createTaxDocument(payload: CreateTaxDocumentPayload) {
  const res = await fetch(`${API_BASE_URL}/tax-documents`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to create tax document"));
  }

  return res.json();
}

export async function createFinancialDocument(payload: CreateFinancialDocumentPayload) {
  const res = await fetch(`${API_BASE_URL}/financial-documents`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to create financial document"));
  }

  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string; originalName: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to upload file"));
  }

  return res.json();
}