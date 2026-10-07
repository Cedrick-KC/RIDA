import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortal } from '@uidotdev/usehooks';

// Define the modal props type
interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  scrollable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  className?: string;
  [key: string]: any; // For other props
}

// Modal component
const Modal = ({
  children,
  isOpen,
  onClose,
  title = null,
  size = 'md',
  centered = true,
  scrollable = false,
  backdrop = true,
  keyboard = true,
  className = '',
  ...props
}: ModalProps) => {
  // Handle escape key to close
  useEffect(() => {
    if (!isOpen || !keyboard) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, keyboard, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (backdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  if (!isOpen) return null;

  // Create portal if hook is available, otherwise render directly
  const Portal = usePortal ? usePortal(() => document.body) : ({ children }) => <>{children}</>;

  return (
    <Portal>
      <motion.div
        className={`modal fade show d-block ${className}`}
        tabIndex="-1"
        aria-modal="true"
        role="dialog"
        style={{ display: 'block' }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className={`modal-dialog modal-dialog-${centered ? 'centered' : ''} ${sizeClasses[size]} ${scrollable ? 'modal-dialog-scrollable' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {title && (
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Portal>
  );
};

export default Modal;