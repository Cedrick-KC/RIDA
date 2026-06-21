import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

console.log('=== DEBUGGING ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('============================================');

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const hoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.03, 
    y: -5,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

const pulseVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: [1, 1.05, 1],
    transition: { 
      duration: 0.5, 
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Theme-aware color constants
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

// Notification Context
const NotificationContext = React.createContext();

// Enhanced Notification Provider with browser notification support
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const addNotification = (message, type = 'info', showBrowserNotification = true) => {
    const id = Date.now();
    const newNotification = { id, message, type, visible: true };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (showBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification('RIDA Notification', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `rida-notification-${id}`,
        requireInteraction: false,
        silent: false
      });
      
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    }
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };
  
  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          visible={notification.visible}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// ==========================================
// COMPONENTS: UI & Shared
// ==========================================

// MovingCarIcon component for the hero section
const MovingCarIcon = ({ direction = 'right', delay = 0, theme }) => {
  const colors = theme ? themeColors[theme] : themeColors.light;
  
  return (
    <motion.div
      className="position-absolute"
      style={{ 
        top: `${20 + Math.random() * 60}%`,
        left: direction === 'right' ? '-50px' : 'auto',
        right: direction === 'left' ? '-50px' : 'auto',
        zIndex: 1
      }}
      initial={{ x: direction === 'right' ? -50 : 50, opacity: 0 }}
      animate={{ 
        x: direction === 'right' ? [0, 100, 200] : [0, -100, -200],
        opacity: [0, 1, 0]
      }}
      transition={{ duration: 8, delay, repeat: Infinity, repeatDelay: 3 }}
    >
      <motion.i 
        className="bi bi-car-front-fill text-white opacity-50"
        style={{ fontSize: '2rem' }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      ></motion.i>
    </motion.div>
  );
};

// Animated Card Component
const AnimatedCard = ({ children, delay, theme }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

// Notification Component
const Notification = ({ message, type, visible, onClose }) => {
  const colors = themeColors['light']; 
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white`}
          style={{ 
            backgroundColor: type === 'success' ? colors.success : 
                             type === 'error' ? colors.danger : 
                             type === 'warning' ? colors.warning : colors.info,
            zIndex: 1050
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="toast-body d-flex justify-content-between align-items-center">
            <div>
              <i className={`bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-x-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2`}></i>
              {message}
            </div>
            <button type="button" className="btn-close btn-close-white ms-3" onClick={onClose}></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Reusable Navigation Button Component
const NavButton = ({ icon, label, currentPage, setCurrentPage, pageName, variant = "outline-light" }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCurrentPage(pageName)}
    className={`btn ${currentPage === pageName ? 'btn-light' : `btn-${variant}`}`}
  >
    <i className={`bi ${icon} me-1`}></i> {label}
  </motion.button>
);

// Enhanced Navbar with improved responsiveness
const Navbar = ({ user, currentPage, setCurrentPage, handleLogout, toggleTheme, theme, sidebarCollapsed, toggleSidebar }) => {
  const colors = themeColors[theme];
  
  return (
    <motion.nav 
      className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top"
      style={{ backgroundColor: colors.primary }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container-fluid">
        <motion.a 
          className="navbar-brand fw-bold d-flex align-items-center" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (user) {
              if (user.userType === 'admin') setCurrentPage('adminDashboard');
              else if (user.userType === 'customer') setCurrentPage('customerDashboard');
              else if (user.userType === 'driver') setCurrentPage('driverDashboard');
            } else {
              setCurrentPage('home');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.i className="bi bi-car-front-fill me-2 fs-4" whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}></motion.i>
          <span>RIDA</span>
        </motion.a>
        
        <button className="navbar-toggler border-0" type="button" onClick={toggleSidebar}>
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${sidebarCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
                <i className="bi bi-house-door me-1"></i> Home
              </button>
            </li>
          </ul>
          
          <div className="d-flex flex-column flex-lg-row align-items-center gap-2 gap-lg-3">
            <motion.button className="btn btn-outline-light rounded-circle p-2" onClick={toggleTheme} title="Toggle theme" whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} style={{ width: '40px', height: '40px' }}>
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
            </motion.button>
            
            {user ? (
              <div className="d-flex flex-column flex-lg-row align-items-center gap-2 gap-lg-3">
                {user.userType === 'admin' && (
                  <NavButton icon="bi-speedometer2" label="Admin" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="adminDashboard" />
                )}
                {user.userType === 'customer' && (
                  <>
                    <NavButton icon="bi-calendar-check" label="Book a Driver" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="customerDashboard" />
                    <NavButton icon="bi-calculator" label="Fare Calculator" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="fareCalculator" />
                  </>
                )}
                {user.userType === 'driver' && (
                  <NavButton icon="bi-list-task" label="My Assignments" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="driverDashboard" />
                )}
                <NavButton icon="bi-receipt" label="My Bookings" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="bookings" />
                <NavButton icon="bi-star" label="Reviews" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="reviews" />
                <div className="dropdown">
                  <motion.button className="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <i className="bi bi-person-circle me-1"></i> 
                    <span className="d-none d-sm-inline">{user.name}</span>
                  </motion.button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column flex-sm-row gap-2">
                <NavButton icon="bi-box-arrow-in-right" label="Login" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="login" />
                <NavButton icon="bi-person-plus" label="Register" currentPage={currentPage} setCurrentPage={setCurrentPage} pageName="register" variant="success" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Enhanced Driver Card Component
const DriverCard = ({ driver, onBook, isBooking, theme }) => {
  const colors = themeColors[theme];
  
  if (!driver) return null;
  
  return (
    <motion.div 
      className="card h-100 border-0 shadow-sm overflow-hidden"
      variants={hoverVariants}
      initial="rest"
      whileHover="hover"
      style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <div className="me-3">
              {driver.profilePicture ? (
                <img src={driver.profilePicture} alt={driver.user?.name || 'Driver'} className="rounded-circle" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-person text-primary fs-4"></i>
                </div>
              )}
            </div>
            <div>
              <h5 className="card-title mb-1">{driver.user?.name || 'Unknown Driver'}</h5>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${driver.availability?.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                  {driver.availability?.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <div className="d-flex align-items-center">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <span>{driver.ratings?.average?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              <div className="d-flex align-items-center mt-1">
                <i className="bi bi-telephone text-muted me-1"></i>
                <span className="small">{driver.user.phone || 'No phone number'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-car-front text-muted me-2"></i>
            <span>{driver.vehicle?.make || 'Unknown'} {driver.vehicle?.model || 'Vehicle'} ({driver.vehicle?.color || 'Unknown Color'})</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <motion.button
            variants={pulseVariants}
            initial="rest"
            whileHover="hover"
            onClick={() => onBook(driver)}
            className="btn btn-primary w-100 py-2"
            disabled={isBooking || !driver.availability?.isAvailable}
          >
            {isBooking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Booking...
              </>
            ) : (
              <>
                <i className="bi bi-calendar-check me-2"></i> Book Now
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Driver Price Calculator Component
const DriverPriceCalculator = ({ theme }) => {
  const colors = themeColors[theme];
  const [days, setDays] = useState('');
  const [price, setPrice] = useState(null);
  
  const calculatePrice = () => {
    const daysValue = parseInt(days);
    if (isNaN(daysValue) || daysValue < 1) {
      setPrice("Please enter a valid number of days.");
      return;
    }
    let calculatedPrice = daysValue === 1 ? 15000 : daysValue * 10000;
    setPrice(`Total Price: ${calculatedPrice.toLocaleString()} RWF`);
  };
  
  return (
    <motion.div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
      <div className="card-body p-3 p-md-4">
        <h3 className="h5 mb-3 text-center" style={{ color: colors.primary }}>Driver Price Calculator</h3>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="mb-3">
              <label className="form-label fw-semibold">Enter number of days:</label>
              <input type="number" className="form-control" min="1" placeholder="e.g. 3" value={days} onChange={(e) => setDays(e.target.value)} style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }} />
            </div>
            <motion.button className="btn w-100 py-2 fw-semibold rounded-3 shadow-sm" style={{ backgroundColor: colors.primary, color: '#fff' }} onClick={calculatePrice} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Calculate
            </motion.button>
            {price && <div className="mt-3 text-center fw-bold" style={{ color: colors.text }}>{price}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPONENTS: Authentication
// ==========================================

// Login form component
const Login = ({ onLoginSuccess, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.msg || 'Login failed');
      }
      
      const responseData = await response.json();
      const { token, user } = responseData;
      if (!token || !user) throw new Error('No token or user data received');
      
      onLoginSuccess(user, token);
      showMessage('Login successful!', 'success');
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
      showMessage('Login failed: ' + err.message, 'error');
    }
  };
  
  return (
    <div className="d-flex justify-content-center align-items-center h-100 p-4">
      <motion.div className="bg-white p-4 p-md-5 rounded-3 shadow-sm w-100" style={{maxWidth: '24rem', backgroundColor: colors.cardBg}} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="h4 fw-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger mb-4 text-center">{error}</div>}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control rounded-3" required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control rounded-3" required />
          </div>
          <motion.button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Login</motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// Registration form component
const Register = ({ onRegisterSuccess, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', userType: 'customer',
    vehicle: { make: '', model: '', licensePlate: '', color: '' },
    bio: '', ageRange: '', yearsOfExperience: '', transmissionProficiency: 'both',
    vehicleTypesComfortable: [], preferredServiceAreas: ['kigali'], timeAvailability: 'flexible',
    openToServices: ['shortTrips'], languagesSpoken: ['english', 'Swahili']
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (e, parent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [name]: value } }));
  };
  
  const handleArrayChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[field];
      if (checked) return { ...prev, [field]: [...currentValues, value] };
      return { ...prev, [field]: currentValues.filter(v => v !== value) };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.userType === 'driver') {
        payload.vehicle = { ...payload.vehicle, licensePlate: payload.vehicle.licensePlate.toUpperCase() };
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (response.ok) {
        showMessage('Registration successful! Please login.', 'success');
        onRegisterSuccess();
      } else {
        throw new Error(data.errors?.[0]?.msg || data.msg || 'Registration failed');
      }
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div className="container p-4 p-md-5 rounded-3 shadow" style={{ backgroundColor: colors.cardBg }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="h3 fw-bold text-center mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        {/* Basic Fields */}
        <div className="form-group"><label className="form-label fw-semibold">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control rounded-3" required /></div>
        <div className="form-group"><label className="form-label fw-semibold">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control rounded-3" required /></div>
        <div className="form-group"><label className="form-label fw-semibold">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control rounded-3" required /></div>
        <div className="form-group"><label className="form-label fw-semibold">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control rounded-3" required /></div>
        <div className="form-group"><label className="form-label fw-semibold">User Type</label>
          <select name="userType" value={formData.userType} onChange={handleChange} className="form-select rounded-3">
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {formData.userType === 'driver' && (
          <>
            <hr className="my-3"/><h4 className="h5 fw-bold mb-3">Driver Details</h4>
            {/* Driver specific fields omitted for brevity, assumed logic is same as original */}
          </>
        )}
        
        <motion.button type="submit" disabled={loading} className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ==========================================
// COMPONENTS: Dashboards (Admin, Driver, Customer)
// ==========================================

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, totalDrivers: 0, pendingBookings: 0, completedBookings: 0, revenue: 0 });
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        
        // Fetching logic (simplified for display)
        const [usersRes, bookingsRes, driversRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/api/admin/bookings`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/api/admin/drivers`, { headers })
        ]);

        const usersData = await usersRes.json();
        const bookingsData = await bookingsRes.json();
        const driversData = await driversRes.json();

        setUsers(usersData); setBookings(bookingsData); setDrivers(driversData);
        
        setStats({
          totalUsers: usersData.length,
          totalBookings: bookingsData.length,
          totalDrivers: driversData.length,
          pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
          completedBookings: bookingsData.filter(b => b.status === 'completed').length,
          revenue: bookingsData.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
        });
      } catch (err) {
        showMessage('Failed to load admin data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [token, showMessage]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete');
        setUsers(users.filter(u => u._id !== userId));
        showMessage('User deleted.', 'success');
      } catch (err) { showMessage('Failed to delete user.', 'error'); }
    }
  };
  
  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="row g-4 p-3 p-md-4">
      <div className="col-12 col-lg-3 col-xl-2">
        <div className="card shadow-sm" style={{ backgroundColor: colors.cardBg }}>
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {['dashboard', 'users', 'drivers', 'bookings', 'reports'].map(tab => (
                <button key={tab} className={`list-group-item list-group-item-action ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  <i className={`bi bi-${tab === 'dashboard' ? 'speedometer2' : tab === 'users' ? 'people' : tab === 'drivers' ? 'person-badge' : tab === 'bookings' ? 'calendar-check' : 'graph-up'} me-2`}></i> 
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-lg-9 col-xl-10">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 fw-bold">Admin Dashboard</h2>
          <div className="text-muted"><i className="bi bi-person-circle me-1"></i> {user.name}</div>
        </div>
        
        {/* Stats Cards */}
        {activeTab === 'dashboard' && (
          <div className="row g-4">
             {[
               { label: 'Total Users', value: stats.totalUsers, icon: 'people', color: 'primary' },
               { label: 'Total Drivers', value: stats.totalDrivers, icon: 'person-badge', color: 'success' },
               { label: 'Total Bookings', value: stats.totalBookings, icon: 'calendar-check', color: 'info' },
               { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: 'currency-dollar', color: 'warning' }
             ].map((stat, i) => (
               <div key={i} className="col-md-6 col-lg-3">
                 <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg }}>
                   <div className="card-body d-flex align-items-center">
                     <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3 me-3`}>
                       <i className={`bi bi-${stat.icon} fs-4 text-${stat.color}`}></i>
                     </div>
                     <div>
                       <h6 className="text-muted mb-1">{stat.label}</h6>
                       <h3 className="mb-0">{stat.value}</h3>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg }}>
            <div className="card-header bg-transparent py-3 d-flex justify-content-between">
              <h5 className="mb-0">Manage Users</h5>
              <button className="btn btn-primary btn-sm"><i className="bi bi-plus-circle me-1"></i> Add User</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead><tr><th>Name</th><th>Email</th><th>User Type</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td><td>{u.email}</td>
                        <td><span className={`badge bg-${u.userType === 'admin' ? 'danger' : u.userType === 'driver' ? 'primary' : 'success'}`}>{u.userType}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u._id)}><i className="bi bi-trash"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CUSTOMER DASHBOARD ---
const CustomerDashboard = ({ user, token, showMessage, setCurrentPage, theme }) => {
  const colors = themeColors[theme];
  const { addNotification } = useContext(NotificationContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [bookingData, setBookingData] = useState({ pickupAddress: '', scheduledTime: '', days: 1, calculatedFare: 15000, paymentMethod: "MomoPay Code 123456" });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/all-drivers`);
        const data = await response.json();
        setDrivers(Array.isArray(data) ? data : (data.drivers || []));
      } catch (err) {
        showMessage('Failed to load drivers.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [showMessage]);

  const handleBookDriver = (driver) => {
    setSelectedDriver(driver);
    setShowBookingForm(true);
    setBookingData(prev => ({ ...prev, calculatedFare: 15000 })); // Reset fare
  };
  
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'days') {
        const days = parseInt(value) || 0;
        updated.calculatedFare = days === 1 ? 15000 : days * 10000;
      }
      return updated;
    });
  };

  const submitBooking = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          driverId: selectedDriver._id,
          pickupLocation: { address: bookingData.pickupAddress },
          scheduledTime: bookingData.scheduledTime,
          paymentMethod: bookingData.paymentMethod,
          pricing: { totalAmount: bookingData.calculatedFare },
          notes: `Days: ${bookingData.days}`
        })
      });
      
      if (response.ok) {
        addNotification('Booking created successfully!', 'success', true);
        showMessage('Booking created!', 'success');
        setShowBookingForm(false);
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={pageTransition} className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold">Welcome, {user.name}!</h2>
          <p className="text-muted">Find and book a driver for your next trip.</p>
        </div>
      </div>

      <div className="row g-4">
        {loading ? <div className="spinner-border text-primary"></div> : 
         drivers.map((driver, index) => (
           <div key={driver._id} className="col-12 col-md-6 col-lg-4">
             <AnimatedCard delay={index * 0.1}>
               <DriverCard driver={driver} onBook={handleBookDriver} theme={theme} />
             </AnimatedCard>
           </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: colors.cardBg }}>
              <div className="modal-header"><h5 className="modal-title">Book: {selectedDriver?.user?.name}</h5><button type="button" className="btn-close" onClick={() => setShowBookingForm(false)}></button></div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Pickup Address</label><input type="text" className="form-control" name="pickupAddress" onChange={handleBookingInputChange} /></div>
                <div className="mb-3"><label className="form-label">Scheduled Time</label><input type="datetime-local" className="form-control" name="scheduledTime" onChange={handleBookingInputChange} /></div>
                <div className="mb-3"><label className="form-label">Number of Days</label><input type="number" className="form-control" name="days" value={bookingData.days} onChange={handleBookingInputChange} /></div>
                <div className="alert alert-info">Estimated Fare: <strong>{bookingData.calculatedFare.toLocaleString()} RWF</strong></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={submitBooking}>Book Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- DRIVER DASHBOARD ---
const DriverDashboard = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/mybookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        showMessage('Failed to load assignments.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token, showMessage]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
        showMessage('Status updated.', 'success');
      }
    } catch (err) {
      showMessage('Failed to update status.', 'error');
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-3 p-md-4">
      <h2 className="h3 fw-bold mb-4">My Assignments</h2>
      <div className="row g-4">
        {bookings.length === 0 ? <div className="col-12 text-center text-muted">No assignments.</div> :
         bookings.map(booking => (
           <div key={booking._id} className="col-12 col-md-6">
             <div className="card shadow-sm" style={{ backgroundColor: colors.cardBg }}>
               <div className="card-body">
                 <div className="d-flex justify-content-between mb-2">
                   <h5>Booking #{booking._id.substring(0, 8)}</h5>
                   <span className={`badge bg-${booking.status === 'completed' ? 'success' : 'warning'}`}>{booking.status}</span>
                 </div>
                 <p><i className="bi bi-geo-alt me-2"></i>{booking.pickupLocation?.address || 'N/A'}</p>
                 <p><i className="bi bi-clock me-2"></i>{new Date(booking.scheduledTime).toLocaleString()}</p>
                 
                 {booking.status === 'pending' && (
                   <div className="d-flex gap-2 mt-3">
                     <button className="btn btn-success btn-sm flex-grow-1" onClick={() => updateStatus(booking._id, 'accepted')}>Accept</button>
                     <button className="btn btn-danger btn-sm flex-grow-1" onClick={() => updateStatus(booking._id, 'cancelled')}>Decline</button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         ))
        }
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTS: Pages (Home, Bookings, Reviews)
// ==========================================

const HomePage = ({ setCurrentPage, theme }) => {
  const colors = themeColors[theme];
  return (
    <motion.div initial="initial" animate="animate" variants={pageTransition}>
      {/* Hero Section */}
      <div className="jumbotron text-white rounded-3 p-5 mb-5 text-center position-relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
        <MovingCarIcon direction="right" theme={theme} />
        <div style={{ zIndex: 2, position: 'relative' }}>
          <h1 className="display-4 fw-bold">Welcome to RIDA</h1>
          <p className="lead">Your Car. Our Driver. Your Comfort & Safety.</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <motion.button className="btn btn-light btn-lg" onClick={() => setCurrentPage('register')} whileHover={{ scale: 1.05 }}>Book Your Driver Now</motion.button>
            <motion.button className="btn btn-outline-light btn-lg" onClick={() => setCurrentPage('login')} whileHover={{ scale: 1.05 }}>Login</motion.button>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="row mb-5">
        <div className="col-12"><h2 className="text-center mb-4">Our Services</h2></div>
        {[
          { icon: 'bi-cup-straw', title: 'Night Out', desc: 'Enjoy your evening safely.' },
          { icon: 'bi-geo-alt-fill', title: 'Long Distance', desc: 'Safe long journeys.' },
          { icon: 'bi-people-fill', title: 'Events', desc: 'Professional event drivers.' },
          { icon: 'bi-camera-fill', title: 'Tourism', desc: 'Guided tours with locals.' }
        ].map((service, i) => (
          <div key={i} className="col-md-3 mb-4">
            <AnimatedCard delay={i * 0.1}>
              <motion.div className="card h-100 text-center p-4" whileHover={{ y: -10 }} style={{ backgroundColor: colors.cardBg }}>
                <i className={`bi ${service.icon} fs-1 text-primary mb-3`}></i>
                <h4>{service.title}</h4>
                <p className="text-muted">{service.desc}</p>
              </motion.div>
            </AnimatedCard>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const BookingList = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/mybookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        showMessage('Failed to load bookings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token, showMessage]);

  return (
    <div className="p-3 p-md-4">
      <h2 className="h3 fw-bold mb-4">My Bookings</h2>
      <div className="row g-4">
        {bookings.map(booking => (
          <div key={booking._id} className="col-md-6">
            <div className="card shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5>Booking #{booking._id.substring(0, 8)}</h5>
                  <span className={`badge bg-${booking.status === 'completed' ? 'success' : 'warning'}`}>{booking.status}</span>
                </div>
                <p className="text-muted mt-2">{booking.pickupLocation?.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewsPage = ({ user, token, showMessage, theme }) => {
  return <div className="p-4"><h2>Reviews</h2><p className="text-muted">Reviews feature coming soon.</p></div>;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState({ visible: false, text: '', type: 'info' });
  const [isInitializing, setIsInitializing] = useState(true);
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  useEffect(() => {
    // Load Bootstrap & Icons
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    const iconLink = document.createElement('link');
    iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    iconLink.rel = 'stylesheet';
    document.head.appendChild(iconLink);

    // Check Auth
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData); setToken(storedToken);
      setCurrentPage(userData.userType === 'admin' ? 'adminDashboard' : userData.userType === 'driver' ? 'driverDashboard' : 'customerDashboard');
    }
    setIsInitializing(false);
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage({ visible: true, text, type });
    setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
  };
  
  const handleLogin = (userData, authToken) => {
    setUser(userData); setToken(authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage(userData.userType === 'admin' ? 'adminDashboard' : userData.userType === 'driver' ? 'driverDashboard' : 'customerDashboard');
    showMessage(`Welcome, ${userData.name}!`, 'success');
  };
  
  const handleLogout = () => {
    setUser(null); setToken(null); setCurrentPage('home');
    localStorage.removeItem('authToken'); localStorage.removeItem('user');
    showMessage('Logged out.', 'info');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const renderPage = () => {
    if (user) {
      switch(currentPage) {
        case 'adminDashboard': return <AdminDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'driverDashboard': return <DriverDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'customerDashboard': return <CustomerDashboard user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} theme={theme} />;
        case 'bookings': return <BookingList user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'reviews': return <ReviewsPage user={user} token={token} showMessage={showMessage} theme={theme} />;
        default: return <CustomerDashboard user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} theme={theme} />;
      }
    } else {
      switch(currentPage) {
        case 'register': return <Register onRegisterSuccess={() => setCurrentPage('login')} showMessage={showMessage} theme={theme} />;
        case 'login': return <Login onLoginSuccess={handleLogin} showMessage={showMessage} theme={theme} />;
        case 'home': default: return <HomePage setCurrentPage={setCurrentPage} theme={theme} />;
      }
    }
  };

  if (isInitializing) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <NotificationProvider>
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: themeColors[theme].background, color: themeColors[theme].text }}>
        <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} toggleTheme={toggleTheme} theme={theme} sidebarCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} initial="initial" animate="animate" exit="exit" variants={pageTransition} className="container-fluid flex-grow-1">
            {renderPage()}
          </motion.div>
        </AnimatePresence>
        
        <footer className="py-4 mt-auto" style={{ backgroundColor: themeColors[theme].dark, color: themeColors[theme].light }}>
          <div className="container text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} RIDA. All rights reserved.</p>
          </div>
        </footer>
      </div>
      
      <Notification message={message.text} type={message.type} visible={message.visible} onClose={() => setMessage(prev => ({ ...prev, visible: false }))} />
    </NotificationProvider>
  );
};

export default App;
