import React, { createContext, useContext, useState } from 'react';

// Define the map context type
interface MapContextType {
  mapInstance: any;
  setMapInstance: (map: any) => void;
  markers: any[];
  setMarkers: (markers: any[]) => void;
  routes: any[];
  setRoutes: (routes: any[]) => void;
  currentLocation: any;
  setCurrentLocation: (location: any) => void;
  isMapLoading: boolean;
  setIsMapLoading: (loading: boolean) => void;
  mapError: any;
  setMapError: (error: any) => void;
}

// Create Map context
const MapContext = createContext<MapContextType | undefined>(undefined);

// Map provider component
export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [mapError, setMapError] = useState<any>(null);

  // Context value
  const value = {
    mapInstance,
    setMapInstance,
    markers,
    setMarkers,
    routes,
    setRoutes,
    currentLocation,
    setCurrentLocation,
    isMapLoading,
    setIsMapLoading,
    mapError,
    setMapError
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

// Custom hook to use map context
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export default MapContext;