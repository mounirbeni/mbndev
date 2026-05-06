export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatar?: string;
  company?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
export type ProjectType = 'landing-page' | 'ecommerce' | 'saas' | 'portfolio' | 'web-app' | 'custom';

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate?: string;
}

export interface ProjectFile {
  _id?: string;
  name: string;
  url: string;
  uploadedBy?: User;
  uploadedAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  client: User | string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  budget: number;
  deadline?: string;
  features?: string[];
  designPreferences?: {
    style?: string;
    colors?: string[];
    references?: string[];
  };
  milestones?: Milestone[];
  files?: ProjectFile[];
  revisions: number;
  maxRevisions: number;
  package?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  project: string | Project;
  sender: User;
  content: string;
  attachments?: { name: string; url: string }[];
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  _id: string;
  project: Project | string;
  client: User | string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  milestoneTitle?: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Package {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  features: string[];
  pages?: number;
  revisions?: number;
  deliveryDays?: number;
  popular?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
