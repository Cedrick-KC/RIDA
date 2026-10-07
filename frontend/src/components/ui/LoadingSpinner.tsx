import React from 'react';
import { motion } from 'framer-motion';

// Define the loading spinner props type
interface LoadingSpinnerProps {
  size?: string;
  color?: string;
  label?: string;
  className?: string;
}

// LoadingSpinner component
const LoadingSpinner = ({
  size = '3rem',
  color = '#0056b3',
  label = 'Loading...',
  className = ''
}: LoadingSpinnerProps) => {
  return (
    <motion.div
      className={`d-flex flex-column align-items-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="spinner-border" role="status" style={{
        width: size,
        height: size,
        borderWidth: '3px',
        borderColor: color
      }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {label && (
        <div className="mt-2">
          <p className="mb-0 text-muted small">{label}</p>
        </div>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;