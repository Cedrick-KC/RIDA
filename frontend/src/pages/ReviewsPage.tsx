import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NotificationContext } from '../contexts/NotificationContext';
import AnalyticsChart from '../components/widgets/AnalyticsChart';

// Define the reviews page props type
interface ReviewsPageProps {
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

// Define the review type
interface Review {
  _id: string;
  customer?: {
    name: string;
  };
  rating: number; // 1-5
  comment?: string;
  response?: string;
  createdAt: string;
  updatedAt?: string;
  bookingId?: string;
  // Add other review fields as needed
}

// Define the filters type
interface Filters {
  rating: string;
  sortBy: string;
}

// Define the rating stats type
interface RatingStats {
  average: string;
  total: number;
  distribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

// ReviewsPage component
const ReviewsPage = ({ user, token, showMessage, theme }: ReviewsPageProps) => {
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (filters.rating) params.append('rating', filters.rating);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch reviews');
        }

        const data = await response.json();
        const reviewsArray = Array.isArray(data) ? data : (data.reviews || []);
        setReviews(reviewsArray);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        showMessage('Failed to load reviews', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, showMessage, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

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

  if (error) {
    return (
      <div className="alert alert-danger text-center p-4">
        <h5>Error loading reviews</h5>
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

  // Calculate rating statistics
  const ratingStats: RatingStats = {
    average: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    total: reviews.length,
    distribution: Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const count = reviews.filter(r => r.rating === rating).length;
      return {
        rating: rating,
        count: count,
        percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
      };
    })
  };

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold">Customer Reviews</h2>
        <div>
          <motion.button
            onClick={() => showMessage('Add review feature coming soon!', 'info')}
            className="btn btn-outline-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Write a Review
          </motion.button>
        </div>
      </div>

      {/* Rating Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body text-center p-4">
              <div className="display-4 fw-bold text-primary">{ratingStats.average}</div>
              <p className="mb-0">Average Rating</p>
              <div className="rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`bi bi-star-fill ${star <= parseFloat(ratingStats.average) ? 'text-warning' : 'text-muted'}`}></span>
                ))}
              </div>
              <p className="text-muted small mt-2">{ratingStats.total} reviews</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-4">
              <h5 className="card-title">Rating Distribution</h5>
              <div className="mb-3">
                {ratingStats.distribution.map(item => (
                  <div key={item.rating} className="d-flex align-items-center mb-2">
                    <div className="me-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`bi bi-star-fill ${star <= item.rating ? 'text-warning' : 'text-muted'}`} style={{fontSize: '0.8rem'}}></span>
                      ))}
                    </div>
                    <div className="flex-grow-1">
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="ms-2 text-muted small">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-4">
              <h5 className="card-title">Recent Trends</h5>
              <div className="chart-container">
                <AnalyticsChart
                  type="line"
                  data={Array.from({ length: 6 }, (_, i) => ({
                    name: `Week ${i + 1}`,
                    value: Math.floor(Math.random() * 20)
                  }))}
                  title="Reviews per Week"
                  height={120}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-4">
              <h5 className="card-title">Response Rate</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Responses to Reviews</span>
                <span className="fw-bold">85%</span>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div className="progress-bar bg-info" role="progressbar" style={{ width: '85%' }}></div>
              </div>
              <p className="mt-2 text-muted small">Average response time: 2.4 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text">Filter by Rating</span>
            <select className="form-select" name="rating" onChange={handleFilterChange}>
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Stars {'⭐'.repeat(rating)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text">Sort By</span>
            <select className="form-select" name="sortBy" onChange={handleSortChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <motion.button
            onClick={() => {
              setFilters({ rating: '', sortBy: 'newest' });
            }}
            className="btn btn-outline-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Filters
          </motion.button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="row g-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={review._id} className="col-12">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        {review.customer?.name || 'Anonymous'}
                        <span className="ms-2 badge bg-light text-dark fs-6">
                          {'⭐'.repeat(review.rating)}
                        </span>
                      </h6>
                      <p className="text-muted mb-1 small">
                        <i className="bi bi-calendar-check me-1"></i>
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                      {review.bookingId && (
                        <p className="mb-0 text-muted small">
                          <i className="bi bi-journal-text me-1"></i>
                          Booking #{review.bookingId?.toString().substring(0, 6)}...
                        </p>
                      )}
                    </div>
                    {review.response && (
                      <div className="text-center">
                        <div className="badge bg-info text-white p-2">
                          Responded
                        </div>
                      </div>
                    )}
                  </div>

                  {review.comment && (
                    <div className="mt-3 p-3 border rounded" style={{ backgroundColor: colors.light }}>
                      <h6 className="mb-1">Review</h6>
                      <p className="mb-0">{review.comment}</p>
                    </div>
                  )}

                  {review.response && (
                    <div className="mt-3 p-3 border rounded" style={{ backgroundColor: colors.light }}>
                      <h6 className="mb-1">Management Response</h6>
                      <p className="mb-0">{review.response}</p>
                      <p className="text-muted small mt-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        {new Date(review.updatedAt).toLocaleString()}
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
              <i className="bi bi-star text-muted" style={{fontSize: '4rem'}}></i>
              <h4 className="text-muted mb-3">No Reviews Yet</h4>
              <p className="text-muted">Be the first to review our service!</p>
              {user.userType === 'customer' && (
                <div className="mt-4">
                  <motion.button
                    onClick={() => showMessage('Write a review feature coming soon!', 'info')}
                    className="btn btn-outline-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Share Your Experience
                  </motion.button>
                </div>
              )}
            </div>
          }
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;