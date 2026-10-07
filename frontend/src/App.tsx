import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MapProvider } from './contexts/MapContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { PageLayout } from './layouts/PageLayout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingList from './pages/BookingList';
import ReviewsPage from './pages/ReviewsPage';
import FareCalculatorPage from './pages/FareCalculatorPage';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme } = useTheme();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <MapProvider>
                <VoiceProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Navigate replace to="/login" />} />
                    <Route path="*" element={<Navigate replace to="/login" />} />
                  </Routes>
                </VoiceProvider>
              </MapProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <MapProvider>
              <VoiceProvider>
                <PageLayout theme={theme}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                      path="/"
                      element={user?.userType === 'admin' ? (
                        <Navigate replace to="/admin" />
                      ) : user?.userType === 'driver' ? (
                        <Navigate replace to="/driver" />
                      ) : (
                        <Navigate replace to="/customer" />
                      )}
                    />

                    {/* Customer routes */}
                    <Route
                      path="/customer"
                      element={
                        user?.userType === 'customer' || user?.userType === 'admin'
                          ? <CustomerDashboard user={user} />
                          : <Navigate replace to="/login" />
                      }
                    />

                    {/* Driver routes */}
                    <Route
                      path="/driver"
                      element={
                        (user?.userType === 'driver' || user?.userType === 'admin') &&
                          <DriverDashboard user={user} />
                      }
                    />

                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        user?.userType === 'admin'
                          ? <AdminDashboard user={user} />
                          : <Navigate replace to="/login" />
                      }
                    />

                    {/* Other protected routes */}
                    <Route
                      path="/bookings"
                      element={
                        user?.userType === 'customer' || user?.userType === 'admin'
                          ? <BookingList user={user} />
                          : <Navigate replace to="/login" />
                      }
                    />

                    <Route
                      path="/reviews"
                      element={
                        user?.userType === 'customer' || user?.userType === 'admin'
                          ? <ReviewsPage user={user} />
                          : <Navigate replace to="/login" />
                      }
                    />

                    <Route
                      path="/fare-calculator"
                      element={
                        user?.userType === 'customer' || user?.userType === 'admin'
                          ? <FareCalculatorPage user={user} />
                          : <Navigate replace to="/login" />
                      }
                    />

                    {/* Redirect all other paths to home */}
                    <Route path="*" element={<Navigate replace to="/" />} />
                  </Routes>
                </PageLayout>
              </VoiceProvider>
            </MapProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;