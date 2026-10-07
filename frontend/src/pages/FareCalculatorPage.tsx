import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NotificationContext } from '../contexts/NotificationContext';
import DriverPriceCalculator from '../components/widgets/DriverPriceCalculator';

// Define the fare calculator page props type
interface FareCalculatorPageProps {
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

// Define the fare estimate type
interface FareEstimate {
  baseFare: number;
  distance?: number;
  ratePerKm?: number;
  time?: number;
  waitingFee?: number;
  surcharges?: Array<{
    name: string;
    amount: number;
  }>;
  totalFare: number;
}

// Define the form data type
interface FormData {
  pickup: string;
  dropoff: string;
  vehicleType: string;
  date: string;
  time: string;
  returnTrip: boolean;
}

// FareCalculatorPage component
const FareCalculatorPage = ({ user, token, showMessage, theme }: FareCalculatorPageProps) => {
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
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pickup: '',
    dropoff: '',
    vehicleType: 'standard',
    date: '',
    time: '',
    returnTrip: false
  });

  useEffect(() => {
    // Fetch initial data or set defaults
    const initializeForm = async () => {
      try {
        // In a real app, we might fetch vehicle types, default locations, etc.
        // For now, we'll just set some defaults
        setFormData(prev => ({
          ...prev,
          date: new Date().toISOString().split('T')[0], // Today's date
          time: new Date().toTimeString().slice(0, 5) // Current time (HH:MM)
        }));
      } catch (err: any) {
        console.error('Error initializing form:', err);
      }
    };

    initializeForm();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.pickup || !formData.dropoff) {
      showMessage('Please enter both pickup and dropoff locations', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call API to calculate fare
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fare/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          vehicleType: formData.vehicleType,
          date: formData.date,
          time: formData.time,
          returnTrip: formData.returnTrip
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to calculate fare');
      }

      const data = await response.json();
      setFareEstimate(data);

      // Show success message
      showMessage('Fare calculated successfully!', 'success');
    } catch (err: any) {
      console.error('Error calculating fare:', err);
      setError('Failed to calculate fare. Please try again later.');
      showMessage('Failed to calculate fare', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pickup: '',
      dropoff: '',
      vehicleType: 'standard',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      returnTrip: false
    });
    setFareEstimate(null);
  };

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold">Fare Calculator</h2>
        <div>
          {fareEstimate && (
            <motion.button
              onClick={() => {
                // In a real app, this might copy to clipboard or share
                showMessage('Fare estimate copied to clipboard!', 'success');
              }}
              className="btn btn-outline-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Share Estimate
            </motion.button>
          )}
        </div>
      </div>

      {/* Fare Estimate Result */}
      {fareEstimate && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body p-5">
                <h4 className="mb-4">Your Fare Estimate</h4>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="fw-bold">Base Fare</h3>
                    <p className="text-muted mb-0">Standard rate</p>
                  </div>
                  <div className="text-center">
                    <h2 className="fw-bold text-primary">₨{fareEstimate.baseFare.toLocaleString()}</h2>
                  </div>
                </div>

                {fareEstimate.distance && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6>Distance</h6>
                      <p className="text-muted mb-0">{fareEstimate.distance} km</p>
                    </div>
                    <div className="text-end">
                      <h6>Rate/km</h6>
                      <p className="text-muted mb-0">₨{fareEstimate.ratePerKm}</p>
                    </div>
                  )
                )}

                {fareEstimate.time && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6>Estimated Time</h6>
                      <p className="text-muted mb-0">{fareEstimate.time} mins</p>
                    </div>
                    <div className="text-end">
                      <h6>Waiting Time</h6>
                      <p className="text-muted mb-0">₨{fareEstimate.waitingFee}</p>
                    </div>
                  )
                )}

                {fareEstimate.surcharges && fareEstimate.surcharges.length > 0 && (
                  <div className="mb-4">
                    <h6 className="mb-3">Additional Charges</h6>
                    <div className="list-group">
                      {fareEstimate.surcharges.map((surcharge, index) => (
                        <div key={index} className="list-item d-flex justify-content-between align-items-center p-2 border-bottom">
                          <span>{surcharge.name}</span>
                          <span className="text-muted">₨{surcharge.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}

                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <div>
                    <h5>Total Estimated Fare</h5>
                  </div>
                  <div className="text-end">
                    <h3 className="fw-bold text-success">₨{fareEstimate.totalFare.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="mt-4">
                  <motion.button
                    onClick={resetForm}
                    className="btn btn-outline-secondary w-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Calculate Another Fare
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Form */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div class="mb-3">
                      <label className="form-label fw-semibold">Pickup Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pickup"
                        value={formData.pickup}
                        onChange={handleInputChange}
                        placeholder="Enter pickup address or location"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div class="mb-3">
                      <label className="form-label fw-semibold">Dropoff Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="dropoff"
                        value={formData.dropoff}
                        onChange={handleInputChange}
                        placeholder="Enter dropoff address or location"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div class="mb-3">
                      <label className="form-label fw-semibold">Vehicle Type</label>
                      <select
                        className="form-select"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="standard">Standard Car</option>
                        <option value="suv">SUV</option>
                        <option value="luxury">Luxury</option>
                        <option value="van">Van (7+ seats)</option>
                        <option value="electric">Electric Vehicle</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div class="row g-2">
                      <div className="col-6">
                        <div class="mb-3">
                          <label className="form-label fw-semibold">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div class="mb-3">
                          <label className="form-label fw-semibold">Time</label>
                          <input
                            type="time"
                            className="form-control"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="returnTrip"
                        checked={formData.returnTrip}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Return Trip Required</label>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary ${loading ? 'opacity-75' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? 'Calculating...' : 'Calculate Fare'}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      {!fareEstimate && (
        <div className="row g-4 mt-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-map text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="card-title mb-3">Accurate Pricing</h5>
                <p className="text-muted">
                  Our fare calculation uses real-time traffic data, distance, and time estimates to provide the most accurate pricing.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-clock-history text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="card-title mb-3">Transparent Rates</h5>
                <p className="text-muted">
                  See exactly how your fare is calculated with no hidden fees or surprise charges.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-shield-lock text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="card-title mb-3">Secure Booking</h5>
                <p className="text-muted">
                  All transactions are encrypted and secure. Your payment information is protected.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-headset text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="card-title mb-3">24/7 Support</h5>
                <p className="text-muted">
                  Need help? Our customer support team is available around the clock to assist you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FareCalculatorPage;