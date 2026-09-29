export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  industry: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBusinessProfileRequest {
  name?: string;
  email?: string;
  phone?: string | null;
  industry?: string | null;
  location?: string | null;
}
