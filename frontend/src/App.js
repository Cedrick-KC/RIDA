import config from './config';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

console.log('=== DEBUGGING ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('============================================');

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

const AnimatedCard = ({ children, delay }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation will only happen once
    threshold: 0.2, // Trigger when 20% of the element is visible
  });
  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: delay }}
    >
      {children}
    </motion.div>
  );
};

// Fare Calculator Page Component - Customer Only
const FareCalculatorPage = ({ user, token, showMessage, setCurrentPage }) => {
  const [distance, setDistance] = useState('');
  const [fare, setFare] = useState(null);
  const [error, setError] = useState('');
  const calculateFare = () => {
    const distanceValue = parseFloat(distance);
    
    // Validation
    if (isNaN(distanceValue) || distanceValue <= 0) {
      setError('Please enter a valid distance.');
      setFare(null);
      return;
    }
    
    setError('');
    
    // Calculate fare based on distance
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
    <>
      {/* Navigation for the app */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="#" onClick={() => setCurrentPage('home')}>
            <i className="bi bi-car-front-fill me-2 fs-4"></i>
            <span>RIDA</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => setCurrentPage('home')}>
                  <i className="bi bi-house-door me-1"></i> Home
                </button>
              </li>
              {user && user.userType === 'customer' && (
                <>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={() => setCurrentPage('customerDashboard')}>
                      <i className="bi bi-calendar-check me-1"></i> Book a Driver
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link active" onClick={() => setCurrentPage('fareCalculator')}>
                      <i className="bi bi-calculator me-1"></i> Fare Calculator
                    </button>
                  </li>
                </>
              )}
            </ul>
            <div className="d-flex align-items-center">
              {user ? (
                <div className="dropdown">
                  <button className="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-person-circle me-1"></i> {user.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><button className="dropdown-item" onClick={() => setCurrentPage('bookings')}><i className="bi bi-receipt me-2"></i> My Bookings</button></li>
                    <li><button className="dropdown-item" onClick={() => setCurrentPage('reviews')}><i className="bi bi-star me-2"></i> Reviews</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={() => {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('user');
                      setCurrentPage('home');
                      showMessage('You have been logged out.', 'info');
                    }}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                  </ul>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="btn btn-outline-light me-2"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </button>
                  <button
                    onClick={() => setCurrentPage('register')}
                    className="btn btn-success"
                  >
                    <i className="bi bi-person-plus me-1"></i> Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="container py-4 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow-sm">
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
                    />
                    <button 
                      className="btn btn-primary btn-lg"
                      type="button"
                      onClick={calculateFare}
                    >
                      Calculate
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
                
                {fare !== null && (
                  <div className="alert alert-success mt-3" role="alert">
                    <h5 className="alert-heading">Estimated Fare</h5>
                    <p className="mb-0 fs-4 fs-md-5 fw-bold">{fare.toLocaleString()} RWF</p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="fw-semibold">Fare Structure:</h6>
                  <ul className="mb-0">
                    <li>First 10 km: 5,000 RWF (flat rate)</li>
                    <li>10-50 km: 250 RWF per additional km</li>
                    <li>Above 50 km: 90 RWF per additional km</li>
                  </ul>
                </div>
                
                <div className="d-grid mt-4">
                  <button 
                    className="btn btn-success btn-lg"
                    onClick={() => setCurrentPage('customerDashboard')}
                  >
                    <i className="bi bi-calendar-check me-2"></i> Book a Driver Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4 mb-md-0">
              <h5><i className="bi bi-car-front-fill me-2"></i>RIDA</h5>
              <p>Your reliable ride booking service.</p>
            </div>
            <div className="col-md-3 mb-4 mb-md-0">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('home')}>Home</button></li>
                <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('fareCalculator')}>Fare Calculator</button></li>
                <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('bookings')}>My Bookings</button></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5>Contact Us</h5>
              <p><i className="bi bi-envelope me-2"></i> info@driverbooking.com</p>
              <p><i className="bi bi-telephone me-2"></i> +(250) 796359266</p>
            </div>
          </div>
          <hr className="bg-white" />
          <div className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} RIDA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
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
          return <AdminDashboard user={user} token={token} showMessage={showMessage} />;
        case 'customerDashboard':
          return <CustomerDashboard user={user} token={token} showMessage={showMessage} />;
        case 'driverDashboard':
          return <DriverDashboard user={user} token={token} showMessage={showMessage} />;
        case 'fareCalculator':
          // Only allow customers to access the fare calculator
          if (user.userType === 'customer') {
            return <FareCalculatorPage user={user} token={token} showMessage={showMessage} setCurrentPage={setCurrentPage} />;
          } else {
            // Redirect non-customers to their appropriate dashboard
            if (user.userType === 'admin') {
              return <AdminDashboard user={user} token={token} showMessage={showMessage} />;
            } else if (user.userType === 'driver') {
              return <DriverDashboard user={user} token={token} showMessage={showMessage} />;
            }
          }
          break;
        case 'bookings':
          return <BookingList user={user} token={token} showMessage={showMessage} />;
        case 'reviews':
          return <ReviewsPage user={user} token={token} showMessage={showMessage} />;
        default:
          // Default to the correct dashboard if the user is logged in but page is invalid
          if (user.userType === 'admin') {
            return <AdminDashboard user={user} token={token} showMessage={showMessage} />;
          } else if (user.userType === 'customer') {
            return <CustomerDashboard user={user} token={token} showMessage={showMessage} />;
          } else {
            return <DriverDashboard user={user} token={token} showMessage={showMessage} />;
          }
      }
    } else {
      // If no user is logged in, show the home, login or register page
      switch (currentPage) {
        case 'home':
          return <HomePage setCurrentPage={setCurrentPage} />;
        case 'register':
          return <Register onRegisterSuccess={() => setCurrentPage('login')} showMessage={showMessage} />;
        case 'login':
        default:
          return <Login onLoginSuccess={handleLogin} showMessage={showMessage} />;
      }
    }
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        {/* Navigation for the app */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold d-flex align-items-center" href="#" onClick={() => setCurrentPage('home')}>
              <i className="bi bi-car-front-fill me-2 fs-4"></i>
              <span>RIDA</span>
            </a>
            <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${sidebarCollapsed ? '' : 'show'}`} id="navbarNav">
              <ul className="navbar-nav me-auto">
                {!user && (
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={() => setCurrentPage('home')}>
                      <i className="bi bi-house-door me-1"></i> Home
                    </button>
                  </li>
                )}
              </ul>
              <div className="d-flex align-items-center">
                {/* Theme toggle button */}
                <button className="btn btn-outline-light me-2" onClick={toggleTheme} title="Toggle theme">
                  <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                </button>
                
                {user ? (
                  // Dynamic navigation for logged-in users based on their userType
                  <>
                    {user.userType === 'admin' && (
                      <button
                        onClick={() => setCurrentPage('adminDashboard')}
                        className={`btn ${currentPage === 'adminDashboard' ? 'btn-light' : 'btn-outline-light'} me-2`}
                      >
                        <i className="bi bi-speedometer2 me-1"></i> Admin
                      </button>
                    )}
                    {user.userType === 'customer' && (
                      <>
                        <button
                          onClick={() => setCurrentPage('customerDashboard')}
                          className={`btn ${currentPage === 'customerDashboard' ? 'btn-light' : 'btn-outline-light'} me-2`}
                        >
                          <i className="bi bi-calendar-check me-1"></i> Book a Driver
                        </button>
                        <button
                          onClick={() => setCurrentPage('fareCalculator')}
                          className={`btn ${currentPage === 'fareCalculator' ? 'btn-light' : 'btn-outline-light'} me-2`}
                        >
                          <i className="bi bi-calculator me-1"></i> Fare Calculator
                        </button>
                      </>
                    )}
                    {user.userType === 'driver' && (
                      <button
                        onClick={() => setCurrentPage('driverDashboard')}
                        className={`btn ${currentPage === 'driverDashboard' ? 'btn-light' : 'btn-outline-light'} me-2`}
                      >
                        <i className="bi bi-list-task me-1"></i> My Assignments
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentPage('bookings')}
                      className={`btn ${currentPage === 'bookings' ? 'btn-light' : 'btn-outline-light'} me-2`}
                    >
                      <i className="bi bi-receipt me-1"></i> My Bookings
                    </button>
                    <button
                      onClick={() => setCurrentPage('reviews')}
                      className={`btn ${currentPage === 'reviews' ? 'btn-light' : 'btn-outline-light'} me-2`}
                    >
                      <i className="bi bi-star me-1"></i> Reviews
                    </button>
                    <div className="dropdown">
                      <button className="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-person-circle me-1"></i> {user.name}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                      </ul>
                    </div>
                  </>
                ) : (
                  // Navigation for logged-out users
                  <>
                    <button
                      onClick={() => setCurrentPage('login')}
                      className={`btn ${currentPage === 'login' ? 'btn-light' : 'btn-outline-light'} me-2`}
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Login
                    </button>
                    <button
                      onClick={() => setCurrentPage('register')}
                      className={`btn ${currentPage === 'register' ? 'btn-light' : 'btn-success'} me-2`}
                    >
                      <i className="bi bi-person-plus me-1"></i> Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container-fluid flex-grow-1">
          {renderPage()}
        </div>
        
        {/* Footer */}
        <footer className="bg-dark text-white py-4 mt-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-6 mb-4 mb-md-0">
                <h5><i className="bi bi-car-front-fill me-2"></i>RIDA</h5>
                <p>Your reliable ride booking service.</p>
              </div>
              <div className="col-md-3 mb-4 mb-md-0">
                <h5>Quick Links</h5>
                <ul className="list-unstyled">
                  <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('home')}>Home</button></li>
                  <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('login')}>Login</button></li>
                  <li><button className="btn btn-link text-white p-0" onClick={() => setCurrentPage('register')}>Register</button></li>
                </ul>
              </div>
              <div className="col-md-3">
                <h5>Contact Us</h5>
                <p><i className="bi bi-envelope me-2"></i> info@driverbooking.com</p>
                <p><i className="bi bi-telephone me-2"></i> +(250) 796359266</p>
              </div>
            </div>
            <hr className="bg-white" />
            <div className="text-center">
              <p className="mb-0">&copy; {new Date().getFullYear()} RIDA. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Message Modal */}
      {message.visible && createPortal(
        <div className={`toast show position-fixed bottom-0 end-0 m-3 ${message.type === 'success' ? 'bg-success' : message.type === 'error' ? 'bg-danger' : 'bg-secondary'}`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body text-white">
            {message.text}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ user, token, showMessage }) => {
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
        <div className="card shadow-sm">
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
                <div className="card border-0 shadow-sm h-100">
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
                <div className="card border-0 shadow-sm h-100">
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
                <div className="card border-0 shadow-sm h-100">
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
                <div className="card border-0 shadow-sm h-100">
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
                <div className="card border-0 shadow-sm">
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
                <div className="card border-0 shadow-sm">
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
          <div className="card border-0 shadow-sm">
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
          <div className="card border-0 shadow-sm">
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
          <div className="card border-0 shadow-sm">
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
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Reports & Analytics</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
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
                  <div className="card border-0 shadow-sm h-100">
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

// Homepage component
const HomePage = ({ setCurrentPage }) => {
  return (
    <div>
      {/* Hero Section */}
      <div className="jumbotron bg-primary text-white rounded-3 p-4 p-md-5 mb-5 text-center">
        <h1 className="display-4 fw-bold mb-4">Welcome to RIDA</h1>
        <p className="lead mb-4">Your Car. Our Driver. Your Comfort & Safety.</p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button 
            className="btn btn-light btn-lg fw-semibold"
            onClick={() => setCurrentPage('register')}
          >
            <i className="bi bi-person-plus me-2"></i> Sign Up Now
          </button>
          <button 
            className="btn btn-outline-light btn-lg fw-semibold"
            onClick={() => setCurrentPage('login')}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i> Login
          </button>
        </div>
      </div>
      
      {/* Who We Are Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Who We Are</h2>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-6 mb-4 mb-md-0">
                  <h3 className="card-title">Your Trusted Transportation Partner</h3>
                  <p className="card-text">
                    RIDA is a premier ride-booking service connecting customers with professional, 
                    vetted drivers.Since 2025, we have been committed to serve customers wether after After drinks or night events, in long trips, special events, Touristic rides and many more. Want to book your ride  ia advance? No problem! We offer both immediate and scheduled bookings to fit your needs. We've got you covered.
                  </p>
                  <p className="card-text">
                    We carefully screen all our drivers, ensuring they have clean driving records, 
                    professional experience, and excellent customer service skills. Our fleet consists of 
                    well-maintained, comfortable vehicles to make your journey pleasant.
                  </p>
                </div>
                <div className="col-md-6 text-center">
                  {/* Replaced image with car icon */}
                  <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
                    <i className="bi bi-car-front-fill text-primary" style={{fontSize: '8rem'}}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Ride With Us Section */}
      <div className="row mb-5">
      <div className="col-12">
        <h2 className="text-center mb-4">Why Ride With Us</h2>
        <div className="row g-4">
          {/* Card 1 */}
          <div className="col-6 col-md-3">
            <AnimatedCard delay={0.1}>
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-3">
                  <i className="bi bi-shield-check fs-1"></i>
                </div>
                <h4 className="card-title">Safety First</h4>
                <p className="card-text">All our drivers undergo thorough background checks and vehicle inspections to ensure your safety.</p>
              </div>
            </AnimatedCard>
          </div>
          {/* Card 2 */}
          <div className="col-6 col-md-3">
            <AnimatedCard delay={0.3}>
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-success mb-3">
                  <i className="bi bi-currency-dollar fs-1"></i>
                </div>
                <h4 className="card-title">Affordable Rates</h4>
                <p className="card-text">Competitive pricing with no hidden fees. Where •	Flat Fee (0–10km): 5,000 RWF
•	Within 50km: 250 RWF/km
•	Beyond 50km: 90 RWF/km
 </p>
              </div>
            </AnimatedCard>
          </div>
          {/* Card 3 */}
          <div className="col-6 col-md-3">
            <AnimatedCard delay={0.5}>
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-info mb-3">
                  <i className="bi bi-clock-history fs-1"></i>
                </div>
                <h4 className="card-title">24/7 Availability</h4>
                <p className="card-text">Our service is available round the clock. Book a ride anytime, anywhere with our easy-to-use Web-app.</p>
              </div>
            </AnimatedCard>
          </div>
          {/* Card 4 */}
          <div className="col-6 col-md-3">
            <AnimatedCard delay={0.7}>
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-warning mb-3">
                  <i className="bi bi-person-badge fs-1"></i>
                </div>
                <h4 className="card-title">Professional Drivers</h4>
                <p className="card-text">Experienced, courteous drivers who prioritize your comfort and punctuality.</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  
      {/* Testimonials Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">What Our Customers Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
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
                    "After a late night out, I don't worry anymore. I know I'll get home safely as if am with my car.""
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
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
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
                    "We used the service for a family trip outside Kigali. The driver was professional and the pricing was so clear.""
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
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
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
                    "The booking process is simple and straightforward.As a tourist, having a driver who also acted as a guide made all the difference."
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
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center py-5">
        <h2 className="mb-4">Ready to Experience the Best Ride Service?</h2>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button 
            className="btn btn-primary btn-lg fw-semibold"
            onClick={() => setCurrentPage('register')}
          >
            <i className="bi bi-person-plus me-2"></i> Join Now
          </button>
          <button 
            className="btn btn-outline-primary btn-lg fw-semibold"
            onClick={() => setCurrentPage('login')}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
          </button>
        </div>
      </div>
    </div>
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

// Customer Dashboard Component - Fixed with single payment method
const CustomerDashboard = ({ user, token, showMessage }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [bookedDriverId, setBookedDriverId] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  
  // Fixed payment method state to use the exact format backend expects
  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    scheduledTime: '',
    bookingType: 'hourly',
    durationValue: 1,
    durationUnit: 'hours',
    paymentMethod: "MomoPay Code 123456" // Only payment method allowed by backend
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
        setError(null); // Clear any previous errors
        showMessage('No drivers are currently available in your area.', 'info');
      } else if (Array.isArray(data)) {
        // If data is an array of drivers, use it
        console.log('Found drivers array:', data.length);
        setDrivers(data);
        setError(null);
      } else if (data.drivers && Array.isArray(data.drivers)) {
        // If data has a drivers property that's an array, use it
        console.log('Found drivers in data.drivers:', data.drivers.length);
        setDrivers(data.drivers);
        setError(null);
      } else {
        // Fallback: unexpected response format
        console.log('Unexpected response format:', data);
        setDrivers([]);
        setError('Unable to load drivers. Please try again.');
        showMessage('Unable to load drivers. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setDrivers([]); // Set empty array on error
      
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
  
  useEffect(() => {
    // Fetch a list of available drivers on component mount
    fetchDrivers();
  }, [showMessage]);
  
  // Handle booking form input changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open booking form for a specific driver
  const handleBookDriver = (driver) => {
    setSelectedDriver(driver);
    setShowBookingForm(true);
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
      
      // Calculate pricing based on driver's rate and booking duration
      const hourlyRate = selectedDriver.pricing.hourlyRate;
      const durationValue = parseInt(bookingData.durationValue);
      
      // Convert duration to hours based on the unit
      let hours;
      switch (bookingData.durationUnit) {
        case 'hours':
          hours = durationValue;
          break;
        case 'days':
          hours = durationValue * 24;
          break;
        case 'weeks':
          hours = durationValue * 24 * 7;
          break;
        case 'months':
          hours = durationValue * 24 * 30; // Approximation
          break;
        default:
          hours = durationValue;
      }
      
      // Calculate base amount and total amount
      const baseAmount = hours * hourlyRate;
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
        bookingType: bookingData.bookingType,
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
        notes: bookingData.notes || ''
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
      
      // Reset form
      setBookingData({
        pickupAddress: '',
        dropoffAddress: '',
        scheduledTime: '',
        bookingType: 'hourly',
        durationValue: 1,
        durationUnit: 'hours',
        paymentMethod: "MomoPay Code 123456" // Reset to the only allowed payment method
      });
      
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
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading drivers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className="h3 fw-bold">Welcome, {user.name}!</h2>
          <p className="text-muted">Find and book a driver for your next trip.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary" onClick={fetchDrivers}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button 
            className="btn btn-info text-white"
            onClick={() => setShowFareCalculator(!showFareCalculator)}
          >
            <i className="bi bi-calculator me-1"></i> 
            {showFareCalculator ? 'Hide' : 'Show'} Calculator
          </button>
        </div>
      </div>
      
      {/* Fare Calculator - shown when showFareCalculator is true */}
      {showFareCalculator && (
        <div className="card border-0 shadow-sm mb-4">
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
                    />
                    <button 
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
                    >
                      Calculate
                    </button>
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
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="alert alert-warning text-center mb-4" role="alert">
          <h5 className="alert-heading">Service Unavailable</h5>
          <p className="mb-3">{error}</p>
          <button 
            onClick={handleRetry} 
            className="btn btn-outline-primary"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Drivers List */}
      <div className="row g-4">
        {drivers.length > 0 ? (
          drivers.map(driver => (
            <div key={driver._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title">{driver.user.name}</h5>
                      <span className={`badge ${driver.availability?.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                        {driver.availability?.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="text-warning">
                      <i className="bi bi-star-fill"></i> {driver.ratings?.average?.toFixed(1) || '5.0'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-1">
                      <i className="bi bi-car-front me-1"></i> 
                      {driver.vehicle?.make} {driver.vehicle?.model} ({driver.vehicle?.color})
                    </p>
                    <p className="text-muted mb-0">
                      <i className="bi bi-currency-dollar me-1"></i> 
                      ${driver.pricing?.hourlyRate || '25'}/hour
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleBookDriver(driver)}
                    className="btn btn-primary w-100"
                    disabled={isBookingInProgress && bookedDriverId === driver._id || !driver.availability?.isAvailable}
                  >
                    {isBookingInProgress && bookedDriverId === driver._id ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Only show "No drivers available" if there's no error
          !error && (
            <div className="col-12">
              <div className="text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-car-front text-muted" style={{fontSize: '4rem'}}></i>
                </div>
                <h4 className="text-muted mb-3">No Drivers Available</h4>
                <p className="text-muted">There are currently no drivers available in your area. Please check back later.</p>
                <button 
                  onClick={handleRetry} 
                  className="btn btn-outline-primary mt-3"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
            </div>
          )
        )}
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedDriver && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Book Driver: {selectedDriver.user.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowBookingForm(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Pickup Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="pickupAddress"
                      value={bookingData.pickupAddress}
                      onChange={handleBookingInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pickup Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      name="scheduledTime"
                      value={bookingData.scheduledTime}
                      onChange={handleBookingInputChange}
                      min={new Date().toISOString().slice(0, 16)} // Set min to current date/time
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dropoff Address (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="dropoffAddress"
                      value={bookingData.dropoffAddress}
                      onChange={handleBookingInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Booking Type</label>
                    <select 
                      className="form-select" 
                      name="bookingType"
                      value={bookingData.bookingType}
                      onChange={handleBookingInputChange}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Duration</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="durationValue"
                        value={bookingData.durationValue}
                        onChange={handleBookingInputChange}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Unit</label>
                      <select 
                        className="form-select" 
                        name="durationUnit"
                        value={bookingData.durationUnit}
                        onChange={handleBookingInputChange}
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="paymentMethod"
                      value={bookingData.paymentMethod}
                      readOnly
                    />
                    <small className="text-muted">Payment method is fixed to MomoPay Code 123456</small>
                  </div>
                  <div>
                    <h6>If you want to know how much you will pay, use our fare calculator:
                      <button 
                        type="button"
                        className="btn btn-sm btn-info ms-2"
                        onClick={() => setShowFareCalculator(true)}
                      >
                        <i className="bi bi-calculator"></i> Open Calculator
                      </button>
                    </h6>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Close</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={submitBooking}
                  disabled={isBookingInProgress}
                >
                  {isBookingInProgress ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Driver Dashboard Component - Updated with availability toggle
const DriverDashboard = ({ user, token, showMessage }) => {
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
              <div className="card border-0 shadow-sm h-100">
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
const BookingList = ({ user, token, showMessage }) => {
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
  }, [token, showMessage]);
  
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
              <div className="card border-0 shadow-sm h-100">
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
const ReviewsPage = ({ user, token, showMessage }) => {
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
              <div className="card border-0 shadow-sm h-100">
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
                    <div className="mt-3 p-3 bg-light rounded-3">
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
const Login = ({ onLoginSuccess, showMessage }) => {
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
      <div className="bg-white p-4 p-md-5 rounded-3 shadow-sm w-100" style={{maxWidth: '24rem'}}>
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
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Registration form component
const Register = ({ onRegisterSuccess, showMessage }) => {
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
      color: '', // Added color field
    },
    pricing: {
      hourlyRate: 0,
    },
    bio: '',
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
          licensePlate: formData.vehicle.licensePlate.trim().toUpperCase(), // plate
          color: formData.vehicle.color Normalize license.trim(),
        };
        payload.pricing = formData.pricing;
        payload.bio = formData.bio.trim();
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
    <div className="container p-4 p-md-5 bg-light rounded-3 shadow">
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
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">User Type</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="form-select rounded-3"
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
            
            {/* Vehicle Information Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted">Vehicle Information</h5>
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
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-3">
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
                    style={{ textTransform: 'uppercase' }}
                    required
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
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-4">Pricing</h5>
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
              />
            </div>
            
            {/* Bio Section */}
            <div className="form-group">
              <label className="form-label fw-semibold">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control rounded-3"
                rows="3"
                placeholder="Tell customers about your driving experience and what makes you a great driver..."
                required
              ></textarea>
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default App;
