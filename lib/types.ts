export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type Role = 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'admin' | 'store_owner' | 'supporter' | 'customer';

export interface AdminPermissionSet {
  canManageCMS?: boolean;
  canPublishCMS?: boolean;
  canManageMedia?: boolean;
  canManageMarketplace?: boolean;
  canManageDonations?: boolean;
  canManagePermissions?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
  storeId?: string;
  permissions?: AdminPermissionSet;
  createdAt: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  ownerId: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  rating: number;
  location: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  featured: boolean;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalDonated: number;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  amount: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  availability: string;
  experience: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  location: string;
  category?: string;
  status: 'planning' | 'active' | 'completed';
  statusLabel?: string;
  progress: number;
  description: string;
  story?: string;
  featuredImage?: string;
  images: string[];
  additionalMedia?: ProjectMediaItem[];
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingEstimate: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
