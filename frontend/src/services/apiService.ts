import axios from 'axios';

// API Service Layer - Centralized API configuration and request handling

// Create axios instance with default configuration
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Redirect to login page (would need router access in real implementation)
      // window.location.href = '/login';
    }

    // Handle network errors
    if (!error.response) {
      // Network error or timeout
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

// API service methods
const API = {
  // Auth endpoints
  auth: {
    login: (credentials: any) => apiService.post('/auth/login', credentials),
    register: (userData: any) => apiService.post('/auth/register', userData),
    logout: () => apiService.post('/auth/logout'),
    refreshToken: () => apiService.post('/auth/refresh'),
    getProfile: () => apiService.get('/auth/profile'),
    updateProfile: (userData: any) => apiService.put('/auth/profile', userData),
    changePassword: (passwordData: any) => apiService.put('/auth/password', passwordData)
  },

  // User endpoints
  users: {
    getAll: () => apiService.get('/users'),
    getById: (id: string) => apiService.get(`/users/${id}`),
    update: (id: string, userData: any) => apiService.put(`/users/${id}`, userData),
    delete: (id: string) => apiService.delete(`/users/${id}`),
    getDrivers: () => apiService.get('/users/drivers'),
    getCustomers: () => apiService.get('/users/customers')
  },

  // Driver endpoints
  drivers: {
    getAll: () => apiService.get('/drivers'),
    getById: (id: string) => apiService.get(`/drivers/${id}`),
    getProfile: () => apiService.get('/drivers/profile'),
    updateProfile: (driverData: any) => apiService.put('/drivers/profile', driverData),
    getAvailability: () => apiService.get('/drivers/availability'),
    updateAvailability: (isAvailable: boolean) => apiService.put('/drivers/availability', { isAvailable }),
    getStats: () => apiService.get('/drivers/stats'),
    getBookings: () => apiService.get('/drivers/bookings'),
    getEarnings: (params: any) => apiService.get('/drivers/earnings', { params })
  },

  // Booking endpoints
  bookings: {
    getAll: () => apiService.get('/bookings'),
    getById: (id: string) => apiService.get(`/bookings/${id}`),
    create: (bookingData: any) => apiService.post('/bookings', bookingData),
    update: (id: string, bookingData: any) => apiService.put(`/bookings/${id}`, bookingData),
    delete: (id: string) => apiService.delete(`/bookings/${id}`),
    getMyBookings: () => apiService.get('/bookings/mybookings'),
    getDriverBookings: () => apiService.get('/bookings/driver'),
    updateStatus: (id: string, status: string) => apiService.put(`/bookings/status/${id}`, { status }),
    calculateFare: (fareData: any) => apiService.post('/bookings/calculate-fare', fareData),
    getHistory: (params: any) => apiService.get('/bookings/history', { params })
  },

  // Review endpoints
  reviews: {
    getAll: () => apiService.get('/reviews'),
    getById: (id: string) => apiService.get(`/reviews/${id}`),
    create: (reviewData: any) => apiService.post('/reviews', reviewData),
    update: (id: string, reviewData: any) => apiService.put(`/reviews/${id}`, reviewData),
    delete: (id: string) => apiService.delete(`/reviews/${id}`),
    getForBooking: (bookingId: string) => apiService.get(`/reviews/booking/${bookingId}`),
    getForDriver: (driverId: string) => apiService.get(`/reviews/driver/${driverId}`),
    getForCustomer: (customerId: string) => apiService.get(`/reviews/customer/${customerId}`),
    respond: (id: string, responseData: any) => apiService.post(`/reviews/${id}/respond`, responseData)
  },

  // Payment endpoints
  payments: {
    process: (paymentData: any) => apiService.post('/payments/process', paymentData),
    refund: (paymentId: string, refundData: any) => apiService.post(`/payments/${paymentId}/refund`, refundData),
    getHistory: (params: any) => apiService.get('/payments/history', { params }),
    getReceipt: (paymentId: string) => apiService.get(`/payments/${paymentId}/receipt`),
    getMethods: () => apiService.get('/payments/methods')
  },

  // Notification endpoints
  notifications: {
    getAll: () => apiService.get('/notifications'),
    getUnreadCount: () => apiService.get('/notifications/unread-count'),
    markAsRead: (id: string) => apiService.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiService.put('/notifications/read-all'),
    delete: (id: string) => apiService.delete(`/notifications/${id}`),
    deleteAll: () => apiService.delete('/notifications')
  },

  // Map endpoints
  map: {
    geocode: (address: string) => apiService.post('/map/geocode', { address }),
    reverseGeocode: (coordinates: any) => apiService.post('/map/reverse-geocode', { coordinates }),
    calculateRoute: (waypoints: any, options: any) => apiService.post('/map/route', { waypoints, options }),
    getPlaces: (query: any) => apiService.get('/map/places', { params: query }),
    getDirections: (origin: string, destination: string) =>
      apiService.get(`/map/directions?origin=${origin}&destination=${destination}`)
  },

  // Analytics endpoints
  analytics: {
    getDashboardStats: () => apiService.get('/analytics/dashboard'),
    getRevenueStats: (params: any) => apiService.get('/analytics/revenue', { params }),
    getUserStats: (params: any) => apiService.get('/analytics/users', { params }),
    getDriverStats: (params: any) => apiService.get('/analytics/drivers', { params }),
    getBookingStats: (params: any) => apiService.get('/analytics/bookings', { params })
  },

  // Utility endpoints
  utils: {
    getConfig: () => apiService.get('/utils/config'),
    getCurrencies: () => apiService.get('/utils/currencies'),
    getLanguages: () => apiService.get('/utils/languages'),
    getTimeZones: () => apiService.get('/utils/time-zones'),
    healthCheck: () => apiService.get('/utils/health')
  }
};

export default API;
export { apiService };