export interface IProviderCreate {
  userId: string
  bio: string
  experienceYears: number
  verified: number
}

export interface IProviderCreateResponse {
  message: string
  id: string
}

export interface IProviders {
  id: string
  userId: string
  bio: string
  experienceYears: number
  verified: number
  ratingAvg: number
  ratingCount: number
  completedJobs: number
  createdAt: string
  updatedAt: string
}

export interface IProviderCompleteData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: string;
  avatarUrl: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  provider: IProviderResponse;
}

export interface IProviderResponse {
  id: string;
  userId: string;
  bio: string;
  experienceYears: number;
  verified: number;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}
