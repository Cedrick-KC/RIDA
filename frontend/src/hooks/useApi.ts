import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

// Define the API response type
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Define the API hook return type
interface ApiReturnType {
  loading: boolean;
  error: string | null;
  get: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, data: any) => Promise<ApiResponse<T>>;
  put: <T>(endpoint: string, data: any) => Promise<ApiResponse<T>>;
  delete: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  uploadFile: (endpoint: string, file: File, additionalData?: Record<string, any>) => Promise<ApiResponse<any>>;
  apiCall: <T>(endpoint: string, options?: RequestInit) => Promise<ApiResponse<T>>;
}

// Custom hook for API calls
const useApi = (): ApiReturnType => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generic API call function
  const apiCall = useCallback(async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(options.headers || {})
        },
        ...options
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
        throw new Error('Session expired. Please log in again.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      // Return parsed JSON
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Specific API methods
  const get = useCallback(async <T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> => {
    const queryString = new URLSearchParams(params).toString();
    const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiCall<T>(finalEndpoint, { method: 'GET' });
  }, [apiCall]);

  const post = useCallback(async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const put = useCallback(async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const del = useCallback(async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, {
      method: 'DELETE'
    });
  }, [apiCall]);

  // File upload
  const uploadFile = useCallback(async (endpoint: string, file: File, additionalData: Record<string, any> = {}): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      // Add additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then(result => {
        setLoading(false);
        resolve({ data: result });
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Upload failed');
        reject({ error: err.message || 'Upload failed' });
      });
    });
  }, [token]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    uploadFile,
    apiCall
  };
};

export default useApi;