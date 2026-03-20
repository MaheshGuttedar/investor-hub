import { getStoredToken } from './authService';

export interface ApiProject {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  targetRaise?: number;
  currentRaised?: number;
  targetIrr?: number;
  status: "active" | "funded" | "exited";
  images?: string[];
  createdAt?: string;
}

interface ListProjectsResponse {
  projects: ApiProject[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function listProjects(): Promise<ApiProject[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch projects (${res.status})`);
  }

  const data = (await res.json()) as ListProjectsResponse;
  return Array.isArray(data.projects) ? data.projects : [];
}
