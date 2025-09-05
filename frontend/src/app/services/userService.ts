/**
 * User Service - Handles user-related API operations
 * 
 * Provides methods for user registration, management, and data operations
 * Used primarily for user management in admin interfaces
 */

/**
 * User interface - represents user data structure
 */
export interface User {
  id: number | null; // User ID (null for new users)
  name: string; // Full name
  email: string; // Email address
  role: string; // User role (Admin, User, Manager)
  status: string; // Account status (Active, Inactive)
  address?: string; // Optional address
  country?: string; // Optional country
}

/**
 * Create User Data interface - data required for user registration
 */
export interface CreateUserData {
  name: string; // Required: Full name
  email: string; // Required: Email address
  password: string; // Required: Password
}

/**
 * UserService class - handles all user-related API operations
 */
class UserService {
  private baseUrl = 'http://localhost:3000'; // Backend API base URL

  /**
   * Create a new user via registration endpoint
   * @param userData - User registration data (name, email, password)
   * @returns Promise<User> - Created user data
   * @throws Error if registration fails
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Register the user through the authentication endpoint
      const registerResponse = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send registration data
      });

      // Check for registration errors
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Failed to register user');
      }

      // Registration successful - transform response to User interface
      const user = await registerResponse.json();
      return {
        id: user.id, // Use backend-generated ID
        name: userData.name,
        email: userData.email,
        role: 'User', // Default role for new users
        status: 'Active', // Default status
        address: '', // Empty address initially
        country: '', // Empty country initially
      };
    } catch (error) {
      // Re-throw error for handling by calling component
      throw error;
    }
  }

  /**
   * Fetch all users from the backend
   * @returns Promise<User[]> - Array of all users
   * @throws Error if fetch fails
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing user's information
   * @param userId - ID of the user to update
   * @param userData - Partial user data to update
   * @returns Promise<User> - Updated user data
   * @throws Error if update fails
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send updated data
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user from the system
   * @param userId - ID of the user to delete
   * @returns Promise<void> - No return value on success
   * @throws Error if deletion fails
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      // No return value needed for successful deletion
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance of the user service
export const userService = new UserService();

