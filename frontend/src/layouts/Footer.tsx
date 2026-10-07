import { motion } from 'framer-motion';
import { useState } from 'react';

// Define the footer props type
interface FooterProps {
  setCurrentPage: (pageName: string) => void;
  theme: 'light' | 'dark';
}

// Enhanced Footer
const Footer = ({ setCurrentPage, theme }: FooterProps) => {
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
    <motion.footer
      className="py-4 mt-auto"
      style={{ backgroundColor: colors.dark, color: colors.light }}
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
            <p><i className="bi bi-envelope me-2"></i> helpline@ridaapp.com</p>
            <p><i className="bi bi-telephone me-2"></i> +(250) 789543687</p>
          </div>
        </div>
        <hr className="bg-white bg-opacity-25" />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} RIDA. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;