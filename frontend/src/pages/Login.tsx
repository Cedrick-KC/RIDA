import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define the login props type
interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  showMessage: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  theme: 'light' | 'dark';
}

// Login form component
const Login = ({ onLoginSuccess, showMessage, theme }: LoginProps) => {
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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (err: any) {
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

export default Login;