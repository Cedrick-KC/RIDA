import React from 'react';
import { motion } from 'framer-motion';

// Define the input props type
interface InputProps {
  type?: string;
  label?: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  className?: string;
  inputClass?: string;
  helpText?: React.ReactNode;
  error?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClear?: boolean;
  [key: string]: any; // For other props
}

// Input component
const Input = ({
  type = 'text',
  label = null,
  placeholder = '',
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  min = null,
  max = null,
  step = null,
  minLength = null,
  maxLength = null,
  pattern = null,
  className = '',
  inputClass = '',
  helpText = null,
  error = null,
  leftIcon = null,
  rightIcon = null,
  showClear = false,
  ...props
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
  };

  const handleClear = () => {
    if (onChange) onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <motion.div
      className={`mb-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {label && (
        <label className={`form-label fw-semibold ${error ? 'text-danger' : ''}`}>
          {label}
          {required && (
            <span className="text-danger">*</span>
          )}
        </label>
      )}

      <div className="input-group">
        {leftIcon && (
          <span className="input-group-text">
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          className={`form-control ${inputClass} ${error ? 'is-invalid' : ''} ${showClear && value ? 'pe-4' : ''}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          {...props}
        />

        {showClear && value && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y"
            style={{ right: '8px' }}
            onClick={handleClear}
            aria-label="Clear input"
          >
            <i className="bi bi-x"></i>
          </button>
        )}

        {rightIcon && (
          <span className="input-group-text">
            {rightIcon}
          </span>
        )}
      </div>

      {helpText && (
        <div className="form-text mt-1">
          {helpText}
        </div>
      )}

      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default Input;