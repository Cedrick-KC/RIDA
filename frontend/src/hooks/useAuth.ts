import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Define the user type
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'customer' | 'driver' | 'admin';
  profilePicture?: string;
}

// Define the auth return type
interface AuthReturnType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; userType?: 'customer' | 'driver' | 'admin' }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
}

// Custom hook for authentication
const useAuth = (): AuthReturnType => {
  const { user, token, login: contextLogin, logout: contextLogout, updateProfile: contextUpdateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // In a real app, this would check with the backend
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Validate token with backend
          // For now, we'll just set the context
          contextLogin(JSON.parse(storedUser), storedToken);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        contextLogout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [contextLogin, contextLogout]);

  // Login function with error handling
  const handleLogin = async (credentials: { email: string; password: string; userType?: 'customer' | 'driver' | 'admin' }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setError(null);
      // In real implementation, this would call the backend
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });

      // Simulate successful login
      const mockUser: User = {
        _id: '1',
        name: 'Test User',
        email: credentials.email,
        userType: credentials.userType || 'customer'
      };
      const mockToken = 'mock-jwt-token';

      // Store in localStorage
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Update context
      contextLogin(mockUser, mockToken);

      // Redirect based on user type
      if (mockUser.userType === 'admin') {
        navigate('/admin');
      } else if (mockUser.userType === 'driver') {
        navigate('/driver');
      } else {
        navigate('/customer');
      }

      return { success: true, user: mockUser };
    } catch (err: any) {
      setError('Login failed. Please check your credentials.');
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Update context
    contextLogout();

    // Redirect to login
    navigate('/login');
  };

  // Update profile
  const handleUpdateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setError(null);
      // In real implementation, this would call the backend
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(profileData)
      // });

      // Simulate successful update
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser: User = {
        ...user,
        ...profileData
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update context
      contextUpdateProfile(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err: any) {
      setError('Failed to update profile.');
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile
  };
};

export default useAuth;