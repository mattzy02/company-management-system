/**
 * Shared TypeScript interfaces for the Company Management System
 */

// API Response Types
export interface ApiCompany {
  company_code: string;
  company_name: string;
  level?: number;
  country?: string;
  city?: string;
  year_founded?: string;
  annual_revenue?: number;
  employees?: number;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Frontend Types
export interface Company {
  id: string;
  name: string;
  level: number;
  country: string;
  city: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  originalValue?: number;
  color: string;
}

export interface LineChartDataPoint {
  year: number;
  count: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  avatar: string;
}

// Filter Types
export interface CompanyFilter {
  level?: number[];
  country?: string[];
  city?: string[];
  founded_year?: {
    start?: number;
    end?: number;
  };
  annual_revenue?: {
    min?: number;
    max?: number;
  };
  employees?: {
    min?: number;
    max?: number;
  };
}

export interface FilterCompanyRequest {
  dimension: 'level' | 'country' | 'city';
  filter?: CompanyFilter;
}

// Component Props Types
export interface DataCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export interface ChartProps {
  width?: number | string;
  height?: number;
}
