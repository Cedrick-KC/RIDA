import config from './config';
import React, { useState, useEffect } from 'react';
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

// MovingCarIcon component for the hero section
const MovingCarIcon = ({ direction = 'right', delay = 0 }) => {
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
      transition={{ 
        duration: 8, 
        delay,
        repeat: Infinity,
        repeatDelay: 3
      }}
    >
      <motion.i 
        className="bi bi-car-front-fill text-white opacity-50"
        style={{ fontSize: '2rem' }}
        animate={{ 
          y: [0, -3, 0],
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

// Animated Card Component
const AnimatedCard = ({ children, delay }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
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
              // If user is logged in, redirect to their dashboard
              if (user.userType === 'admin') {
                setCurrentPage('adminDashboard');
              } else if (user.userType === 'customer') {
                setCurrentPage('customerDashboard');
              } else if (user.userType === 'driver') {
                setCurrentPage('driverDashboard');
              }
            } else {
              // If no user is logged in, go to home page
              setCurrentPage('home');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.i 
            className="bi bi-car-front-fill me-2 fs-4" 
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300 }}
          ></motion.i>
          <span>RIDA</span>
        </motion.a>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={toggleSidebar}
          aria-controls="navbarNav"
          aria-expanded={!sidebarCollapsed}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${sidebarCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={(e) => {
                e.preventDefault();
                if (user) {
                  // If user is logged in, redirect to their dashboard
                  if (user.userType === 'admin') {
                    setCurrentPage('adminDashboard');
                  } else if (user.userType === 'customer') {
                    setCurrentPage('customerDashboard');
                  } else if (user.userType === 'driver') {
                    setCurrentPage('driverDashboard');
                  }
                } else {
                  // If no user is logged in, go to home page
                  setCurrentPage('home');
                }
              }}>
                <i className="bi bi-house-door me-1"></i> Home
              </button>
            </li>
          </ul>
          
          <div className="d-flex flex-column flex-lg-row align-items-center gap-2 gap-lg-3">
            {/* Theme toggle button */}
            <motion.button 
              className="btn btn-outline-light rounded-circle p-2"
              onClick={toggleTheme} 
              title="Toggle theme"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              style={{ width: '40px', height: '40px' }}
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
            </motion.button>
            
            {user ? (
              <div className="d-flex flex-column flex-lg-row align-items-center gap-2 gap-lg-3">
                {user.userType === 'admin' && (
                  <NavButton 
                    icon="bi-speedometer2" 
                    label="Admin" 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    pageName="adminDashboard"
                  />
                )}
                {user.userType === 'customer' && (
                  <>
                    <NavButton 
                      icon="bi-calendar-check" 
                      label="Book a Driver" 
                      currentPage={currentPage} 
                      setCurrentPage={setCurrentPage} 
                      pageName="customerDashboard"
                    />
                    <NavButton 
                      icon="bi-calculator" 
                      label="Fare Calculator" 
                      currentPage={currentPage} 
                      setCurrentPage={setCurrentPage} 
                      pageName="fareCalculator"
                    />
                  </>
                )}
                {user.userType === 'driver' && (
                  <NavButton 
                    icon="bi-list-task" 
                    label="My Assignments" 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    pageName="driverDashboard"
                  />
                )}
                <NavButton 
                  icon="bi-receipt" 
                  label="My Bookings" 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage} 
                  pageName="bookings"
                />
                <NavButton 
                  icon="bi-star" 
                  label="Reviews" 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage} 
                  pageName="reviews"
                />
                <div className="dropdown">
                  <motion.button 
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                <NavButton 
                  icon="bi-box-arrow-in-right" 
                  label="Login" 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage} 
                  pageName="login"
                />
                <NavButton 
                  icon="bi-person-plus" 
                  label="Register" 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage} 
                  pageName="register"
                  variant="success"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
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

// Enhanced Driver Card Component with profile picture
const DriverCard = ({ driver, onBook, isBooking, theme }) => {
  const colors = themeColors[theme];
  
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
            {/* Profile picture */}
            <div className="me-3">
              {driver.profilePicture ? (
                <img 
                  src={driver.profilePicture} 
                  alt={driver.user.name}
                  className="rounded-circle"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-person text-primary fs-4"></i>
                </div>
              )}
            </div>
            <div>
              <h5 className="card-title mb-1">{driver.user.name}</h5>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${driver.availability?.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                  {driver.availability?.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <div className="d-flex align-items-center">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <span>{driver.ratings?.average?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-car-front text-muted me-2"></i>
            <span>{driver.vehicle?.make} {driver.vehicle?.model} ({driver.vehicle?.color})</span>
          </div>
          <div className="d-flex align-items-center">
            <i className="bi bi-currency-dollar text-muted me-2"></i>
            <span>${driver.pricing?.hourlyRate || '25'}/hour</span>
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

// Driver Tracking Map Component (Placeholder)
const DriverTrackingMap = ({ booking, theme }) => {
  const colors = themeColors[theme];
  
  return (
    <motion.div 
      className="card border-0 shadow-sm mb-4 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
    >
      <div className="card-header bg-transparent py-3">
        <h5 className="mb-0">Driver Tracking</h5>
      </div>
      <div className="card-body p-0">
        <div className="position-relative" style={{ height: '300px', backgroundColor: colors.background }}>
          {/* Map placeholder */}
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <i className="bi bi-geo-alt fs-1 text-primary mb-3"></i>
              <p className="text-muted">Live tracking will appear here when your trip is active</p>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <div className="text-center">
                  <div className="rounded-circle bg-primary p-3 mb-2">
                    <i className="bi bi-person-fill text-white"></i>
                  </div>
                  <p className="small mb-0">You</p>
                </div>
                <div className="text-center">
                  <div className="rounded-circle bg-success p-3 mb-2">
                    <i className="bi bi-car-front-fill text-white"></i>
                  </div>
                  <p className="small mb-0">Driver</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mock route line */}
          <svg className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
            <path 
              d="M 100,150 Q 250,50 400,150" 
              stroke={colors.primary} 
              strokeWidth="3" 
              fill="none" 
              strokeDasharray="10,5"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

// Notification Component
const Notification = ({ message, type, visible, onClose }) => {
  const colors = themeColors['light']; // Using light theme for notifications
  
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
              <i className={`bi ${type === 'success' ? 'bi-check-circle' : 
                                 type === 'error' ? 'bi-x-circle' : 
                                 type === 'warning' ? 'bi-exclamation-triangle' : 
                                 'bi-info-circle'} me-2`}></i>
              {message}
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white ms-3" 
              onClick={onClose}
            ></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Fare Calculator Page Component - Customer Only
const FareCalculatorPage = ({ user, token, showMessage, setCurrentPage, theme }) => {
  const colors = themeColors[theme];
  const [distance, setDistance] = useState('');
  const [fare, setFare] = useState(null);
  const [error, setError] = useState('');
  
  const calculateFare = () => {
    const distanceValue = parseFloat(distance);
    
    if (isNaN(distanceValue) || distanceValue <= 0) {
      setError('Please enter a valid distance.');
      setFare(null);
      return;
    }
    
    setError('');
    
    let calculatedFare = 0;
    if (distanceValue <= 10) {
      calculatedFare = 5000;
    } else if (distanceValue <= 50) {
      calculatedFare = 5000 + (distanceValue - 10) * 250;
    } else {
      calculatedFare = 5000 + (40 * 250) + ((distanceValue - 50) * 90);
    }
    
    setFare(calculatedFare);
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="container py-4 py-md-5"
    >
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          <motion.div 
            className="card shadow-sm overflow-hidden"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-body p-3 p-md-4">
              <h2 className="card-title text-center mb-3 mb-md-4">RIDA Fare Calculator</h2>
              <p className="text-muted text-center mb-3 mb-md-4">
                Calculate your fare based on distance<br />
                In case you have problems in calculating the distance<br />
                You may use Google Maps or ask your driver for help
              </p>
              
              <div className="mb-4">
                <label htmlFor="distanceInput" className="form-label fw-semibold">Distance (km)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    id="distanceInput"
                    placeholder="Enter distance in km"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                  <motion.button 
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={calculateFare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Calculate
                  </motion.button>
                </div>
              </div>
              
              {error && (
                <motion.div 
                  className="alert alert-danger mt-3" 
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
              
              {fare !== null && (
                <motion.div 
                  className="alert alert-success mt-3" 
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h5 className="alert-heading">Estimated Fare</h5>
                  <p className="mb-0 fs-4 fs-md-5 fw-bold">{fare.toLocaleString()} RWF</p>
                </motion.div>
              )}
              
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa' }}>
                <h6 className="fw-semibold">Fare Structure:</h6>
                <ul className="mb-0">
                  <li>First 10 km: 5,000 RWF (flat rate)</li>
                  <li>10-50 km: 250 RWF per additional km</li>
                  <li>Above 50 km: 90 RWF per additional km</li>
                </ul>
              </div>
              
              <div className="d-grid mt-4">
                <motion.button 
                  className="btn btn-success btn-lg"
                  onClick={() => setCurrentPage('customerDashboard')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <i className="bi bi-calendar-check me-2"></i> Book a Driver Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Main application component that manages state and "routing"
const App = () => {
  // State to hold user information and their authentication token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // State for page navigation. 'home' is the new default page.
  const [currentPage, setCurrentPage] = useState('home');
  // State for showing a modal message to the user
  const [message, setMessage] = useState({ visible: false, text: '', type: 'info' });
  // Loading state for initial token check
  const [isInitializing, setIsInitializing] = useState(true);
  // Theme state for light/dark mode
  const [theme, setTheme] = useState('light');
  // State for sidebar collapse on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Load Bootstrap CSS, JS, and Icons dynamically when component mounts
  useEffect(() => {
    // Load Bootstrap CSS
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    link.integrity = 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Load Bootstrap Icons
    const iconLink = document.createElement('link');
    iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    iconLink.rel = 'stylesheet';
    document.head.appendChild(iconLink);
    
    // Load Bootstrap JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    const colors = themeColors[savedTheme];
    root.style.setProperty('--bs-primary', colors.primary);
    root.style.setProperty('--bs-secondary', colors.secondary);
    root.style.setProperty('--bs-success', colors.success);
    root.style.setProperty('--bs-danger', colors.danger);
    root.style.setProperty('--bs-warning', colors.warning);
    root.style.setProperty('--bs-info', colors.info);
    root.style.setProperty('--bs-light', colors.light);
    root.style.setProperty('--bs-dark', colors.dark);
    root.style.setProperty('--bs-body-bg', colors.background);
    root.style.setProperty('--bs-body-color', colors.text);
    
    // Cleanup function to remove the added elements when component unmounts
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(iconLink);
      document.head.removeChild(script);
    };
  }, []);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    
    // Update CSS variables
    const root = document.documentElement;
    const colors = themeColors[newTheme];
    root.style.setProperty('--bs-primary', colors.primary);
    root.style.setProperty('--bs-secondary', colors.secondary);
    root.style.setProperty('--bs-success', colors.success);
    root.style.setProperty('--bs-danger', colors.danger);
    root.style.setProperty('--bs-warning', colors.warning);
    root.style.setProperty('--bs-info', colors.info);
    root.style.setProperty('--bs-light', colors.light);
    root.style.setProperty('--bs-dark', colors.dark);
    root.style.setProperty('--bs-body-bg', colors.background);
    root.style.setProperty('--bs-body-color', colors.text);
  };
  
  // Check for existing token on app load
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Just restore from localStorage without verification
          // Token validity will be checked when making actual API calls
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          
          // Set appropriate dashboard based on user type
          if (userData.userType === 'admin') {
            setCurrentPage('adminDashboard');
          } else if (userData.userType === 'customer') {
            setCurrentPage('customerDashboard');
          } else {
            setCurrentPage('driverDashboard');
          }
        }
      } catch (error) {
        console.error('Error restoring auth from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsInitializing(false);
      }
    };
    checkExistingAuth();
  }, []);
  
  // Function to show a message modal
  const showMessage = (text, type = 'info') => {
    setMessage({ visible: true, text, type });
    setTimeout(() => {
      setMessage(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // Handle successful login, receiving both user data and the auth token
  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    
    // Persist to localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // After login, navigate to the appropriate dashboard based on user type
    if (userData.userType === 'admin') {
      setCurrentPage('adminDashboard');
    } else if (userData.userType === 'customer') {
      setCurrentPage('customerDashboard');
    } else {
      setCurrentPage('driverDashboard');
    }
    showMessage(`Welcome back, ${userData.name}!`, 'success');
  };
  
  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentPage('home');
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    showMessage('You have been logged out.', 'info');
  };
  
  // Show loading screen while checking for existing authentication
  if (isInitializing) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // The main rendering logic using a switch statement for "routing"
  const renderPage = () => {
    // If user is logged in, show the requested page or default to their dashboard
    if (user) {
      switch (currentPage) {
        case 'adminDashboard':
          return <AdminDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'customerDashboard':
          return <CustomerDashboard user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} theme={theme} />;
        case 'driverDashboard':
          return <DriverDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'fareCalculator':
          // Only allow customers to access the fare calculator
          if (user.userType === 'customer') {
            return <FareCalculatorPage user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} theme={theme} />;
          } else {
            // Redirect non-customers to their appropriate dashboard
            if (user.userType === 'admin') {
              return <AdminDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
            } else if (user.userType === 'driver') {
              return <DriverDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
            }
          }
          break;
        case 'bookings':
          return <BookingList user={user} token={token} showMessage={showMessage} theme={theme} />;
        case 'reviews':
          return <ReviewsPage user={user} token={token} showMessage={showMessage} theme={theme} />;
        default:
          // Default to the correct dashboard if the user is logged in but page is invalid
          if (user.userType === 'admin') {
            return <AdminDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
          } else if (user.userType === 'customer') {
            return <CustomerDashboard user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} theme={theme} />;
          } else {
            return <DriverDashboard user={user} token={token} showMessage={showMessage} theme={theme} />;
          }
      }
    } else {
      // If no user is logged in, show the home, login or register page
      switch (currentPage) {
        case 'home':
          return <HomePage setCurrentPage={setCurrentPage} theme={theme} />;
        case 'register':
          return <Register onRegisterSuccess={() => setCurrentPage('login')} showMessage={showMessage} theme={theme} />;
        case 'login':
        default:
          return <Login onLoginSuccess={handleLogin} showMessage={showMessage} theme={theme} />;
      }
    }
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <>
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: themeColors[theme].background, color: themeColors[theme].text }}>
        {/* Navigation for the app */}
        <Navbar 
          user={user} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="container-fluid flex-grow-1"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
        
        {/* Enhanced Footer */}
        <motion.footer 
          className="py-4 mt-auto"
          style={{ backgroundColor: themeColors[theme].dark, color: themeColors[theme].light }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-6 mb-4 mb-md-0">
                <h5><i className="bi bi-car-front-fill me-2"></i>RIDA</h5>
                <p>Your reliable ride booking service.</p>
              </div>
              <div className="col-md-3 mb-4 mb-md-0">
                <h5>Quick Links</h5>
                <ul className="list-unstyled">
                  <li><button className="btn btn-link p-0 text-decoration-none" onClick={() => setCurrentPage('home')}>Home</button></li>
                  <li><button className="btn btn-link p-0 text-decoration-none" onClick={() => setCurrentPage('login')}>Login</button></li>
                  <li><button className="btn btn-link p-0 text-decoration-none" onClick={() => setCurrentPage('register')}>Register</button></li>
                </ul>
              </div>
              <div className="col-md-3">
                <h5>Contact Us</h5>
                <p><i className="bi bi-envelope me-2"></i> info@driverbooking.com</p>
                <p><i className="bi bi-telephone me-2"></i> +(250) 796359266</p>
              </div>
            </div>
            <hr className="bg-white bg-opacity-25" />
            <div className="text-center">
              <p className="mb-0">&copy; {new Date().getFullYear()} RIDA. All rights reserved.</p>
            </div>
          </div>
        </motion.footer>
      </div>
      
      {/* Enhanced Notification Modal */}
      <Notification 
        message={message.text} 
        type={message.type} 
        visible={message.visible} 
        onClose={() => setMessage(prev => ({ ...prev, visible: false }))} 
      />
    </>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalDrivers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    revenue: 0
  });
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Fetch bookings
        const bookingsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!bookingsResponse.ok) throw new Error('Failed to fetch bookings');
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        
        // Fetch drivers
        const driversResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/drivers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!driversResponse.ok) throw new Error('Failed to fetch drivers');
        const driversData = await driversResponse.json();
        setDrivers(driversData);
        
        // Calculate stats
        const totalUsers = usersData.length;
        const totalBookings = bookingsData.length;
        const totalDrivers = driversData.length;
        const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
        const completedBookings = bookingsData.filter(b => b.status === 'completed').length;
        const revenue = bookingsData
          .filter(b => b.status === 'completed')
          .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);
          
        setStats({
          totalUsers,
          totalBookings,
          totalDrivers,
          pendingBookings,
          completedBookings,
          revenue
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
        showMessage('Failed to load data.', 'error');
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
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete user');
        setUsers(users.filter(user => user._id !== userId));
        showMessage('User deleted successfully.', 'success');
      } catch (err) {
        console.error('Error deleting user:', err);
        showMessage('Failed to delete user.', 'error');
      }
    }
  };
  
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete booking');
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        showMessage('Booking deleted successfully.', 'success');
      } catch (err) {
        console.error('Error deleting booking:', err);
        showMessage('Failed to delete booking.', 'error');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="row g-4">
      <div className="col-12 col-lg-3 col-xl-2">
        <div className="card shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-speedometer2 me-2"></i> <span className="d-none d-md-inline">Dashboard</span>
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i> <span className="d-none d-md-inline">Users</span>
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'drivers' ? 'active' : ''}`}
                onClick={() => setActiveTab('drivers')}
              >
                <i className="bi bi-person-badge me-2"></i> <span className="d-none d-md-inline">Drivers</span>
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <i className="bi bi-calendar-check me-2"></i> <span className="d-none d-md-inline">Bookings</span>
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <i className="bi bi-graph-up me-2"></i> <span className="d-none d-md-inline">Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-lg-9 col-xl-10">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h2 className="h3 fw-bold mb-3 mb-md-0">Admin Dashboard</h2>
          <div className="text-muted">
            <i className="bi bi-person-circle me-1"></i> {user.name}
          </div>
        </div>
        
        {activeTab === 'dashboard' && (
          <div>
            <div className="row g-4 mb-4">
              <div className="col-6 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                          <i className="bi bi-people fs-4 text-primary"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="text-muted mb-1">Total Users</h6>
                        <h3 className="mb-0">{stats.totalUsers}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-6 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3">
                          <i className="bi bi-person-badge fs-4 text-success"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="text-muted mb-1">Total Drivers</h6>
                        <h3 className="mb-0">{stats.totalDrivers}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-6 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-info bg-opacity-10 p-3">
                          <i className="bi bi-calendar-check fs-4 text-info"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="text-muted mb-1">Total Bookings</h6>
                        <h3 className="mb-0">{stats.totalBookings}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-6 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                          <i className="bi bi-currency-dollar fs-4 text-warning"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="text-muted mb-1">Revenue</h6>
                        <h3 className="mb-0">${stats.revenue.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0">Booking Status</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Pending</span>
                      <span className="fw-bold">{stats.pendingBookings}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Completed</span>
                      <span className="fw-bold">{stats.completedBookings}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Cancelled</span>
                      <span className="fw-bold">{stats.totalBookings - stats.pendingBookings - stats.completedBookings}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0">Recent Activity</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                          <i className="bi bi-person-plus text-primary"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-0">New user registered</h6>
                        <small className="text-muted">2 hours ago</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-success bg-opacity-10 p-2">
                          <i className="bi bi-check-circle text-success"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-0">Booking completed</h6>
                        <small className="text-muted">5 hours ago</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-info bg-opacity-10 p-2">
                          <i className="bi bi-car-front text-info"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-0">New driver registered</h6>
                        <small className="text-muted">1 day ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-header bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">Manage Users</h5>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Add User
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="d-none d-md-table-cell">User Type</th>
                      <th className="d-none d-md-table-cell">Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td>
                          <span className="d-md-none">{user.email.substring(0, 15)}...</span>
                          <span className="d-none d-md-inline">{user.email}</span>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <span className={`badge ${user.userType === 'admin' ? 'bg-danger' : user.userType === 'driver' ? 'bg-primary' : 'bg-success'}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="d-none d-md-table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'drivers' && (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-header bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">Manage Drivers</h5>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Add Driver
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Vehicle</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            {driver.user.name}
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">{driver.vehicle.make} {driver.vehicle.model}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            {driver.ratings?.average?.toFixed(1) || '5.0'}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${driver.availability?.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                            {driver.availability?.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-header bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">Manage Bookings</h5>
              <div className="d-flex">
                <input type="text" className="form-control form-control-sm me-2" placeholder="Search bookings..." />
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-filter"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th className="d-none d-md-table-cell">Customer</th>
                      <th className="d-none d-md-table-cell">Driver</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>#{booking._id.substring(0, 8)}</td>
                        <td className="d-none d-md-table-cell">{booking.customer?.name || 'N/A'}</td>
                        <td className="d-none d-md-table-cell">{booking.driver?.user?.name || 'N/A'}</td>
                        <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${booking.status === 'completed' ? 'bg-success' : booking.status === 'accepted' ? 'bg-primary' : booking.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>${booking.pricing?.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteBooking(booking._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Reports & Analytics</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                    <div className="card-body">
                      <h6 className="card-title">Booking Trends</h6>
                      <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
                        <i className="bi bi-graph-up-arrow fs-1 text-muted"></i>
                      </div>
                      <p className="text-center text-muted">Booking trend chart would appear here</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                    <div className="card-body">
                      <h6 className="card-title">Revenue Analysis</h6>
                      <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
                        <i className="bi bi-pie-chart fs-1 text-muted"></i>
                      </div>
                      <p className="text-center text-muted">Revenue chart would appear here</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="btn btn-primary">
                  <i className="bi bi-download me-2"></i> Export Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Homepage component with improved hero section
const HomePage = ({ setCurrentPage, theme }) => {
  const colors = themeColors[theme];
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* 1. Welcome Section */}
      <motion.div 
        className="jumbotron text-white rounded-3 p-3 p-md-4 mb-5 text-center position-relative overflow-hidden"
        style={{ backgroundColor: colors.primary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Moving car icons */}
        <MovingCarIcon direction="right" delay={0} />
        <MovingCarIcon direction="left" delay={2} />
        <MovingCarIcon direction="right" delay={4} />
        
        {/* Floating icons */}
        <motion.div 
          className="position-absolute"
          style={{ top: '10%', left: '10%', zIndex: 1 }}
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
        </motion.div>
        
        <motion.div 
          className="position-absolute"
          style={{ top: '20%', right: '15%', zIndex: 1 }}
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <i className="bi bi-currency-dollar text-white" style={{ fontSize: '1.5rem' }}></i>
        </motion.div>
        
        <motion.div 
          className="position-absolute"
          style={{ bottom: '15%', left: '20%', zIndex: 1 }}
          animate={{ 
            y: [0, -12, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <i className="bi bi-clock-history text-white" style={{ fontSize: '1.5rem' }}></i>
        </motion.div>
        
        <motion.div 
          className="position-absolute"
          style={{ bottom: '20%', right: '10%', zIndex: 1 }}
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <i className="bi bi-person-badge text-white" style={{ fontSize: '1.5rem' }}></i>
        </motion.div>
        
        {/* Main content */}
        <motion.div 
          className="position-relative"
          style={{ zIndex: 2 }}
        >
          <motion.h1 
            className="display-5 fw-bold mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to RIDA
          </motion.h1>
          <motion.p 
            className="lead mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your Car. Our Driver. Your Comfort & Safety.
          </motion.p>
          <motion.p
            className="mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Trusted professional drivers ready when you need them
          </motion.p>
          <motion.div 
            className="d-flex flex-column flex-sm-row justify-content-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button 
              className="btn btn-light btn-lg fw-semibold px-4"
              onClick={() => setCurrentPage('register')}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bi bi-person-plus me-2"></i>Book Your Driver Now
            </motion.button>
            <motion.button 
              className="btn btn-outline-light btn-lg fw-semibold px-4"
              onClick={() => setCurrentPage('login')}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i> Login
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* 2. Who We Are Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Who We Are</h2>
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-6 mb-4 mb-md-0">
                  <h3 className="card-title">Your Trusted Transportation Partner</h3>
                  <p className="card-text">
                    RIDA is a premier ride-booking platform catering for different ride scenarios like:
                  </p>
                  <ul>
                    <li>After drinks or Night Events: Enjoy yourself without worry. After drinks at the bar or an event we'll get you and your car safely</li>
                    <li>Long trips outside Kigali: Heading outside Kigali? Our experienced drivers ensure safe, comfortable journeys at fair, distance-based rates</li>
                    <li>Family and Special Events: From weddings to family outings, corporate events to casual rides, we provide drivers who adapt to your needs</li>
                    <li>Tourist and Diaspora clients: Discover Rwanda with a trusted driver who's also your local guide - fluent in the roads, communities, attractions, and experiences</li>
                  </ul>
                  <p className="card-text">
                    <h4>How it Works</h4>
                    <ul>
                      <li>Book a driver (Online or call)</li>
                      <li>We send a Professional Driver to your location</li>
                      <li>Enjoy your ride</li>
                      <li>Pay predictable fees</li>
                    </ul>
                  </p>
                </div>
                <div className="col-md-6 text-center">
                  {/* Animated car icon */}
                  <motion.div 
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '250px' }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.i 
                      className="bi bi-car-front-fill text-primary" 
                      style={{ fontSize: '7rem' }}
                      animate={{ 
                        x: [0, 5, 0],
                        rotate: [0, 2, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3. Service Packages Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Our Service Packages</h2>
          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-3">
              <AnimatedCard delay={0.1}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-primary mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-cup-straw fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Night Out</h4>
                  <p className="card-text">Enjoy your evening without worrying about driving. Our professional drivers will get you and your car home safely.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <AnimatedCard delay={0.3}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-success mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-geo-alt-fill fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Long Distance</h4>
                  <p className="card-text">Traveling outside Kigali? Our experienced drivers ensure safe, comfortable journeys at fair, distance-based rates.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <AnimatedCard delay={0.5}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-info mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-people-fill fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Special Events</h4>
                  <p className="card-text">From weddings to family outings, corporate events to casual rides, we provide drivers who adapt to your needs.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <AnimatedCard delay={0.7}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-warning mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-camera-fill fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Tourism</h4>
                  <p className="card-text">Discover Rwanda with a trusted driver who's also your local guide - fluent in the roads, communities, attractions, and experiences.</p>
                </motion.div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
      
      {/* 4. How It Works Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">How It Works</h2>
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-6 mb-4 mb-md-0">
                  <h3 className="card-title">Easy Booking Process</h3>
                  <p className="card-text">
                    Our platform makes it simple to find and book the perfect driver for your needs:
                  </p>
                  <ol>
                    <li><strong>Sign Up or Login:</strong> Create an account or log in to your existing account.</li>
                    <li><strong>Filter Drivers:</strong> Use our advanced filtering system to find drivers that match your specific requirements:
                      <ul>
                        <li>Age range and years of experience</li>
                        <li>Vehicle type and transmission preference</li>
                        <li>Service areas and availability</li>
                        <li>Languages spoken and service types</li>
                      </ul>
                    </li>
                    <li><strong>Book Your Driver:</strong> Select your preferred driver and provide trip details including pickup location, time, and destination.</li>
                    <li><strong>Enjoy Your Ride:</strong> Your professional driver will arrive at the scheduled time and get you to your destination safely.</li>
                    <li><strong>Pay & Rate:</strong> Pay the calculated fare and rate your experience to help us improve our service.</li>
                  </ol>
                </div>
                <div className="col-md-6 text-center">
                  {/* Animated steps illustration */}
                  <div className="d-flex flex-column align-items-center">
                    {[1, 2, 3, 4, 5].map((step, index) => (
                      <motion.div 
                        key={step}
                        className="d-flex align-items-center mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '50px', height: '50px' }}>
                          {step}
                        </div>
                        <div className="text-start">
                          {step === 1 && <p className="mb-0">Sign Up</p>}
                          {step === 2 && <p className="mb-0">Filter Drivers</p>}
                          {step === 3 && <p className="mb-0">Book Driver</p>}
                          {step === 4 && <p className="mb-0">Enjoy Ride</p>}
                          {step === 5 && <p className="mb-0">Pay & Rate</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 5. Why Choose Our Drivers Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Why Choose Our Drivers</h2>
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <AnimatedCard delay={0.1}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-primary mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-shield-check fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Verified Professionals</h4>
                  <p className="card-text">All our drivers undergo thorough background checks and vehicle inspections to ensure your safety.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-6 col-md-3">
              <AnimatedCard delay={0.3}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-success mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-currency-dollar fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Transparent Pricing</h4>
                  <p className="card-text">Competitive pricing with no hidden fees. Know exactly what you'll pay before booking.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-6 col-md-3">
              <AnimatedCard delay={0.5}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-info mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-clock-history fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">24/7 Availability</h4>
                  <p className="card-text">Our service is available round the clock. Book a ride anytime, anywhere with our easy-to-use platform.</p>
                </motion.div>
              </AnimatedCard>
            </div>
            <div className="col-6 col-md-3">
              <AnimatedCard delay={0.7}>
                <motion.div 
                  className="card h-100 border-0 shadow-sm text-center p-4"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div 
                    className="text-warning mb-3"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <i className="bi bi-person-badge fs-1"></i>
                  </motion.div>
                  <h4 className="card-title">Experienced Drivers</h4>
                  <p className="card-text">Professional, courteous drivers who prioritize your comfort and punctuality.</p>
                </motion.div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
      
      {/* 6. Book Your Driver Now Section */}
      <div className="text-center py-5 mb-5">
        <h2 className="mb-4">Ready to Experience the Best Ride Service?</h2>
        <p className="lead mb-4">Join thousands of satisfied customers who have made RIDA their preferred transportation partner.</p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <motion.button 
            className="btn btn-primary btn-lg fw-semibold px-4"
            onClick={() => setCurrentPage('register')}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(0, 86, 179, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-person-plus me-2"></i> Book a Driver Now
          </motion.button>
          <motion.button 
            className="btn btn-outline-primary btn-lg fw-semibold px-4"
            onClick={() => setCurrentPage('login')}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(0, 86, 179, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
          </motion.button>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">What Our Customers Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <motion.div 
                className="card h-100 border-0 shadow-sm"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-warning me-2">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <span className="text-muted">5.0</span>
                  </div>
                  <p className="card-text">
                    "After a late night out, I don't worry anymore. I know I'll get home safely as if am with my car."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <span className="text-white fw-bold">Je</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Jean</h6>
                      <small className="text-muted">Regular Customer</small>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="col-md-4">
              <motion.div 
                className="card h-100 border-0 shadow-sm"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-warning me-2">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <span className="text-muted">5.0</span>
                  </div>
                  <p className="card-text">
                    "We used the service for a family trip outside Kigali. The driver was professional and the pricing was so clear."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <span className="text-white fw-bold">Al</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Alice</h6>
                      <small className="text-muted">Long Trip Customer</small>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="col-md-4">
              <motion.div 
                className="card h-100 border-0 shadow-sm"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-warning me-2">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                    </div>
                    <span className="text-muted">4.5</span>
                  </div>
                  <p className="card-text">
                    "The booking process is simple and straightforward. As a tourist, having a driver who also acted as a guide made all the difference."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <span className="text-white fw-bold">Ma</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Maria</h6>
                      <small className="text-muted">Tourist Traveller</small>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Review Modal Component
const ReviewModal = ({ show, onClose, booking, user, token, showMessage }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          rating,
          comment
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit review');
      }
      const data = await response.json();
      showMessage('Review submitted successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      showMessage(`Failed to submit review: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Rate Your Experience</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Rating</label>
                <div className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-lg p-0 me-1"
                      onClick={() => setRating(star)}
                    >
                      <i className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}></i>
                    </button>
                  ))}
                  <span className="ms-2">{rating} / 5</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Comment</label>
                <textarea
                  className="form-control"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  placeholder="Share your experience with this booking..."
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Dashboard Component - Fixed with single payment method and driver filtering
const CustomerDashboard = ({ user, token, showMessage, setCurrentPage, theme }) => {
  const colors = themeColors[theme];
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [bookedDriverId, setBookedDriverId] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fixed payment method state to use the exact format backend expects
  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    scheduledTime: '',
    vehicleType: '',
    transmissionType: '',
    distance: 0,
    calculatedFare: 0,
    durationValue: 1,
    durationUnit: 'hours',
    language: 'english',
    paymentMethod: "MomoPay Code 123456" // Only payment method allowed by backend
  });
  
  // Driver filter state
  const [filters, setFilters] = useState({
    ageRange: '',
    minExperience: '',
    transmission: '',
    vehicleType: '',
    serviceArea: '',
    timeAvailability: '',
    serviceType: '',
    language: ''
  });
  
  // Fetch available drivers
  const fetchDrivers = async () => {
    try {
      setError(null);
      console.log(`Fetching drivers from: ${process.env.REACT_APP_API_URL}/api/drivers/all-drivers`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/all-drivers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Handle 404 - endpoint doesn't exist or server issues
      if (response.status === 404) {
        console.log('Drivers endpoint not found (404)');
        setDrivers([]);
        setFilteredDrivers([]);
        setError('The drivers service is currently unavailable. Please try again later.');
        showMessage('Drivers service temporarily unavailable.', 'error');
        return;
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Drivers API response:', data);
      
      // Check if the response is the "no drivers found" message
      if (data.msg && data.msg.includes('No drivers found')) {
        console.log('No drivers found in database');
        setDrivers([]); // Set empty array so the UI shows "No drivers available"
        setFilteredDrivers([]);
        setError(null); // Clear any previous errors
        showMessage('No drivers are currently available in your area.', 'info');
      } else if (Array.isArray(data)) {
        // If data is an array of drivers, use it
        console.log('Found drivers array:', data.length);
        setDrivers(data);
        setFilteredDrivers(data);
        setError(null);
      } else if (data.drivers && Array.isArray(data.drivers)) {
        // If data has a drivers property that's an array, use it
        console.log('Found drivers in data.drivers:', data.drivers.length);
        setDrivers(data.drivers);
        setFilteredDrivers(data.drivers);
        setError(null);
      } else {
        // Fallback: unexpected response format
        console.log('Unexpected response format:', data);
        setDrivers([]);
        setFilteredDrivers([]);
        setError('Unable to load drivers. Please try again.');
        showMessage('Unable to load drivers. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setDrivers([]); // Set empty array on error
      setFilteredDrivers([]);
      
      // More specific error handling
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to the server. Please check if the backend is running.');
        showMessage('Cannot connect to server. Please try again later.', 'error');
      } else {
        setError('Failed to load drivers. Please try again.');
        showMessage('Failed to load drivers.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters when drivers or filter criteria change
  useEffect(() => {
    if (drivers.length === 0) {
      setFilteredDrivers([]);
      return;
    }
    
    let result = [...drivers];
    
    // Apply age range filter
    if (filters.ageRange) {
      result = result.filter(driver => 
        driver.ageRange === filters.ageRange
      );
    }
    
    // Apply minimum experience filter
    if (filters.minExperience) {
      result = result.filter(driver => {
        const driverExp = parseInt(driver.yearsOfExperience) || 0;
        const minExp = parseInt(filters.minExperience) || 0;
        return driverExp >= minExp;
      });
    }
    
    // Apply transmission proficiency filter
    if (filters.transmission) {
      result = result.filter(driver => 
        driver.transmissionProficiency === filters.transmission ||
        driver.transmissionProficiency === 'both'
      );
    }
    
    // Apply vehicle type filter
    if (filters.vehicleType) {
      result = result.filter(driver => 
        driver.vehicleTypesComfortable && 
        driver.vehicleTypesComfortable.includes(filters.vehicleType)
      );
    }
    
    // Apply service area filter
    if (filters.serviceArea) {
      result = result.filter(driver => 
        driver.preferredServiceAreas && 
        driver.preferredServiceAreas.includes(filters.serviceArea)
      );
    }
    
    // Apply time availability filter
    if (filters.timeAvailability) {
      result = result.filter(driver => 
        driver.timeAvailability === filters.timeAvailability ||
        driver.timeAvailability === 'flexible'
      );
    }
    
    // Apply service type filter
    if (filters.serviceType) {
      result = result.filter(driver => 
        driver.openToServices && 
        driver.openToServices.includes(filters.serviceType)
      );
    }
    
    // Apply language filter
    if (filters.language) {
      result = result.filter(driver => 
        driver.languagesSpoken && 
        driver.languagesSpoken.includes(filters.language)
      );
    }
    
    setFilteredDrivers(result);
  }, [drivers, filters]);
  
  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      ageRange: '',
      minExperience: '',
      transmission: '',
      vehicleType: '',
      serviceArea: '',
      timeAvailability: '',
      serviceType: '',
      language: ''
    });
  };
  
  useEffect(() => {
    // Fetch a list of available drivers on component mount
    fetchDrivers();
    
    // Fetch active booking if exists
    const fetchActiveBooking = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveBooking(data);
        }
      } catch (err) {
        console.error('Error fetching active booking:', err);
      }
    };
    
    fetchActiveBooking();
  }, [token, showMessage]);
  
  // Handle booking form input changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate fare when distance changes
    if (name === 'distance') {
      const distanceValue = parseFloat(value) || 0;
      let fare = 0;
      
      if (distanceValue <= 10) {
        fare = 5000;
      } else if (distanceValue <= 50) {
        fare = 5000 + (distanceValue - 10) * 250;
      } else {
        fare = 5000 + (40 * 250) + ((distanceValue - 50) * 90);
      }
      
      setBookingData(prev => ({
        ...prev,
        calculatedFare: fare
      }));
    }
  };
  
  // Open booking form for a specific driver
  const handleBookDriver = (driver) => {
    setSelectedDriver(driver);
    setShowBookingForm(true);
    // Reset form data
    setBookingData({
      pickupAddress: '',
      dropoffAddress: '',
      scheduledTime: '',
      vehicleType: '',
      transmissionType: '',
      distance: 0,
      calculatedFare: 0,
      durationValue: 1,
      durationUnit: 'hours',
      language: 'english',
      paymentMethod: "MomoPay Code 123456"
    });
  };
  
  // Fixed submitBooking function
  const submitBooking = async () => {
    if (!selectedDriver) return;
    
    setIsBookingInProgress(true);
    setBookedDriverId(selectedDriver._id);
    
    try {
      // Validate required fields
      if (!bookingData.pickupAddress || !bookingData.scheduledTime) {
        throw new Error('Pickup address and scheduled time are required');
      }
      
      // Calculate pricing based on distance
      const distanceValue = parseFloat(bookingData.distance) || 0;
      let baseAmount = 0;
      
      if (distanceValue <= 10) {
        baseAmount = 5000;
      } else if (distanceValue <= 50) {
        baseAmount = 5000 + (distanceValue - 10) * 250;
      } else {
        baseAmount = 5000 + (40 * 250) + ((distanceValue - 50) * 90);
      }
      
      const discount = 0; // No discount for now
      const tax = 0; // No tax for now
      const totalAmount = baseAmount - discount + tax;
      
      // Validate pricing
      if (isNaN(baseAmount) || isNaN(totalAmount) || baseAmount <= 0 || totalAmount <= 0) {
        throw new Error('Invalid pricing calculation. Please check your inputs.');
      }
      
      // Prepare the booking payload with all required fields
      const bookingPayload = {
        driverId: selectedDriver._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-1.9441, 30.0619], // Default coordinates for Kigali
          address: bookingData.pickupAddress
        },
        bookingType: 'once', // Default to one-time booking
        duration: {
          value: parseInt(bookingData.durationValue),
          unit: bookingData.durationUnit
        },
        scheduledTime: bookingData.scheduledTime,
        // Send paymentMethod as the exact string backend expects
        paymentMethod: bookingData.paymentMethod, // "MomoPay Code 123456"
        // Add pricing fields that backend might expect
        pricing: {
          baseAmount: baseAmount,
          discount: discount,
          tax: tax,
          totalAmount: totalAmount
        },
        notes: `Vehicle Type: ${bookingData.vehicleType}, Transmission: ${bookingData.transmissionType}, Language: ${bookingData.language}`
      };
      
      // Add dropoff location only if provided
      if (bookingData.dropoffAddress && bookingData.dropoffAddress.trim()) {
        bookingPayload.dropoffLocation = {
          type: 'Point',
          coordinates: [-1.9441, 30.0619],
          address: bookingData.dropoffAddress
        };
      }
      
      console.log('Sending booking payload:', JSON.stringify(bookingPayload, null, 2));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });
      
      console.log('Booking response status:', response.status);
      
      if (!response.ok) {
        // Enhanced error handling to get detailed error information
        let errorData;
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          
          // Try to parse as JSON
          errorData = errorText ? JSON.parse(errorText) : { msg: 'Unknown error' };
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { msg: `Server error: ${response.status} ${response.statusText}` };
        }
        
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map(err => err.msg).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        // Use the server's error message if available
        const errorMessage = errorData.error || errorData.msg || errorData.message || 'Failed to create booking';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Booking successful:', data);
      showMessage('Booking created successfully!', 'success');
      setShowBookingForm(false);
      
      // Refresh drivers list
      fetchDrivers();
      
    } catch (err) {
      console.error('Error creating booking:', err);
      showMessage(`Failed to create booking: ${err.message}`, 'error');
    } finally {
      setIsBookingInProgress(false);
      setBookedDriverId(null);
    }
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchDrivers();
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="p-3 p-md-4"
    >
      {/* Active Booking Section */}
      {activeBooking && (
        <DriverTrackingMap booking={activeBooking} theme={theme} />
      )}
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className="h3 fw-bold">Welcome, {user.name}!</h2>
          <p className="text-muted">Find and book a driver for your next trip.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <motion.button 
            className="btn btn-outline-primary"
            onClick={fetchDrivers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </motion.button>
          <motion.button 
            className="btn btn-info text-white"
            onClick={() => setShowFareCalculator(!showFareCalculator)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-calculator me-1"></i> 
            {showFareCalculator ? 'Hide' : 'Show'} Calculator
          </motion.button>
          <motion.button 
            className="btn btn-primary"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-funnel me-1"></i> 
            {showFilters ? 'Hide' : 'Show'} Filters
          </motion.button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <motion.div 
          className="card border-0 shadow-sm mb-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="card-body p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">Filter Drivers</h3>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
            
            <div className="row g-3">
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Age Range</label>
                <select 
                  className="form-select" 
                  name="ageRange"
                  value={filters.ageRange}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Age</option>
                  <option value="20-30">20-30</option>
                  <option value="30-40">30-40</option>
                  <option value="40+">40+</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Minimum Experience (years)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="minExperience"
                  value={filters.minExperience}
                  onChange={handleFilterChange}
                  min="0"
                  placeholder="e.g. 2"
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                />
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Transmission</label>
                <select 
                  className="form-select" 
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Vehicle Type</label>
                <select 
                  className="form-select" 
                  name="vehicleType"
                  value={filters.vehicleType}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Vehicle</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="pickup">Pickup</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Service Area</label>
                <select 
                  className="form-select" 
                  name="serviceArea"
                  value={filters.serviceArea}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Area</option>
                  <option value="kigali">Kigali</option>
                  <option value="outsideKigali">Outside Kigali</option>
                  <option value="nationwide">Nationwide</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Time Availability</label>
                <select 
                  className="form-select" 
                  name="timeAvailability"
                  value={filters.timeAvailability}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Time</option>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Service Type</label>
                <select 
                  className="form-select" 
                  name="serviceType"
                  value={filters.serviceType}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Service</option>
                  <option value="shortTrips">Short Trips</option>
                  <option value="longTrips">Long Trips</option>
                  <option value="events">Events</option>
                  <option value="tours">Tours</option>
                </select>
              </div>
              
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Language</label>
                <select 
                  className="form-select" 
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Language</option>
                  <option value="english">English</option>
                  <option value="kinyarwanda">Kinyarwanda</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>
            
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div className="text-muted">
                {filteredDrivers.length} of {drivers.length} drivers match your filters
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Fare Calculator */}
      {showFareCalculator && (
        <motion.div 
          className="card border-0 shadow-sm mb-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="card-body p-3 p-md-4">
            <h3 className="h5 mb-3">Fare Calculator</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Distance (km)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter distance in km"
                      id="fareDistance"
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                    <motion.button 
                      className="btn btn-primary"
                      type="button"
                      onClick={() => {
                        const distance = parseFloat(document.getElementById('fareDistance').value);
                        if (isNaN(distance) || distance <= 0) {
                          showMessage('Please enter a valid distance.', 'error');
                          return;
                        }
                        
                        let fare = 0;
                        if (distance <= 10) {
                          fare = 5000;
                        } else if (distance <= 50) {
                          fare = 5000 + (distance - 10) * 250;
                        } else {
                          fare = 5000 + (40 * 250) + ((distance - 50) * 90);
                        }
                        
                        showMessage(`Estimated Fare: ${fare.toLocaleString()} RWF`, 'info');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Calculate
                    </motion.button>
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    <strong>Fare Structure:</strong><br />
                    First 10 km: 5,000 RWF (flat rate)<br />
                    10-50 km: 250 RWF per additional km<br />
                    Above 50 km: 90 RWF per additional km
                  </small>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="alert alert-warning text-center mb-4" role="alert">
          <h5 className="alert-heading">Service Unavailable</h5>
          <p className="mb-3">{error}</p>
          <motion.button 
            onClick={handleRetry} 
            className="btn btn-outline-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      )}
      
      {/* Drivers List */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted h5">Loading drivers...</p>
              </div>
            </div>
          </div>
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver, index) => (
            <div key={driver._id} className="col-12 col-md-6 col-lg-4">
              <AnimatedCard delay={index * 0.1}>
                <DriverCard 
                  driver={driver} 
                  onBook={handleBookDriver} 
                  isBooking={isBookingInProgress && bookedDriverId === driver._id}
                  theme={theme}
                />
              </AnimatedCard>
            </div>
          ))
        ) : (
          !error && (
            <div className="col-12">
              <div className="text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-car-front text-muted" style={{fontSize: '4rem'}}></i>
                </div>
                <h4 className="text-muted mb-3">
                  {drivers.length > 0 ? 'No drivers match your filters' : 'No Drivers Available'}
                </h4>
                <p className="text-muted">
                  {drivers.length > 0 
                    ? 'Try adjusting your filter criteria to see more results.'
                    : 'There are currently no drivers available in your area. Please check back later.'
                  }
                </p>
                {drivers.length > 0 && (
                  <motion.button 
                    onClick={resetFilters} 
                    className="btn btn-outline-primary mt-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Filters
                  </motion.button>
                )}
                <motion.button 
                  onClick={handleRetry} 
                  className="btn btn-outline-primary mt-3 ms-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </motion.button>
              </div>
            </div>
          )
        )}
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedDriver && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Book Driver: {selectedDriver.user.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowBookingForm(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* 1. Pickup Address */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">1. Pickup Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="pickupAddress"
                      value={bookingData.pickupAddress}
                      onChange={handleBookingInputChange}
                      required
                      placeholder="Enter pickup location"
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                  </div>
                  
                  {/* 2. Pickup Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">2. Pickup Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      name="scheduledTime"
                      value={bookingData.scheduledTime}
                      onChange={handleBookingInputChange}
                      min={new Date().toISOString().slice(0, 16)} // Set min to current date/time
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                  </div>
                  
                  {/* 3. Vehicle Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">3. Vehicle Type</label>
                    <select 
                      className="form-select" 
                      name="vehicleType"
                      value={bookingData.vehicleType}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="pickup">Pickup</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  
                  {/* 4. Transmission Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">4. Transmission Type</label>
                    <select 
                      className="form-select" 
                      name="transmissionType"
                      value={bookingData.transmissionType}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="">Select transmission type</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  
                  {/* 5. Distance and Dropoff Address */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">5. Destination & Distance</label>
                    <input 
                      type="text" 
                      className="form-control mb-2" 
                      name="dropoffAddress"
                      value={bookingData.dropoffAddress}
                      onChange={handleBookingInputChange}
                      placeholder="Enter destination address"
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="distance"
                        value={bookingData.distance}
                        onChange={handleBookingInputChange}
                        placeholder="Distance in km"
                        min="0"
                        step="0.1"
                        style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                      />
                      <span className="input-group-text">km</span>
                    </div>
                    {bookingData.distance > 0 && (
                      <div className="mt-2 alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Estimated Fare: <strong>{bookingData.calculatedFare.toLocaleString()} RWF</strong>
                      </div>
                    )}
                  </div>
                  
                  {/* 6. Duration */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">6. Duration</label>
                    <div className="row g-2">
                      <div className="col-8">
                        <input 
                          type="number" 
                          className="form-control" 
                          name="durationValue"
                          value={bookingData.durationValue}
                          onChange={handleBookingInputChange}
                          min="1"
                          required
                          style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                        />
                      </div>
                      <div className="col-4">
                        <select 
                          className="form-select" 
                          name="durationUnit"
                          value={bookingData.durationUnit}
                          onChange={handleBookingInputChange}
                          style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* 7. Language */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">7. Preferred Language</label>
                    <select 
                      className="form-select" 
                      name="language"
                      value={bookingData.language}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="english">English</option>
                      <option value="kinyarwanda">Kinyarwanda</option>
                      <option value="french">French</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Method</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="paymentMethod"
                      value={bookingData.paymentMethod}
                      readOnly
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                    <small className="text-muted">Payment method is fixed to MomoPay Code 123456</small>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Close</button>
                <motion.button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={submitBooking}
                  disabled={isBookingInProgress}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isBookingInProgress ? 'Booking...' : 'Book Now'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Driver Dashboard Component - Updated with availability toggle
const DriverDashboard = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  
  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch driver profile');
        }
        
        const data = await response.json();
        setDriverProfile(data);
      } catch (err) {
        console.error('Error fetching driver profile:', err);
        showMessage('Failed to load your profile.', 'error');
      }
    };
    
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/mybookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch bookings');
        }
        
        const data = await response.json();
        const bookingsArray = Array.isArray(data) ? data : (data.bookings || []);
        setBookings(bookingsArray);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        showMessage('Failed to load bookings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDriverProfile();
      fetchBookings();
    } else {
      setLoading(false);
      setBookings([]);
    }
  }, [token, showMessage]);
  
  const toggleAvailability = async () => {
    if (!driverProfile) return;
    
    setIsUpdatingAvailability(true);
    try {
      const newAvailability = !driverProfile.availability.isAvailable;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: newAvailability })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update availability');
      }
      
      // Update local state
      setDriverProfile(prev => ({ 
        ...prev, 
        availability: { 
          ...prev.availability, 
          isAvailable: newAvailability 
        } 
      }));
      showMessage(`You are now ${newAvailability ? 'available' : 'unavailable'} for bookings`, 'success');
    } catch (err) {
      console.error('Error updating availability:', err);
      showMessage(`Failed to update availability: ${err.message}`, 'error');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };
  
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/status/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update booking status');
      }
      
      // Update the booking in the local state
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId ? { ...booking, status } : booking
      ));
      
      // If driver accepted a booking, update their availability to unavailable
      if (status === 'accepted' && driverProfile) {
        setDriverProfile(prev => ({ 
          ...prev, 
          availability: { 
            ...prev.availability, 
            isAvailable: false 
          } 
        }));
        showMessage('You are now marked as unavailable for new bookings', 'info');
      }
      
      showMessage(`Booking status updated to ${status}`, 'success');
    } catch (err) {
      console.error('Error updating booking status:', err);
      showMessage(`Failed to update booking: ${err.message}`, 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading bookings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="h3 fw-bold mb-3 mb-md-0">My Assignments</h2>
        
        {/* Driver Availability Toggle */}
        {driverProfile && (
          <div className="d-flex align-items-center">
            <span className="me-2">
              {driverProfile.availability.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={driverProfile.availability.isAvailable}
                onChange={toggleAvailability}
                disabled={isUpdatingAvailability}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Current Booking Status */}
      {driverProfile?.bookingStats?.currentlyInBooking && (
        <div className="alert alert-info mb-4">
          <h5 className="alert-heading">You are currently in a booking</h5>
          <p className="mb-0">
            Booking ID: {driverProfile.bookingStats.currentBooking.bookingId?.toString().substring(0, 8)}...
            <br />
            End Time: {new Date(driverProfile.bookingStats.currentBooking.endTime).toLocaleString()}
          </p>
        </div>
      )}
      
      {/* Next Booking */}
      {driverProfile?.bookingStats?.nextBooking && (
        <div className="alert alert-warning mb-4">
          <h5 className="alert-heading">Upcoming Booking</h5>
          <p className="mb-0">
            Booking ID: {driverProfile.bookingStats.nextBooking.bookingId?.toString().substring(0, 8)}...
            <br />
            Start Time: {new Date(driverProfile.bookingStats.nextBooking.startTime).toLocaleString()}
          </p>
        </div>
      )}
      
      <div className="row g-4">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">Booking #{booking._id.substring(0, 8)}</h5>
                    <span className={`badge ${booking.status === 'accepted' ? 'bg-success' : booking.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>
                      Customer: {booking.customer?.name || 'Unknown'}
                    </p>
                    <p className="text-muted mb-1">
                      <i className="bi bi-geo-alt me-1"></i>
                      Pickup: {booking.pickupLocation?.address || 'Not specified'}
                    </p>
                    {booking.scheduledTime && (
                      <p className="text-muted mb-1">
                        <i className="bi bi-clock me-1"></i>
                        Pickup Time: {new Date(booking.scheduledTime).toLocaleString()}
                      </p>
                    )}
                    <p className="text-muted mb-0">
                      <i className="bi bi-tag me-1"></i>
                      Type: {booking.bookingType}
                    </p>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm flex-grow-1"
                          onClick={() => updateBookingStatus(booking._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm flex-grow-1"
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button 
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => updateBookingStatus(booking._id, 'started')}
                      >
                        Start Trip
                      </button>
                    )}
                    {booking.status === 'started' && (
                      <button 
                        className="btn btn-success btn-sm w-100"
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                      >
                        Complete Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center p-5">
              <div className="mb-4">
                <i className="bi bi-calendar-x text-muted" style={{fontSize: '4rem'}}></i>
              </div>
              <h4 className="text-muted mb-3">No Assignments</h4>
              <p className="text-muted">You don't have any assignments at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Booking List component that fetches user-specific bookings
const BookingList = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('BookingList: Fetching bookings for user:', user.name);
        console.log('BookingList: Token exists:', !!token);
        
        // Direct fetch call for debugging
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/mybookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('BookingList: Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
          console.error('BookingList: API Error:', errorData);
          
          if (response.status === 404 && errorData.msg === 'Driver profile not found') {
            showMessage('No driver profile found. Please contact admin to set up your driver account.', 'error');
            setBookings([]);
            return;
          }
          
          if (response.status === 401) {
            console.log('BookingList: 401 Unauthorized');
            showMessage('Authentication failed. Please log in again.', 'error');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setTimeout(() => window.location.reload(), 1000);
            return;
          }
          
          throw new Error(errorData.msg || 'Failed to fetch bookings');
        }
        
        const data = await response.json();
        console.log('BookingList: Received data:', data);
        const bookingsArray = Array.isArray(data) ? data : (data.bookings || []);
        setBookings(bookingsArray);
      } catch (err) {
        console.error('BookingList: Error fetching bookings:', err);
        
        if (!err.message.includes('Authentication failed')) {
          showMessage('Failed to load bookings.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
      setBookings([]);
    }
  }, [token, showMessage, user.name]);
  
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };
  
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading bookings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="h3 fw-bold mb-3 mb-md-0">My Bookings</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-filter me-1"></i> Filter
          </button>
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>
      
      <div className="row g-4">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">Booking #{booking._id.substring(0, 8)}</h5>
                    <span className={`badge ${booking.status === 'completed' ? 'bg-success' : booking.status === 'accepted' ? 'bg-primary' : booking.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>
                      {user.userType === 'customer' ? 'Driver' : 'Customer'}: {user.userType === 'customer' ? (booking.driver?.user?.name || booking.driver?.name || 'Unknown') : (booking.customer?.name || 'Unknown')}
                    </p>
                    <p className="text-muted mb-1">
                      <i className="bi bi-tag me-1"></i>
                      Type: {booking.bookingType}
                    </p>
                    {booking.scheduledTime && (
                      <p className="text-muted mb-1">
                        <i className="bi bi-clock me-1"></i>
                        Scheduled: {new Date(booking.scheduledTime).toLocaleString()}
                      </p>
                    )}
                    <p className="text-muted mb-0">
                      <i className="bi bi-calendar me-1"></i>
                      Booked: {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {booking.status === 'completed' && !booking.rating?.customerRating && user.userType === 'customer' && (
                    <button 
                      className="btn btn-warning btn-sm w-100"
                      onClick={() => openReviewModal(booking)}
                    >
                      <i className="bi bi-star me-1"></i> Rate This Booking
                    </button>
                  )}
                  
                  {booking.status === 'completed' && booking.rating?.customerRating && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center">
                        <div className="text-warning me-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi ${i < Math.floor(booking.rating.customerRating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                          ))}
                        </div>
                        <span className="text-muted">{booking.rating.customerRating.toFixed(1)} / 5</span>
                      </div>
                      {booking.rating.customerReview && (
                        <p className="text-muted mt-1 mb-0">"{booking.rating.customerReview}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center p-5">
              <div className="mb-4">
                <i className="bi bi-receipt text-muted" style={{fontSize: '4rem'}}></i>
              </div>
              <h4 className="text-muted mb-3">No Bookings</h4>
              <p className="text-muted">You don't have any bookings yet.</p>
              {user.userType === 'customer' && (
                <button className="btn btn-primary mt-3">
                  <i className="bi bi-plus-circle me-1"></i> Book a Driver
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          show={showReviewModal}
          onClose={closeReviewModal}
          booking={selectedBooking}
          user={user}
          token={token}
          showMessage={showMessage}
        />
      )}
    </div>
  );
};

// Reviews Page Component
const ReviewsPage = ({ user, token, showMessage, theme }) => {
  const colors = themeColors[theme];
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/myreviews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        showMessage('Failed to load reviews.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchReviews();
    } else {
      setLoading(false);
      setReviews([]);
    }
  }, [token, showMessage]);
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading reviews...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 p-md-4">
      <h2 className="h3 fw-bold mb-4">My Reviews</h2>
      <div className="row g-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review._id} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">Booking #{review.booking?._id?.substring(0, 8) || 'N/A'}</h5>
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi ${i < Math.floor(review.rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                      ))}
                      <span className="text-muted ms-1">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>
                      {user.userType === 'customer' ? 'Driver' : 'Customer'}: {review.reviewee?.name || 'Unknown'}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="bi bi-calendar me-1"></i>
                      Date: {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {review.comment && (
                    <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa' }}>
                      <p className="mb-0">"{review.comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center p-5">
              <div className="mb-4">
                <i className="bi bi-star text-muted" style={{fontSize: '4rem'}}></i>
              </div>
              <h4 className="text-muted mb-3">No Reviews</h4>
              <p className="text-muted">You haven't received any reviews yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.msg || 'Login failed');
      }
      
      const responseData = await response.json();
      console.log('Login successful:', responseData.user.name);
      
      const { token, user } = responseData;
      if (!token) {
        throw new Error('No token received from server');
      }
      if (!user) {
        throw new Error('No user data received from server');
      }
      
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
      <motion.div 
        className="bg-white p-4 p-md-5 rounded-3 shadow-sm w-100"
        style={{maxWidth: '24rem', backgroundColor: colors.cardBg}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="h4 fw-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger mb-4 text-center" role="alert">{error}</div>}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control rounded-3"
              required
              style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control rounded-3"
              required
              style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
            />
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// Registration form component
const Register = ({ onRegisterSuccess, showMessage, theme }) => {
  const colors = themeColors[theme];
  // State for all form fields, including nested fields for drivers
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'customer',
    // New nested objects for driver-specific fields
    vehicle: {
      make: '',
      model: '',
      licensePlate: '',
      color: '',
    },
    pricing: {
      hourlyRate: 0,
    },
    bio: '',
    // New driver profile fields
    ageRange: '',
    yearsOfExperience: '',
    transmissionProficiency: 'both',
    vehicleTypesComfortable: [],
    preferredServiceAreas: ['kigali'],
    timeAvailability: 'flexible',
    openToServices: ['shortTrips'],
    languagesSpoken: ['english', 'kinyarwanda']
  });
  const [loading, setLoading] = useState(false);
  
  // General handler for top-level form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Specific handler for nested fields like vehicle or pricing
  const handleNestedChange = (e, parent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      }
    }));
  };
  
  // Handler for array fields (checkboxes)
  const handleArrayChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting registration:', formData);
      
      // Create a payload based on user type
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType,
      };
      
      // Conditionally add driver-specific fields to the payload
      if (formData.userType === 'driver') {
        // Ensure vehicle object is complete and properly formatted
        payload.vehicle = {
          make: formData.vehicle.make.trim(),
          model: formData.vehicle.model.trim(),
          licensePlate: formData.vehicle.licensePlate.trim().toUpperCase(),
          color: formData.vehicle.color.trim(),
        };
        payload.pricing = formData.pricing;
        payload.bio = formData.bio.trim();
        
        // Add new driver profile fields
        payload.ageRange = formData.ageRange;
        payload.yearsOfExperience = formData.yearsOfExperience;
        payload.transmissionProficiency = formData.transmissionProficiency;
        payload.vehicleTypesComfortable = formData.vehicleTypesComfortable;
        payload.preferredServiceAreas = formData.preferredServiceAreas;
        payload.timeAvailability = formData.timeAvailability;
        payload.openToServices = formData.openToServices;
        payload.languagesSpoken = formData.languagesSpoken;
      }
      
      console.log('Final payload being sent:', payload); // Debug log
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Registration response status:', response.status);
      
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Try to parse as JSON
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid response format');
      }
      
      if (response.ok) {
        showMessage('Registration successful! Please login.', 'success');
        onRegisterSuccess();
      } else {
        const errorMsg = data.errors?.[0]?.msg || data.msg || `Registration failed (${response.status})`;
        showMessage(errorMsg, 'error');
        console.error('Registration failed:', data);
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please try again later.';
      showMessage(errorMessage, 'error');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="container p-4 p-md-5 rounded-3 shadow"
      style={{ backgroundColor: colors.cardBg }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="h3 fw-bold text-center mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div className="form-group">
          <label className="form-label fw-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">User Type</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="form-select rounded-3"
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {/* Conditional rendering for driver-specific fields */}
        {formData.userType === 'driver' && (
          <>
            <hr className="my-3"/>
            <h4 className="h5 fw-bold mb-3">Driver Details</h4>
            
            {/* Basic Information */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Age Range</label>
                  <select
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="">Select age range</option>
                    <option value="20-30">20-30</option>
                    <option value="30-40">30-40</option>
                    <option value="40+">40+</option>
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    min="1"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Vehicle Information Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-3">Vehicle Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.vehicle.make}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Toyota, Ford, BMW"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.vehicle.model}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Camry, F-150, X3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.vehicle.licensePlate}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., RAD015F"
                    required
                    style={{ textTransform: 'uppercase', backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.vehicle.color}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Blue, Red, White"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-3">Pricing</h5>
            <div className="form-group">
              <label className="form-label fw-semibold">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.pricing.hourlyRate}
                onChange={(e) => handleNestedChange(e, 'pricing')}
                className="form-control rounded-3"
                min="0"
                step="0.01"
                placeholder="25.00"
                required
                style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
              />
            </div>
            
            {/* Driver Preferences Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-3">Driver Preferences</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Transmission Proficiency</label>
                  <select
                    name="transmissionProficiency"
                    value={formData.transmissionProficiency}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Time Availability</label>
                  <select
                    name="timeAvailability"
                    value={formData.timeAvailability}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Vehicle Types Comfortable */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Vehicle Types Comfortable</label>
              <div className="row g-2">
                {['sedan', 'suv', 'van', 'pickup', 'luxury'].map(type => (
                  <div key={type} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`vehicle-${type}`}
                        value={type}
                        checked={formData.vehicleTypesComfortable.includes(type)}
                        onChange={(e) => handleArrayChange(e, 'vehicleTypesComfortable')}
                      />
                      <label className="form-check-label" htmlFor={`vehicle-${type}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Service Areas */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Preferred Service Areas</label>
              <div className="row g-2">
                {['kigali', 'outsideKigali', 'nationwide'].map(area => (
                  <div key={area} className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`area-${area}`}
                        value={area}
                        checked={formData.preferredServiceAreas.includes(area)}
                        onChange={(e) => handleArrayChange(e, 'preferredServiceAreas')}
                      />
                      <label className="form-check-label" htmlFor={`area-${area}`}>
                        {area === 'kigali' ? 'Kigali' : area === 'outsideKigali' ? 'Outside Kigali' : 'Nationwide'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Open To Services */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Open To Services</label>
              <div className="row g-2">
                {['shortTrips', 'longTrips', 'events', 'tours'].map(service => (
                  <div key={service} className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`service-${service}`}
                        value={service}
                        checked={formData.openToServices.includes(service)}
                        onChange={(e) => handleArrayChange(e, 'openToServices')}
                      />
                      <label className="form-check-label" htmlFor={`service-${service}`}>
                        {service === 'shortTrips' ? 'Short Trips' : 
                         service === 'longTrips' ? 'Long Trips' : 
                         service === 'events' ? 'Events' : 'Tours'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Languages Spoken */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Languages Spoken</label>
              <div className="row g-2">
                {['english', 'kinyarwanda', 'french'].map(lang => (
                  <div key={lang} className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`lang-${lang}`}
                        value={lang}
                        checked={formData.languagesSpoken.includes(lang)}
                        onChange={(e) => handleArrayChange(e, 'languagesSpoken')}
                      />
                      <label className="form-check-label" htmlFor={`lang-${lang}`}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bio Section */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control rounded-3"
                rows="3"
                placeholder="Tell customers about your driving experience and what makes you a great driver..."
                required
                style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
              ></textarea>
            </div>
          </>
        )}
        
        <motion.button
          type="submit"
          disabled={loading}
          className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default App;
