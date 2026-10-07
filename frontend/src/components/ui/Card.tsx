import React from 'react';
import { motion } from 'framer-motion';

// Define the card props type
interface CardProps {
  children: React.ReactNode;
  className?: string;
  bodyClass?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: React.ReactNode;
  imageTop?: boolean;
  bordered?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  [key: string]: any; // For other props
}

// Card component
const Card = ({
  children,
  className = '',
  bodyClass = '',
  header = null,
  footer = null,
  title = null,
  subtitle = null,
  image = null,
  imageTop = false,
  bordered = false,
  shadow = false,
  rounded = true,
  ...props
}: CardProps) => {
  // Base classes
  const baseClasses = `
    border-0
    ${shadow ? 'shadow-sm' : ''}
    ${bordered ? 'border' : ''}
    ${rounded ? 'rounded' : 'rounded-0'}
  `;

  return (
    <motion.div
      className={`card ${baseClasses.trim()} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      {...props}
    >
      {image && imageTop && (
        <div className="card-img-top">
          {image}
        </div>
      )}

      {((title || subtitle || header) && !imageTop) || image && !imageTop ? (
        <div className="card-header">
          {title && (
            <div className="card-title h5 mb-1">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="card-subtitle mb-2 text-muted">
              {subtitle}
            </div>
          )}
          {header && (
            <div className="card-header-text">
              {header}
            </div>
          )}
        </div>
      ) : null}

      {!imageTop && image ? (
        <div className="card-img-top">
          {image}
        </div>
      ) : null}

      <div className={`card-body ${bodyClass}`}>
        {children}
      </div>

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;