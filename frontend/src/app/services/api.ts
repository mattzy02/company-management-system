/**
 * API Service - Centralized backend communication layer
 * 
 * Provides type-safe methods for interacting with the backend API
 * Handles authentication, error handling, and data transformation
 */

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Company interface - represents company data from backend API
 * Fields are nullable to handle incomplete data from the backend
 */
export interface Company {
  id?: string;
  company_code: string | null;
  company_name: string | null;
  level: number | null;
  country: string | null;
  city: string | null;
  year_founded: number | null;
  annual_revenue: number | null;
  employees: number | null;
}

/**
 * Company hierarchy node - represents nested company structure
 * Used for hierarchical visualizations and parent-child relationships
 */
export interface CompanyHierarchyNode {
  company_code: string; // Unique company identifier
  company_name: string; // Company display name
  level?: number; // Hierarchy level (1-4)
  country?: string; // Company location
  city?: string; // Company city
  year_founded?: number; // Founding year
  annual_revenue?: number; // Revenue in currency units
  employees?: number; // Number of employees
  children?: CompanyHierarchyNode[]; // Child companies in hierarchy
}

/**
 * Filter company DTO - request structure for company filtering
 * Allows filtering companies by multiple criteria
 */
export interface FilterCompanyDto {
  dimension: 'level' | 'country' | 'city'; // Primary grouping dimension
  filter: {
    level: number[]; // Filter by hierarchy levels
    country: string[]; // Filter by countries
    city: string[]; // Filter by cities
    founded_year: { // Filter by founding year range
      start: number;
      end: number;
    };
    annual_revenue: { // Filter by revenue range
      min: number;
      max: number;
    };
    employees: { // Filter by employee count range
      min: number;
      max: number;
    };
  };
}

/**
 * Company hierarchy DTO - request structure for hierarchy queries
 * Used to fetch company hierarchy trees starting from a specific company
 */
export interface CompanyHierarchyDto {
  company_code: string; // Root company code
  max_depth: number; // Maximum depth to traverse
}

export interface Account {
  id: string;
  account_number: string;
  account_name: string;
  account_type: 'savings' | 'checking' | 'credit' | 'investment';
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  balance: number;
  currency: string;
  description?: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateAccountDto {
  account_number: string;
  account_name: string;
  account_type: 'savings' | 'checking' | 'credit' | 'investment';
  status?: 'active' | 'inactive' | 'suspended' | 'closed';
  balance?: number;
  currency?: string;
  description?: string;
  user_id: string;
}

export interface UpdateAccountDto {
  account_number?: string;
  account_name?: string;
  account_type?: 'savings' | 'checking' | 'credit' | 'investment';
  status?: 'active' | 'inactive' | 'suspended' | 'closed';
  balance?: number;
  currency?: string;
  description?: string;
}

export interface FilterAccountDto {
  user_id?: string;
  account_type?: 'savings' | 'checking' | 'credit' | 'investment';
  status?: 'active' | 'inactive' | 'suspended' | 'closed';
  account_number?: string;
  account_name?: string;
  currency?: string;
  min_balance?: number;
  max_balance?: number;
  page?: number;
  limit?: number;
}

/**
 * ApiService - Main service class for backend API communication
 * 
 * Provides a centralized interface for all API operations
 * Handles HTTP requests, error handling, and response parsing
 */
class ApiService {
  /**
   * Generic HTTP request method
   * @param endpoint - API endpoint path (relative to base URL)
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Promise with parsed JSON response
   * @throws Error if request fails
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`; // Build full URL
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json', // Default JSON content type
        ...options.headers, // Allow header overrides
      },
      ...options, // Spread other fetch options
    });

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (like DELETE operations)
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return undefined as T; // Return undefined for empty responses
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json(); // Parse and return JSON response
    }

    return undefined as T; // Return undefined for non-JSON responses
  }

  /**
   * Company API Methods
   */
  
  // Fetch all companies from the database
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/company');
  }

  // Fetch a specific company by its ID
  async getCompany(id: string): Promise<Company> {
    return this.request<Company>(`/company/${id}`);
  }

  // Filter companies based on criteria (level, country, revenue, etc.)
  async filterCompanies(filterDto: FilterCompanyDto): Promise<any> {
    return this.request<any>('/company/filter', {
      method: 'POST',
      body: JSON.stringify(filterDto),
    });
  }

  // Get hierarchical company structure for visualization
  async getCompanyHierarchy(hierarchyDto: CompanyHierarchyDto): Promise<CompanyHierarchyNode> {
    return this.request<CompanyHierarchyNode>('/company/hierarchy', {
      method: 'POST',
      body: JSON.stringify(hierarchyDto),
    });
  }

  // Create a new company record
  async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    return this.request<Company>('/company', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  // Update an existing company's information
  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    return this.request<Company>(`/company/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(company),
    });
  }

  // Remove a company from the database
  async deleteCompany(id: string): Promise<void> {
    return this.request<void>(`/company/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Account Management API Methods
   */
  
  // Fetch all accounts from the database
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>('/account');
  }

  // Fetch a specific account by its ID
  async getAccount(id: string): Promise<Account> {
    return this.request<Account>(`/account/${id}`);
  }

  // Filter accounts based on criteria (user, type, status, etc.)
  async filterAccounts(filterDto: FilterAccountDto): Promise<{ accounts: Account[]; total: number }> {
    return this.request<{ accounts: Account[]; total: number }>('/account/filter', {
      method: 'POST',
      body: JSON.stringify(filterDto),
    });
  }

  // Get account statistics (balances, counts, etc.)
  async getAccountStats(userId?: string): Promise<any> {
    const endpoint = userId ? `/account/user/${userId}/stats` : '/account/stats';
    return this.request<any>(endpoint);
  }

  // Fetch all accounts belonging to a specific user
  async getAccountsByUser(userId: string): Promise<Account[]> {
    return this.request<Account[]>(`/account/user/${userId}`);
  }

  // Create a new account record
  async createAccount(account: CreateAccountDto): Promise<Account> {
    return this.request<Account>('/account', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  // Update an existing account's information
  async updateAccount(id: string, account: UpdateAccountDto): Promise<Account> {
    return this.request<Account>(`/account/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  }

  // Remove an account from the database
  async deleteAccount(id: string): Promise<void> {
    return this.request<void>(`/account/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance of the API service
// This ensures consistent usage across the application
export const apiService = new ApiService();
