import React from 'react';
import { motion } from 'framer-motion';

// Define the form props type
interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  inline?: boolean;
  validated?: boolean;
  [key: string]: any; // For other props like method, etc.
}

// Form component
const Form = ({
  children,
  onSubmit,
  className = '',
  inline = false,
  validated = false,
  ...props
}: FormProps) => {
  return (
    <motion.form
      className={`form ${inline ? 'row g-3' : ''} ${className}`}
      onSubmit={(e) => {
        if (validated) {
          // Trigger HTML5 validation
          if (!e.target.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
        if (onSubmit) onSubmit(e);
      }}
      noValidate={!validated}
      {...props}
    >
      {children}
    </motion.form>
  );
};

export default Form;