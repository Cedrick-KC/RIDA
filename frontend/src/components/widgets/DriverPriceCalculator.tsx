import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define the driver price calculator props type
interface DriverPriceCalculatorProps {
  driver: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      profilePicture?: string;
    };
    yearsOfExperience?: number;
    rating?: number;
  };
  bookingDetails: {
    vehicleType?: string;
    days: number;
    distance: number;
    waitingTime: number;
  };
  onCalculate?: (price: any) => void;
  className?: string;
};

// Define the calculated price type
interface CalculatedPrice {
  base: number;
  days: number;
  distance: number;
  waiting: number;
  experienceAdjustment: number;
  ratingAdjustment: number;
  subtotal: number;
  total: number;
  currency: string;
}

// DriverPriceCalculator component
const DriverPriceCalculator = ({
  driver,
  bookingDetails,
  onCalculate,
  className = ''
}: DriverPriceCalculatorProps) => {
  const [calculatedPrice, setCalculatedPrice] = useState<CalculatedPrice | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driver && bookingDetails) {
      calculatePrice();
    }
  }, [driver, bookingDetails]);

  const calculatePrice = async () => {
    if (!driver || !bookingDetails) return;

    setIsCalculating(true);
    setError(null);

    try {
      // Simulate API call
      // In real implementation, this would call the backend
      const baseRate = 15000; // Base rate for first day in RWF
      const additionalDayRate = 10000; // Rate per additional day
      const vehicleTypeMultiplier = {
        standard: 1.0,
        suv: 1.5,
        luxury: 2.0,
        van: 1.3,
        electric: 1.8
      };

      const { vehicleType, days, distance, waitingTime } = bookingDetails;
      const multiplier = vehicleTypeMultiplier[vehicleType] || 1.0;

      let totalPrice = baseRate; // First day

      // Additional days
      if (days > 1) {
        totalPrice += (days - 1) * additionalDayRate * multiplier;
      }

      // Distance charge (if applicable)
      if (distance > 0) {
        const distanceRate = 500; // RWF per km
        totalPrice += distance * distanceRate * multiplier;
      }

      // Waiting time charge
      if (waitingTime > 0) {
        const waitingRate = 200; // RWF per minute
        totalPrice += waitingTime * waitingRate * multiplier;
      }

      // Apply experience discount/premium
      const experience = driver.yearsOfExperience || 0;
      let experienceAdjustment = 0;
      if (experience >= 5) {
        experienceAdjustment = -0.05; // 5% discount for experienced drivers
      } else if (experience >= 2) {
        experienceAdjustment = 0; // No adjustment
      } else {
        experienceAdjustment = 0.05; // 5% premium for new drivers
      }

      totalPrice = totalPrice * (1 + experienceAdjustment);

      // Apply rating adjustment
      const rating = driver.rating || 0;
      let ratingAdjustment = 0;
      if (rating >= 4.8) {
        ratingAdjustment = -0.03; // 3% discount for excellent ratings
      } else if (rating >= 4.5) {
        ratingAdjustment = -0.01; // 1% discount for good ratings
      } else if (rating < 3.5) {
        ratingAdjustment = 0.05; // 5% premium for low ratings (to incentivize improvement)
      }

      totalPrice = totalPrice * (1 + ratingAdjustment);

      // Round to nearest 1000 RWF
      const roundedPrice = Math.round(totalPrice / 1000) * 1000;

      const priceData: CalculatedPrice = {
        base: baseRate,
        days: days > 1 ? (days - 1) * additionalDayRate : 0,
        distance: distance > 0 ? distance * 500 : 0,
        waiting: waitingTime > 0 ? waitingTime * 200 : 0,
        experienceAdjustment,
        ratingAdjustment,
        subtotal: totalPrice,
        total: roundedPrice,
        currency: 'RWF'
      };

      setCalculatedPrice(priceData);

      if (onCalculate) {
        onCalculate(priceData);
      }
    } catch (err: any) {
      console.error('Error calculating price:', err);
      setError('Failed to calculate price. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  if (!driver && !bookingDetails) {
    return (
      <motion.div
        className={`card border-0 shadow-sm h-100 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-body text-center p-4">
          <div className="mb-3">
            <i className="bi bi-calculator text-muted" style={{fontSize: '3rem'}}></i>
          </div>
          <h5 className="card-title text-muted">Price Calculator</h5>
          <p className="text-muted">
            Select a driver and booking details to calculate the price.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card border-0 shadow-sm h-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <h5 className="card-title mb-0">Price Calculation</h5>
      </div>
      <div className="card-body p-4">
        {isCalculating ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Calculating...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : calculatedPrice ? (
          <>
            <div className="mb-4">
              <h6>Driver: {driver.user?.name || 'Unknown'}</h6>
              <p className="text-muted small mb-1">
                <i className="bi bi-person-mechanic me-1"></i>
                {driver.yearsOfExperience || 0}+ years experience
              </p>
              <p className="text-muted small mb-0">
                <i className="bi bi-star-fill me-1 text-warning"></i>
                {(driver.rating || 0).toFixed(1)} / 5.0 rating
              </p>
            </div>

            <div className="mb-3">
              <h6>Booking Details</h6>
              <div className="small">
                <div className="mb-1">
                  <span className="me-2">Duration:</span>
                  <span>{bookingDetails.days} day{bookingDetails.days !== 1 ? 's' : ''}</span>
                </div>
                {bookingDetails.distance > 0 && (
                  <div className="mb-1">
                    <span className="me-2">Distance:</span>
                    <span>{bookingDetails.distance} km</span>
                  </div>
                )}
                {bookingDetails.waitingTime > 0 && (
                  <div className="mb-1">
                    <span className="me-2">Waiting Time:</span>
                    <span>{bookingDetails.waitingTime} minutes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-top pt-3">
              <h6>Price Breakdown</h6>
              <div className="mt-3">
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span>Base Rate (1st day)</span>
                  <span>₨{calculatedPrice.base.toLocaleString()}</span>
                </div>
                {calculatedPrice.days > 0 && (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Additional Days</span>
                    <span>₨{calculatedPrice.days.toLocaleString()}</span>
                  </div>
                )}
                {calculatedPrice.distance > 0 && (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Distance Charge</span>
                    <span>₨{calculatedPrice.distance.toLocaleString()}</span>
                  </div>
                )}
                {calculatedPrice.waiting > 0 && (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Waiting Time</span>
                    <span>₨{calculatedPrice.waiting.toLocaleString()}</span>
                  </div>
                )}
                {calculatedPrice.experienceAdjustment !== 0 && (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Experience Adjustment</span>
                    <span>
                      {calculatedPrice.experienceAdjustment < 0 ? '-' : '+'}%
                      {Math.abs(calculatedPrice.experienceAdjustment * 100)}
                    </span>
                  </div>
                )}
                {calculatedPrice.ratingAdjustment !== 0 && (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Rating Adjustment</span>
                    <span>
                      {calculatedPrice.ratingAdjustment < 0 ? '-' : '+'}%
                      {Math.abs(calculatedPrice.ratingAdjustment * 100)}
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between pt-3 border-top">
                <h5>Total Estimated Price</h5>
                <h5 className="text-success">₨{calculatedPrice.total.toLocaleString()}</h5>
              </div>

              <div className="mt-3 text-center">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    // In real implementation, this might initiate booking
                  }}
                >
                  Proceed to Booking
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <h5 className="text-muted">Ready to calculate price</h5>
              <p className="text-muted small">
                Please ensure driver and booking details are provided.
              </p>
            </div>
          )}
      </div>
    </motion.div>
  );
};

export default DriverPriceCalculator;