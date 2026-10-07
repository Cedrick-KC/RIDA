import React from 'react';
import { motion } from 'framer-motion';

// Define the driver card props type
interface DriverCardProps {
  driver: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      profilePicture?: string;
    };
    vehicle?: {
      make?: string;
      model?: string;
      year?: number;
      licensePlate?: string;
      color?: string;
    };
    yearsOfExperience?: number;
    rating?: number;
    isAvailable?: boolean;
  };
  onSelect?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
  className?: string;
}

// DriverCard component
const DriverCard = ({
  driver,
  onSelect,
  onCall,
  onMessage,
  showActions = true,
  className = ''
}: DriverCardProps) => {
  if (!driver) return null;

  const { user, vehicle, yearsOfExperience, rating, isAvailable } = driver;

  return (
    <motion.div
      className={`card border-0 shadow-sm h-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-1">
              {user?.name || 'Unknown Driver'}
              {isAvailable && (
                <span className="ms-2 badge bg-success fs-6">Available</span>
              )}
              {!isAvailable && (
                <span className="ms-2 badge bg-secondary fs-6">Busy</span>
              )}
            </h6>
            <p className="mb-1 text-muted small">
              <i className="bi bi-star-fill me-1 text-warning"></i>
              {(rating || 0).toFixed(1)} / 5.0
            </p>
            <p className="mb-0 text-muted small">
              <i className="bi bi-person-mechanic me-1"></i>
              {yearsOfExperience || 0}+ years experience
            </p>
          </div>
          {showActions && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCall?.();
                }}
                title="Call Driver"
              >
                <i className="bi bi-telephone"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
                title="Message Driver"
              >
                <i className="bi bi-chat-left-dots"></i>
              </button>
            </div>
          )}
        </div>

        {vehicle && (
          <div className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
            <h6 className="mb-2">Vehicle Info</h6>
            <p className="mb-1">
              <i className="bi bi-car-front me-1"></i>
              {(vehicle.make || '')} {(vehicle.model || '')} {(vehicle.year ? `(${vehicle.year})` : '')}
            </p>
            {vehicle.licensePlate && (
              <p className="mb-1">
                <i className="bi bi-tag me-1"></i>
                Plate: {vehicle.licensePlate}
              </p>
            )}
            {vehicle.color && (
              <p className="mb-0">
                <i className="bi bi-dropper me-1"></i>
                Color: {vehicle.color}
              </p>
            )}
          </div>
        )}

        <div className="d-grid gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            View Full Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverCard;