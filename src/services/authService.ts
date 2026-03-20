export type AppRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: AppRole;
  entities?: string[];
  isApproved?: boolean;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface SignupResponse {
  message: string;
  user: AuthUser;
}

interface PendingUsersResponse {
  users: AuthUser[];
}

interface ApproveUserResponse {
  message: string;
  emailSent: boolean;
  emailError?: string | null;
  user: AuthUser;
}

interface BackendAuthUser extends Partial<AuthUser> {
  _id?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "auth_token";

function parseErrorMessage(text: string, fallback: string): string {
  try {
    const parsed = JSON.parse(text) as { error?: string };
    return parsed.error || fallback;
  } catch {
    return text || fallback;
  }
}

function normalizeAuthUser(user: BackendAuthUser | null | undefined): AuthUser | null {
  if (!user) return null;

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

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorMessage(text, "Login failed"));
  }

  const data = (await res.json()) as { token: string; user?: BackendAuthUser };
  const user = normalizeAuthUser(data.user);
  if (!user) {
    throw new Error("Login response is missing user id");
  }

  return { token: data.token, user };
}

export async function registerUser(name: string, email: string, password: string, phone?: string): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorMessage(text, "Signup failed"));
  }

  const data = (await res.json()) as { message: string; user?: BackendAuthUser };
  const user = normalizeAuthUser(data.user);
  if (!user) {
    throw new Error("Signup response is missing user id");
  }

  return { message: data.message, user };
}

export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorMessage(text, "Failed to load user"));
  }

  const data = (await res.json()) as { user?: BackendAuthUser };
  return normalizeAuthUser(data.user);
}

export async function listPendingUsers(token: string): Promise<AuthUser[]> {
  const res = await fetch(`${API_BASE_URL}/auth/pending-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorMessage(text, "Failed to load pending users"));
  }

  const data = (await res.json()) as { users?: BackendAuthUser[] };
  if (!Array.isArray(data.users)) {
    return [];
  }

  return data.users
    .map((user) => normalizeAuthUser(user))
    .filter((user): user is AuthUser => Boolean(user));
}

export async function approveUser(token: string, userId: string): Promise<ApproveUserResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorMessage(text, "Failed to approve user"));
  }

  const data = (await res.json()) as { message: string; emailSent: boolean; emailError?: string | null; user?: BackendAuthUser };
  const user = normalizeAuthUser(data.user);
  if (!user) {
    throw new Error("Approval response is missing user id");
  }

  return {
    message: data.message,
    emailSent: data.emailSent,
    emailError: data.emailError,
    user,
  };
}
