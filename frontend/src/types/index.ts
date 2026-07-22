export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  plan?: 'starter' | 'pro' | 'premium' | 'custom';
  avatar?: string;
  company?: string;
  phone?: string;
  isActive?: boolean;
  deletionRequestedAt?: string | null;
  createdAt?: string;
}

// Updated to include paid & revision statuses
export type ProjectStatus =
  | 'pending'
  | 'paid'
  | 'in-progress'
  | 'review'
  | 'revision'
  | 'completed'
  | 'cancelled';

export type ProjectType = 'landing-page' | 'ecommerce' | 'saas' | 'portfolio' | 'web-app' | 'custom';

export type ServiceType = 'website' | 'ecommerce' | 'dashboard' | 'mobile' | 'custom';

export interface Milestone {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate?: string;
}

export interface ProjectFile {
  id?: string;
  _id?: string;
  name: string;
  url: string;
  uploadedBy?: User;
  uploadedAt?: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Project {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  client: User | string;
  orderId?: string;
  type: ProjectType | string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  deadline?: string;
  features?: string[];
  designStyle?: string;
  designColors?: string[];
  designRefs?: string[];
  isInstallment?: boolean;
  clientNameOverride?: string | null;
  clientCompanyOverride?: string | null;
  // Legacy nested shape (some pages still use this)
  designPreferences?: {
    style?: string;
    colors?: string[];
    references?: string[];
  };
  milestones?: Milestone[];
  files?: ProjectFile[];
  activityLogs?: ActivityLog[];
  revisions: number;
  maxRevisions: number;
  package?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id?: string;
  _id?: string;
  projectId?: string;
  project?: string | Project;
  sender?: User | null;
  senderId?: string | null;
  content: string;
  type?: 'user' | 'system';
  attachments?: { name: string; url: string }[];
  isRead: boolean;
  createdAt: string;
}

export interface MessageThread {
  projectId:     string;
  projectTitle:  string;
  projectStatus: string;
  client?:       Pick<User, 'id' | 'name' | 'avatar'>;
  lastMessage:   {
    text:        string;
    type:        'user' | 'system';
    senderName?: string;
    createdAt:   string;
  } | null;
  unreadCount: number;
  updatedAt:   string;
}

export interface Payment {
  id?: string;
  _id?: string;
  project?: Project | string;
  order?: Order | string;
  client: User | string;
  amount: number;
  currency: string;
  status: 'pending' | 'pending_verification' | 'processing' | 'paid' | 'partial' | 'failed' | 'refunded';
  method?: string;
  milestoneTitle?: string;
  description?: string;
  // Evidence & tracing
  externalRef?: string;        // bank ref / PayPal txn ID supplied by the client as proof
  snapshotAmount?: number;     // amount locked at submission (tamper-proof)
  expiresAt?: string;          // pending_verification auto-expires at this time (72 h)
  ipAddress?: string;          // submitter IP (forensic)
  // Fraud / risk
  riskScore?: number;          // 0–100; ≥60 = flagged; ≥80 = high-risk
  flaggedReason?: string;      // human-readable flags set by fraud engine
  // Outcome
  rejectionReason?: string;    // set by admin when rejecting — shown to the client
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentEvent {
  id: string;
  paymentId: string;
  actorId?: string | null;
  actorRole?: string | null;
  event: string;
  fromStatus?: string | null;
  toStatus: string;
  note?: string | null;
  metadata?: Record<string, any> | null;
  ip?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  client?: Pick<User, 'id' | 'name' | 'email' | 'company'>;
  serviceType: ServiceType;
  title: string;
  description?: string;
  pages: number;
  features: string[];
  addons: string[];
  totalPrice: number;
  deliveryDays: number;
  notes?: string;
  status: 'pending' | 'paid' | 'cancelled';
  designStyle?: string;
  designColors?: string[];
  designRefs?: string[];
  project?: Pick<Project, 'id' | 'title' | 'status' | 'progress'> | null;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Package {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  badge?: string;
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
