import { useState } from 'react';
import { motion } from 'framer-motion';

// Define the nav button props type
interface NavButtonProps {
  icon: string;
  label: string;
  currentPage: string;
  setCurrentPage: (pageName: string) => void;
  pageName: string;
  variant?: string;
}

// NavButton component used exclusively within Navbar
const NavButton = ({ icon, label, currentPage, setCurrentPage, pageName, variant = "outline-light" }: NavButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCurrentPage(pageName)}
    className={`btn ${currentPage === pageName ? 'btn-light' : `btn-${variant}`}`}
  >
    <i className={`bi ${icon} me-1`}></i> {label}
  </motion.button>
);

// Define the navbar props type
interface NavbarProps {
  user: {
    userType: 'admin' | 'customer' | 'driver' | null;
    name: string;
  } | null;
  currentPage: string;
  setCurrentPage: (pageName: string) => void;
  handleLogout: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

// Enhanced Navbar with improved responsiveness
const Navbar = ({ user, currentPage, setCurrentPage, handleLogout, toggleTheme, theme, sidebarCollapsed, toggleSidebar }: NavbarProps) => {
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
                {/* Logout toggle button */}
                <motion.button
                  className="btn btn-outline-danger rounded-circle p-2"
                  onClick={handleLogout}
                  title="Logout"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-power"></i>
                </motion.button>
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

export default Navbar;