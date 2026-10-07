import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Define the driver tracking map props type
interface DriverTrackingMapProps {
  drivers?: Array<{
    _id?: string;
    user?: {
      name?: string;
    };
    availability?: {
      isAvailable?: boolean;
    };
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showDriverMarkers?: boolean;
  showRoutes?: boolean;
  onMarkerClick?: (driver: any) => void;
  className?: string;
}

// DriverTrackingMap component - Placeholder for actual map integration
const DriverTrackingMap = ({
  drivers = [],
  center = { lat: -1.95, lng: 30.06 }, // Default to Kigali, Rwanda
  zoom = 12,
  height = '400px',
  showDriverMarkers = true,
  showRoutes = true,
  onMarkerClick,
  className = ''
}: DriverTrackingMapProps) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Initialize map (placeholder - would integrate with Mapbox/Google Maps in real implementation)
  useEffect(() => {
    // In a real implementation, this would initialize Mapbox or Google Maps
    // For now, we'll simulate map readiness
    const initializeMap = () => {
      // Simulate map loading
      setTimeout(() => {
        setIsMapReady(true);
        // In real implementation: setMap(new mapboxgl.Map({ ... }));
      }, 500);
    };

    initializeMap();

    // Cleanup
    return () => {
      // In real implementation: if (map) map.remove();
      setMap(null);
      setIsMapReady(false);
    };
  }, [center, zoom]);

  // Update map when drivers change
  useEffect(() => {
    if (!isMapReady || !map) return;

    // In real implementation: update markers on map
    console.log('Updating map with drivers:', drivers);
  }, [drivers, isMapReady, map]);

  if (!isMapReady) {
    return (
      <motion.div
        className={`position-relative ${className}`}
        style={{ width: '100%', height: height }}
      >
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading map...</span>
          </div>
          <p className="mt-2 mb-0">Loading map...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`position-relative ${className}`}
      style={{ width: '100%', height: height }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Map container */}
      <div ref={mapRef} id="driver-tracking-map" style={{ width: '100%', height: '100%' }}>

        {/* Map content would go here in real implementation */}
        {isMapReady && (
          <div className="position-absolute top-0 start-0 w-100 h-100">
            {/* Map visualization */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              opacity: 0.7
            }}></div>

            {/* Center marker */}
            <div className="position-absolute top-50 start-50 translate-middle" style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#0056b3',
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 0 0 2px rgba(0, 86, 179, 0.5)',
              animation: 'pulse 2s infinite'
            }}></div>

            {/* Driver markers */}
            {showDriverMarkers && drivers.map((driver, index) => {
              // Simulate random positions around center for demo
              const offsetLat = (Math.random() - 0.5) * 0.05;
              const offsetLng = (Math.random() - 0.5) * 0.05;

              // Convert lat/lng to pixel positions (simplified)
              const posX = 50 + (offsetLng * 100); // Rough conversion
              const posY = 50 - (offsetLat * 100); // Rough conversion

              return (
                <motion.div
                  key={driver._id || index}
                  className="position-absolute"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: `translate(-50%, -50%)`
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onMarkerClick?.(driver)}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-success text-white rounded-circle p-2">
                      {driver.user?.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Info panel */}
            <div className="position-absolute bottom-0 start-0 w-100 p-3">
              <div className="bg-white bg-opacity-75 rounded p-3 shadow-sm">
                <h6 className="mb-2">Active Drivers: {drivers.length}</h6>
                {drivers.length > 0 && (
                  <div className="small">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Available:</span>
                      <span className="text-success">
                        {drivers.filter(d => d.availability?.isAvailable).length}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>On Trip:</span>
                      <span className="text-primary">
                        {drivers.filter(d => !d.availability?.isAvailable).length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Map controls */}
        <div className="position-absolute top-0 end-0 m-3">
          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              title="Zoom In"
            >
              <i className="bi bi-zoom-in"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              title="Zoom Out"
            >
              <i className="bi bi-zoom-out"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              title="Center Map"
            >
              <i className="bi bi-crosshair"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverTrackingMap;