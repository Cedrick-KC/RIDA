import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NotificationContext } from '../contexts/NotificationContext';
import AnalyticsChart from '../components/widgets/AnalyticsChart';
import MovingCarIcon from '../components/widgets/MovingCarIcon';

// Define the admin dashboard props type
interface AdminDashboardProps {
  user: {
    userType: 'admin' | 'customer' | 'driver';
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  token: string;
  showMessage: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  theme: 'light' | 'dark';
}

// Define the user type
interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'admin' | 'customer' | 'driver';
  phone?: string;
  profilePicture?: string;
  // Add other user fields as needed
}

// Define the driver type
interface Driver {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  vehicle?: {
    make?: string;
    model?: string;
  };
  yearsOfExperience?: number;
  // Add other driver fields as needed
}

// Define the booking type
interface Booking {
  _id: string;
  customer?: {
    name: string;
    phone?: string;
  };
  driver?: {
    user?: {
      name: string;
      phone?: string;
    };
  };
  pickupLocation?: {
    address: string;
  };
  dropoffLocation?: {
    address: string;
  };
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  notes?: string;
  // Add other booking fields as needed
}

// AdminDashboard component
const AdminDashboard = ({ user, token, showMessage, theme }: AdminDashboardProps) => {
  const themeColors = {
    light: {
      primary: '#0056b3',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      background: '#ffffff',
      text: '#212529',
      cardBg: '#ffffff',
      border: '#dee2e6'
    },
    dark: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#198754',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#0dcaf0',
      light: '#f8f9fa',
      dark: '#212529',
      background: '#121212',
      text: '#f8f9fa',
      cardBg: '#1e1e1e',
      border: '#343a40'
    }
  };

  const colors = themeColors[theme];
  const { addNotification } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'drivers' | 'bookings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users
        const usersResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch bookings
        const bookingsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch drivers
        const driversResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Handle responses
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []));
        }

        if (driversResponse.ok) {
          const driversData = await driversResponse.json();
          setDrivers(Array.isArray(driversData) ? driversData : (driversData.drivers || []));
        }

        if (!usersResponse.ok || !bookingsResponse.ok || !driversResponse.ok) {
          throw new Error('Failed to fetch some dashboard data');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        showMessage('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, showMessage]);

  const handleTabChange = (tab: 'dashboard' | 'users' | 'drivers' | 'bookings') => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center p-4">
        <h5>Error loading dashboard</h5>
        <p>{error}</p>
        <motion.button
          onClick={() => window.location.reload()}
          className="btn btn-outline-primary mt-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reload Page
        </motion.button>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold">Admin Dashboard</h2>
        <div className="d-flex gap-2">
          <motion.button
            onClick={() => handleTabChange('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Dashboard
          </motion.button>
          <motion.button
            onClick={() => handleTabChange('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Users
          </motion.button>
          <motion.button
            onClick={() => handleTabChange('drivers')}
            className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-outline-primary'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Drivers
          </motion.button>
          <motion.button
            onClick={() => handleTabChange('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline-primary'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bookings
          </motion.button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="row g-4">
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Total Users</h5>
                    <p className="text-muted mb-0">Registered users</p>
                  </div>
                  <div className="display-4 fw-bold">{users.length}</div>
                </div>
                <div className="mt-3">
                  <AnalyticsChart
                    type="bar"
                    data={users.slice(0, 5).map(user => ({ name: user.name.substring(0, 10), value: Math.floor(Math.random() * 100) }))}
                    title="Recent Users"
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Total Drivers</h5>
                    <p className="text-muted mb-0">Registered drivers</p>
                  </div>
                  <div className="display-4 fw-bold">{drivers.length}</div>
                </div>
                <div className="mt-3">
                  <AnalyticsChart
                    type="line"
                    data={Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i + 1}`, value: Math.floor(Math.random() * 50) }))}
                    title="Driver Activity (Week)"
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Total Bookings</h5>
                    <p className="text-muted mb-0">Completed rides</p>
                  </div>
                  <div className="display-4 fw-bold">{bookings.length}</div>
                </div>
                <div className="mt-3">
                  <AnalyticsChart
                    type="pie"
                    data={[
                      { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: colors.success },
                      { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: colors.warning },
                      { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: colors.danger }
                    ].filter(item => item.value > 0)}
                    title="Booking Status"
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Revenue This Month</h5>
                    <p className="text-muted mb-0">Estimated earnings</p>
                  </div>
                  <div className="display-4 fw-bold">₨{Math.floor(Math.random() * 500000).toLocaleString()}</div>
                </div>
                <div className="mt-3">
                  <AnalyticsChart
                    type="area"
                    data={Array.from({ length: 6 }, (_, i) => ({ name: `Week ${i + 1}`, value: Math.floor(Math.random() * 100000) }))}
                    title="Monthly Revenue Trend"
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h3 fw-bold">Users Management</h2>
              <motion.button
                onClick={() => showMessage('User management features coming soon!', 'info')}
                className="btn btn-outline-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add New User
              </motion.button>
            </div>
          </div>
          {users.length > 0 ? (
            users.map((user, index) => (
              <div key={user._id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-1">{user.name || 'Unknown User'}</h6>
                        <p className="mb-1 text-muted small">
                          <i className="bi bi-envelope me-1"></i>
                          {user.email || 'No email'}
                        </p>
                        <p className="mb-0 text-muted small">
                          <i className="bi bi-person me-1"></i>
                          {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-people text-muted" style={{fontSize: '4rem'}}></i>
                <h4 className="text-muted mb-3">No Users Found</h4>
                <p className="text-muted">No users registered in the system.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h3 fw-bold">Drivers Management</h2>
              <motion.button
                onClick={() => showMessage('Driver management features coming soon!', 'info')}
                className="btn btn-outline-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add New Driver
              </motion.button>
            </div>
          </div>
          {drivers.length > 0 ? (
            drivers.map((driver, index) => (
              <div key={driver._id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center">
                          {driver.user ? driver.user.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-1">{driver.user?.name || 'Unknown Driver'}</h6>
                        <p className="mb-1 text-muted small">
                          <i className="bi bi-car-front me-1"></i>
                          {driver.vehicle?.make && driver.vehicle?.model ? `${driver.vehicle.make} ${driver.vehicle.model}` : 'Vehicle info not available'}
                        </p>
                        <p className="mb-0 text-muted small">
                          <i className="bi bi-gear me-1"></i>
                          {driver.yearsOfExperience || 0}+ years experience
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-person-badge text-muted" style={{fontSize: '4rem'}}></i>
                <h4 className="text-muted mb-3">No Drivers Found</h4>
                <p className="text-muted">No drivers registered in the system.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h3 fw-bold">Bookings Management</h2>
              <div className="d-flex gap-2">
                <motion.button
                  onClick={() => showMessage('Booking filtering features coming soon!', 'info')}
                  className="btn btn-outline-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Filter Bookings
                </motion.button>
                <motion.button
                  onClick={() => showMessage('Export features coming soon!', 'info')}
                  className="btn btn-outline-success"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Export Data
                </motion.button>
              </div>
            </div>
          </div>
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <div key={booking._id} className="col-12">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">Booking #{index + 1}</h6>
                        <p className="text-muted mb-1 small">
                          <i className="bi bi-calendar-check me-1"></i>
                          {new Date(booking.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className={`badge rounded-pill ${booking.status === 'completed' ? 'bg-success' : booking.status === 'accepted' ? 'bg-primary' : booking.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {booking.customer && (
                      <div className="mt-2 p-3 border rounded" style={{ backgroundColor: colors.light }}>
                        <h6 className="mb-1">Customer</h6>
                        <p className="mb-1">
                          <i className="bi bi-person me-1"></i>
                          {booking.customer.name || 'Unknown'}
                        </p>
                        {booking.customer.phone && (
                          <p className="mb-0 text-muted small>
                            <i className="bi bi-telephone me-1"></i>
                            {booking.customer.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {booking.driver && (
                      <div className="mt-2 p-3 border rounded" style={{ backgroundColor: colors.light }}>
                        <h6 className="mb-1">Driver</h6>
                        <p className="mb-1">
                          <i className="bi bi-car-front me-1"></i>
                          {booking.driver.user?.name || 'Unknown Driver'}
                        </p>
                        <p className="mb-0 text-muted small>
                          <i className="bi bi-telephone me-1"></i>
                          {booking.driver.user?.phone || 'No phone'}
                        </p>
                      </div>
                    )}

                    {booking.pickupLocation?.address && (
                      <div className="mt-2">
                        <p className="mb-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          Pickup: {booking.pickupLocation.address}
                        </p>
                      </div>
                    )}

                    {booking.dropoffLocation?.address && (
                      <div className="mt-2">
                        <p className="mb-1">
                          <i className="bi bi-arrow-right me-1"></i>
                          Dropoff: {booking.dropoffLocation.address}
                        </p>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="mt-2">
                        <p className="mb-1">
                          <i className="bi bi-sticky-fill me-1"></i>
                          Notes: {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-journal-text text-muted" style={{fontSize: '4rem'}}></i>
                <h4 className="text-muted mb-3">No Bookings Found</h4>
                <p className="text-muted">No bookings in the system.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;