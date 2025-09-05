'use client';

/**
 * UserContext - Global user authentication and profile management
 * 
 * Provides centralized user state management, authentication, and profile operations
 * Handles both regular users (with JWT tokens) and demo users (localStorage-based)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

/**
 * Interface defining the shape of the UserContext
 * Provides all user-related operations and state
 */
interface UserContextType {
  user: UserProfile | null; // Current user profile or null if not logged in
  login: (email: string, password: string) => Promise<boolean>; // Authentication function
  logout: () => void; // Logout function
  updateProfile: (data: { name?: string; phone?: string; address?: string; country?: string }) => Promise<boolean>; // Profile update
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>; // Password change
  isLoading: boolean; // Loading state for authentication checks
}

// Create the React context with undefined as default (will throw error if used outside provider)
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider Component
 * 
 * Provides user authentication state and methods to the entire application
 * Handles automatic authentication check on app startup
 * Manages both regular users (JWT) and demo users (localStorage)
 */
export function UserProvider({ children }: { children: ReactNode }) {
  // User state management
  const [user, setUser] = useState<UserProfile | null>(null); // Current user profile
  const [isLoading, setIsLoading] = useState(true); // Loading state during auth checks

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:3000/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
                     if (response.ok) {
             const userData = await response.json();
             setUser({
               id: userData.id,
               name: userData.name || 'John Doe',
               email: userData.email,
               phone: userData.phone,
               address: userData.address,
               country: userData.country,
               avatar: userData.name ? userData.name.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
             });
           } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          // Auth check failed, remove invalid token
          localStorage.removeItem('authToken');
        }
             } else {
         // Check if there's a demo user in localStorage
         const demoUser = localStorage.getItem('demoUser');
         if (demoUser) {
           setUser(JSON.parse(demoUser));
         }
         // Don't auto-login demo user - only load from localStorage if it exists
       }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login function - handles both regular and demo user authentication
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise<boolean> - true if login successful, false otherwise
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Special handling for demo user login
      if (email === 'demo@demo.com' && password === 'demo') {
        try {
          // Attempt to fetch demo user profile from backend
          const response = await fetch('http://localhost:3000/auth/demo/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            // Backend demo user exists, create profile from backend data
            const demoUserData = await response.json();
            const demoUser = {
              id: demoUserData.id || 'demo-user-1', // Use backend ID or fallback
              name: demoUserData.name || 'John Doe', // Use backend name or fallback
              email: 'demo@demo.com', // Fixed demo email
              phone: demoUserData.phone || '+1 (555) 123-4567', // Use backend phone or default
              address: demoUserData.address || '123 Main Street', // Use backend address or default
              country: demoUserData.country || 'United States', // Use backend country or default
              // Generate avatar initials from name
              avatar: demoUserData.name ? demoUserData.name.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
            };
            setUser(demoUser); // Set user state
            localStorage.setItem('demoUser', JSON.stringify(demoUser)); // Cache in localStorage
            return true;
          } else {
            // Fallback to static demo user if backend is unavailable
            const demoUser = {
              id: 'demo-user-1',
              name: 'John Doe',
              email: 'demo@demo.com',
              phone: '+1 (555) 123-4567',
              address: '123 Main Street',
              country: 'United States',
              // Generate avatar initials
              avatar: 'John Doe'.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase(),
            };
            setUser(demoUser);
            localStorage.setItem('demoUser', JSON.stringify(demoUser));
            return true;
          }
        } catch (error) {
          // Network error or backend unavailable - use static demo user
          const demoUser = {
            id: 'demo-user-1',
            name: 'John Doe',
            email: 'demo@demo.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main Street',
            country: 'United States',
            // Generate avatar initials from static name
            avatar: 'John Doe'.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase(),
          };
          setUser(demoUser);
          localStorage.setItem('demoUser', JSON.stringify(demoUser));
          return true;
        }
      }

      // Handle regular user authentication via backend API
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send credentials
      });

      if (response.ok) {
        // Login successful, extract JWT token
        const data = await response.json();
        localStorage.setItem('authToken', data.access_token); // Store JWT token
        
        // Fetch user profile using the JWT token
        const profileResponse = await fetch('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (profileResponse.ok) {
          // Profile fetch successful, set user state
          const userData = await profileResponse.json();
          setUser({
            id: userData.id,
            name: userData.name || 'John Doe', // Fallback name
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            country: userData.country,
            // Generate avatar initials from user's name
            avatar: userData.name ? userData.name.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
          });
          return true; // Login successful
        }
      }
      return false; // Login failed
    } catch (error) {
      // Network error or other login failure
      return false;
    }
  };

  /**
   * Logout function - clears all authentication data
   * Removes JWT tokens, demo user data, and resets user state
   */
  const logout = () => {
    localStorage.removeItem('authToken'); // Remove JWT token
    localStorage.removeItem('demoUser'); // Remove demo user data
    setUser(null); // Clear user state
  };

  /**
   * Update user profile - handles both regular and demo users
   * @param data - Profile data to update (name, phone, address, country)
   * @returns Promise<boolean> - true if update successful, false otherwise
   */
  const updateProfile = async (data: { name?: string; phone?: string; address?: string; country?: string }): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Demo user path - no JWT token, use demo profile endpoint
      if (!token) {
        try {
          // Update demo user profile via backend
          const response = await fetch('http://localhost:3000/auth/demo/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Send updated profile data
          });
          
          if (response.ok) {
            // Backend update successful, sync local state with backend response
            const updatedUserData = await response.json();
            setUser((prev: UserProfile | null) => {
              if (prev) {
                const updatedUser = { 
                  ...prev, // Keep existing data
                  ...data, // Apply new data
                  // Ensure we use the latest backend data (fallback to existing if not provided)
                  name: updatedUserData.name || prev.name,
                  phone: updatedUserData.phone || prev.phone,
                  address: updatedUserData.address || prev.address,
                  country: updatedUserData.country || prev.country,
                  // Regenerate avatar initials based on updated name
                  avatar: (updatedUserData.name || prev.name) ? (updatedUserData.name || prev.name).split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
                };
                // Persist updated demo user to localStorage for future sessions
                localStorage.setItem('demoUser', JSON.stringify(updatedUser));
                return updatedUser;
              }
              return null;
            });
            return true; // Update successful
          } else {
            throw new Error('Failed to update demo profile');
          }
        } catch (backendError) {
          // Backend unavailable - fallback to local-only update for demo user
          setUser((prev: UserProfile | null) => {
            if (prev) {
              const updatedUser = { 
                ...prev, // Keep existing data
                ...data, // Apply new data
                // Regenerate avatar initials if name changed
                avatar: (data.name || prev.name) ? (data.name || prev.name).split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
              };
              // Save to localStorage for persistence
              localStorage.setItem('demoUser', JSON.stringify(updatedUser));
              return updatedUser;
            }
            return null;
          });
          return true; // Local update successful
        }
      }

      // Regular user path - has JWT token, update via authenticated backend endpoint
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`, // Include JWT token for authentication
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send updated profile data
      });

      if (response.ok) {
        // Backend update successful, update local state
        const updatedUser = await response.json();
        setUser((prev: UserProfile | null) => prev ? { 
          ...prev, // Keep existing data
          ...updatedUser, // Apply backend response data
          // Regenerate avatar initials based on updated name
          avatar: (updatedUser.name || prev.name) ? (updatedUser.name || prev.name).split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase() : 'JD',
        } : null);
        return true; // Update successful
      }
      return false; // Backend update failed
    } catch (error) {
      // Network error or other profile update failure
      return false;
    }
  };

  /**
   * Change user password - only available for regular users (not demo users)
   * @param currentPassword - User's current password for verification
   * @param newPassword - New password to set
   * @returns Promise<boolean> - true if password change successful, false otherwise
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false; // No JWT token means demo user - password change not supported

      // Send password change request to backend
      const response = await fetch('http://localhost:3000/auth/profile/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`, // Include JWT for authentication
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }), // Send both passwords
      });

      return response.ok; // Return true if password change successful
    } catch (error) {
      // Network error or other password change failure
      return false;
    }
  };

  // Provide the context value to all child components
  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile, changePassword, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to access the UserContext
 * 
 * Provides easy access to user state and authentication methods
 * Throws an error if used outside of UserProvider to catch development mistakes
 * 
 * @returns UserContextType - Object containing user state and methods
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
