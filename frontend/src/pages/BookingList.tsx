import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NotificationContext } from '../contexts/NotificationContext';

// Define the booking list props type
interface BookingListProps {
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

// Define the booking type
interface Booking {
  _id: string;
  scheduledTime: string;
  pickupLocation?: {
    address: string;
  };
  dropoffLocation?: {
    address: string;
  };
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  driver?: {
    user?: {
      name: string;
    };
    vehicle?: {
      make?: string;
      model?: string;
      licensePlate?: string;
    };
  };
  reviewed?: boolean;
  // Add other booking fields as needed
}

// Define the review modal props type
interface ReviewModalProps {
  showReviewModal: boolean;
  selectedBooking: Booking | null;
  onClose: () => void;
  onSubmitReview: (rating: number, comment: string) => void;
  theme: 'light' | 'dark';
}

// Review Modal component
const ReviewModal = ({ showReviewModal, selectedBooking, onClose, onSubmitReview, theme }: ReviewModalProps) => {
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
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      onSubmitReview(rating, comment);
    }
  };

  if (!showReviewModal || !selectedBooking) {
    return null;
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="modal-header">
            <h5 className="modal-title">Review Your Ride</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form id="reviewForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">How would you rate your experience?</label>
                <div className="rating d-flex justify-content-center mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <label key={star} className="me-2">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        className="btn-check"
                        autocomplete="off"
                        checked={rating === star}
                        onChange={() => setRating(star)}
                      />
                      <label className={`btn btn-outline-primary btn-sm ${rating === star ? 'active' : ''}`} htmlFor={`star-${star}`}>
                        {star}
                      </label>
                    </label>
                  ))}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">What did you like most?</label>
                  <textarea
                    className="form-control"
                    id="comment"
                    rows="3"
                    placeholder="Share what made your ride great..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={rating === 0 || !comment.trim()}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// BookingList component
const BookingList = ({ user, token, showMessage, theme }: BookingListProps) => {
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
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

          throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('BookingList: Raw data:', data);

        // Handle different response formats
        let bookingsArray: Booking[] = [];
        if (Array.isArray(data)) {
          bookingsArray = data;
        } else if (data.bookings && Array.isArray(data.bookings)) {
          bookingsArray = data.bookings;
        } else if (data.data && Array.isArray(data.data)) {
          bookingsArray = data.data;
        }

        setBookings(bookingsArray);
        console.log('BookingList: Set bookings to:', bookingsArray);
      } catch (err: any) {
        console.error('BookingList: Error fetching bookings:', err);
        showMessage('Failed to load bookings. Please try again.', 'error');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token, showMessage]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          rating,
          comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit review');
      }

      showMessage('Review submitted successfully!', 'success');
      setShowReviewModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      showMessage(`Failed to submit review: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted h5">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold">My Bookings</h2>
        {user.userType === 'customer' && (
          <motion.button
            onClick={() => showMessage('Feature coming soon!', 'info')}
            className="btn btn-outline-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book New Ride
          </motion.button>
        )}
      </div>

      {bookings.length > 0 ? (
        <div className="row g-4">
          {bookings.map((booking, index) => (
            <div key={booking._id} className="col-12">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-2">Booking #{index + 1}</h5>
                      <p className="text-muted mb-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        {new Date(booking.scheduledTime).toLocaleDateString()} at {new Date(booking.scheduledTime).toLocaleTimeString()}
                      </p>
                      {booking.pickupLocation?.address && (
                        <p className="text-muted mb-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          From: {booking.pickupLocation.address}
                        </p>
                      )}
                      {booking.dropoffLocation?.address && (
                        <p className="text-muted mb-1">
                          <i className="bi bi-arrow-right me-1"></i>
                          To: {booking.dropoffLocation.address}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <span className={`badge rounded-pill ${booking.status === 'completed' ? 'bg-success' : booking.status === 'accepted' ? 'bg-primary' : booking.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {booking.driver && (
                    <div className="mt-3 p-3 border rounded" style={{ backgroundColor: colors.light }}>
                      <h6 className="mb-2">Your Driver</h6>
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          <i className="bi bi-person-circle fs-4" style={{ color: colors.primary }}></i>
                        </div>
                        <div>
                          <h6 className="mb-1">{booking.driver.user?.name || 'Unknown Driver'}</h6>
                          <p className="mb-1 text-muted small">
                            {booking.driver.vehicle?.make && booking.driver.vehicle?.model ? `${booking.driver.vehicle.make} ${booking.driver.vehicle.model}` : 'Vehicle info not available'}
                          </p>
                          {booking.driver.vehicle?.licensePlate && (
                            <p className="mb-0 text-muted small">
                              Plate: {booking.driver.vehicle.licensePlate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!booking.reviewed && booking.status === 'completed' && (
                    <div className="mt-3">
                      <motion.button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewModal(true);
                        }}
                        className="btn btn-outline-primary btn-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add a Review
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-bookmark text-muted" style={{fontSize: '4rem'}}></i>
          </div>
          <h4 className="text-muted mb-3">No Bookings Yet</h4>
          <p className="text-muted">
            You haven't made any bookings yet. Start by booking your first ride!
          </p>
          {user.userType === 'customer' && (
            <div className="mt-4">
              <motion.button
                onClick={() => showMessage('Feature coming soon!', 'info')}
                className="btn btn-outline-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your First Ride
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        showReviewModal={showReviewModal}
        selectedBooking={selectedBooking}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedBooking(null);
        }}
        onSubmitReview={handleReviewSubmit}
        theme={theme}
      />
    </div>
  );
};

export default BookingList;