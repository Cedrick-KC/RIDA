import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Define the vehicle showroom props type
interface VehicleShowroomProps {
  vehicle: {
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    type?: string;
  };
  onSelectColor?: (color: string) => void;
  onSelectWheel?: (wheel: any) => void;
  onInteriorView?: (showInterior: boolean) => void;
  className?: string;
}

// VehicleShowroom component - Placeholder for 3D vehicle visualization
const VehicleShowroom = ({
  vehicle,
  onSelectColor,
  onSelectWheel,
  onInteriorView,
  className = ''
}: VehicleShowroomProps) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [viewAngle, setViewAngle] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('#0056b3');
  const [showInterior, setShowInterior] = useState<boolean>(false);
  const containerRef = useRef<any>(null);

  // Available colors for the vehicle
  const availableColors: string[] = [
    '#0056b3', // Blue
    '#28a745', // Green
    '#dc3545', // Red
    '#ffc107', // Yellow
    '#6f42c1', // Purple
    '#20c997', // Teal
    '#fd7e1e', // Orange
    '#6c757d'  // Gray
  ];

  // Available wheel styles
  interface WheelStyle {
    name: string;
    icon: string;
  }

  const wheelStyles: WheelStyle[] = [
    { name: 'Standard', icon: 'bi bi-speedometer2' },
    { name: 'Sport', icon: 'bi bi-gear' },
    { name: 'Luxury', icon: 'bi bi-gem' },
    { name: 'Off-road', icon: 'bi bi-truck' }
  ];

  useEffect(() => {
    // Start auto-rotation when component mounts
    const spinInterval = setInterval(() => {
      setViewAngle(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(spinInterval);
  }, []);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onSelectColor?.(color);
  };

  const handleWheelSelect = (wheel: WheelStyle) => {
    onSelectWheel?.(wheel);
  };

  const handleInteriorToggle = () => {
    setShowInterior(!showInterior);
    onInteriorView?.(showInterior);
  };

  return (
    <motion.div
      className={`position-relative ${className}`}
      style={{ width: '100%', height: '100%' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Vehicle container */}
      <div ref={containerRef} className="vehicle-showroom-container" style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Vehicle visualization placeholder */}
        <div className="vehicle-visualization" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '60%',
          height: '60%',
          transform: `translate(-50%, -50%) rotateY(${viewAngle}deg)`,
          background: `linear-gradient(45deg, ${selectedColor}33, ${selectedColor}1a)`,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `2px solid ${selectedColor}66`,
          backdropFilter: 'blur(10px)'
        }}>
          {/* Vehicle body */}
          <div className="vehicle-body" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '80%',
            height: '40%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: selectedColor,
            borderRadius: '30% 30% 10% 10%',
            boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.2)'
          }}>
            {/* Windows */}
            <div className="vehicle-windows" style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              width: '70%',
              height: '50%',
              transform: 'translate(-50%, 0)',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
              borderRadius: '15px'
            }}>
              {/* Window divider */}
              <div className="window-divider" style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '2px',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                transform: 'translateX(-50%)'
              }}></div>
            </div>

            {/* Wheels */}
            <div className="vehicle-wheels" style={{
              position: 'absolute',
              bottom: '-10%',
              left: '0',
              width: '100%',
              height: '20%',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="wheel" style={{
                  width: '25%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}>
                  <div className="wheel-rim" style={{
                    width: '60%',
                    height: '60%',
                    backgroundColor: '#343a40',
                    borderRadius: '50%',
                    border: `3px solid ${selectedColor}`,
                    animation: 'spin 2s linear infinite'
                  }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Interior view toggle */}
          {showInterior && (
            <div className="vehicle-interior" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: '50%',
              transform: 'translate(-50%, -50%) rotateX(180deg)',
              background: 'linear-gradient(45deg, #6f42c133, #6f42c10a)',
              borderRadius: '15px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
            }}>
              <div className="interior-seats" style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                width: '80%',
                height: '50%',
                transform: 'translate(-50%, 0)',
                background: 'linear-gradient(to bottom, #212529, #495057)',
                borderRadius: '10px'
              }}>
                {/* Seat details */}
                <div className="seat-detail" style={{
                  position: 'absolute',
                  top: '20%',
                  left: '50%',
                  width: '70%',
                  height: '60%',
                  transform: 'translate(-50%, 0)',
                  background: 'linear-gradient(45deg, #495057, #6c757d)',
                  borderRadius: '8px'
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle info overlay */}
        <div className="vehicle-info-overlay" style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '1.5rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          color: 'white'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                {vehicle?.make || 'Vehicle'} {vehicle?.model || 'Model'}
              </h6>
              <p className="mb-0 small">
                {vehicle?.year || '2024'} • {vehicle?.type || 'SUV'}
              </p>
            </div>
            <div className="text-end">
              <small>
                {vehicle?.price?.toLocaleString() || '₨2,500,000'}
              </small>
            </div>
          </div>
        </div>

        {/* Controls overlay */}
        <div className="vehicle-controls-overlay" style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setIsSpinning(!isSpinning)}
              title={isSpinning ? 'Stop Rotation' : 'Start Rotation'}
            >
              {isSpinning ? <i className="bi bi-pause"></i> : <i className="bi bi-play"></i>}
            </button>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setViewAngle(0)}
              title="Reset View"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-palette"></i> Color
            </button>
            <ul className="dropdown-menu dropdown-menu-dark">
              {availableColors.map(color => (
                <li key={color}>
                  <button
                    type="button"
                    className={`dropdown-item d-flex align-items-center p-2 ${color === selectedColor ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorSelect(color);
                    }}
                  >
                    <div
                      className="me-2"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color,
                        borderRadius: '50%',
                        border: `2px ${color === selectedColor ? 'solid white' : 'none'}`
                      }}
                    ></div>
                    <span>{color}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action buttons */}
        <div className="vehicle-action-buttons" style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handleInteriorToggle}
            title={showInterior ? 'Exterior View' : 'Interior View'}
          >
            {showInterior ? <i className="bi bi-arrows-angle-contract"></i> : <i className="bi bi-arrows-angle-expand"></i>}
          </button>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => {
              // In real implementation, this might AR preview or 360 view
            }}
            title="AR Preview"
          >
            <i className="bi bi-globe"></i>
          </button>
        </div>
      </div>

      {/* Side panel for detailed controls */}
      <div className="vehicle-control-panel" style={{
        position: 'absolute',
        top: '0',
        right: '-300px',
        width: '280px',
        height: '100%',
        background: 'linear-gradient(to left, #ffffff, #f8f9fa)',
        borderLeft: '1px solid #dee2e6',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease'
      }}>
        {/* Panel header */}
        <div className="panel-header" style={{
          padding: '1.5rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 className="mb-0">Vehicle Customizer</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              // Close panel
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Panel content */}
        <div className="panel-body p-3">
          {/* Color selector */}
          <div className="mb-4">
            <h6 className="mb-2">Exterior Color</h6>
            <div className="d-flex flex-wrap gap-2">
              {availableColors.map(color => (
                <div
                  key={color}
                  className={`color-option p-1 border rounded ${color === selectedColor ? 'border-2 border-primary' : ''}`}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleColorSelect(color)}
                >
                  {color === selectedColor && (
                    <div className="position-absolute top-0 start-100 translate-middle">
                      <i className="bi bi-check text-white" style={{fontSize: '0.75rem'}}></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wheel selector */}
          <div className="mb-4">
            <h6 className="mb-2">Wheel Style</h6>
            <div className="d-flex flex-wrap gap-2">
              {wheelStyles.map((wheel, index) => (
                <div
                  key={index}
                  className="option-item p-2 border rounded d-flex flex-column align-items-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleWheelSelect(wheel)}
                >
                  <div className="mb-2" style={{
                    width: '36px';
                    height: '36px';
                    backgroundColor: '#f8f9fa';
                    borderRadius: '50%',
                    display: 'flex';
                    alignItems: 'center';
                    justifyContent: 'center';
                  }}>
                    <i className={wheel.icon} style={{fontSize: '1.25rem', color: '#6c757d'}}></i>
                  </div>
                  <small className="text-center">{wheel.name}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Interior options */}
          <div className="mb-4">
            <h6 className="mb-2">Interior Package</h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="leatherSeats"
                checked={false}
              />
              <label className="form-check-label" for="leatherSeats">
                Leather Seats (+₨150,000)
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="sunroof"
                checked={false}
              />
              <label className="form-check-label" for="sunroof">
                Panoramic Sunroof (+₨200,000)
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="premiumSound"
                checked={false}
              />
              <label className="form-check-label" for="premiumSound">
                Premium Sound System (+₨100,000)
              </label>
            </div>
          </div>

          {/* Price summary */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-3">Price Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Base Price:</span>
              <span>₨{vehicle?.price?.toLocaleString() || '2,500,000'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Options:</span>
              <span id="options-price">₨0</span>
            </div>
            <div className="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span id="total-price">₨2,500,000</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleShowroom;