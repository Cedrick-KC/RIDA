import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NotificationContext } from '../contexts/NotificationContext';

// Define the driver dashboard props type
interface DriverDashboardProps {
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

// Define the driver profile type
interface DriverProfile {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  availability: {
    isAvailable: boolean;
    lastUpdated: string;
  };
  bookingStats?: {
    currentlyInBooking: boolean;
    currentBooking?: {
      bookingId: string;
      endTime: string;
    };
    nextBooking?: {
      bookingId: string;
      startTime: string;
    };
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    earnings: number;
  };
  // Add other driver fields as needed
}

// Define the booking type
interface Booking {
  _id: string;
  customer: {
    name: string;
    // Add other customer fields as needed
  };
  pickupLocation?: {
    address: string;
  };
  scheduledTime?: string;
  bookingType: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  // Add other booking fields as needed
}

// DriverDashboard component
const DriverDashboard = ({ user, token, showMessage, theme }: DriverDashboardProps) => {
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState<boolean>(false);

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
      } catch (err: any) {
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
      } catch (err: any) {
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
    } catch (err: any) {
      console.error('Error updating availability:', err);
      showMessage(`Failed to update availability: ${err.message}`, 'error');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
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

      // Trigger notification based on status with browser notification
      if (status === 'accepted') {
        addNotification(
          'You have accepted the booking request. The customer has been notified.',
          'success',
          true // Enable browser notification
        );

        // If driver accepted a booking, update their availability to unavailable
        if (driverProfile) {
          setDriverProfile(prev => ({
            ...prev,
            availability: {
              ...prev.availability,
              isAvailable: false
            }
          }));
          showMessage('You are now marked as unavailable for new bookings', 'info');
        }
      } else if (status === 'cancelled') {
        addNotification(
          'You have declined the booking request. The customer has been notified.',
          'warning',
          true // Enable browser notification
        );
      }

      showMessage(`Booking status updated to ${status}`, 'success');
    } catch (err: any) {
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
              <div className="d-flex justify-content-center">
                {driverProfile && (
                  <>
                    <motion.button
                      onClick={toggleAvailability}
                      className={`btn ${driverProfile.availability.isAvailable ? 'btn-outline-danger' : 'btn-outline-success'} w-75`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {driverProfile.availability.isAvailable ? 'Go Unavailable' : 'Go Available'}
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          }
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;