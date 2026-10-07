import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useApi } from './useApi';

// Define the map marker type
interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title?: string;
  element?: any;
  data?: Record<string, any>;
}

// Define the map route type
interface MapRoute {
  id: string;
  path: Array<{ lat: number; lng: number }>;
  options?: Record<string, any>;
  data?: Record<string, any>;
}

// Define the map geocoding response type
interface GeocodingResponse {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formatted_address?: string;
  accuracy?: string;
}

// Define the map directions response type
interface DirectionsResponse {
  waypoints: Array<{ lat: number; lng: number }>;
  routes: Array<{
    distance: number; // meters
    duration: number; // seconds
    path: Array<{ lat: number; lng: number }>;
    instructions: string[];
  }>;
}

// Define the map hook return type
interface MapReturnType {
  // State
  map: any;
  markers: MapMarker[];
  routes: MapRoute[];
  isMapLoaded: boolean;
  mapError: string | null;
  mapType: 'mapbox' | 'google';

  // Actions
  initializeMap: (options?: Record<string, any>) => Promise<boolean>;
  addMarker: (markerOptions: Omit<MapMarker, 'id'>) => MapMarker | null;
  removeMarker: (markerId: string) => boolean;
  clearMarkers: () => boolean;
  addRoute: (routeOptions: Omit<MapRoute, 'id'>) => MapRoute | null;
  removeRoute: (routeId: string) => boolean;
  clearRoutes: () => boolean;
  geocodeAddress: (address: string) => Promise<GeocodingResponse | null>;
  calculateRoute: (waypoints: Array<{ lat: number; lng: number }>, options?: Record<string, any>) => Promise<DirectionsResponse | null>;
  getCurrentLocation: () => Promise<{ lat: number; lng: number; accuracy: number } | null>;
  watchPosition: (callback: (location: { lat: number; lng: number; accuracy: number }) => void, options?: PositionOptions) => number | null;
  clearWatch: (watchId: number) => void;
  fitToMarkers: () => boolean;
  setMapType: (type: 'mapbox' | 'google') => void;
}

// Custom hook for map services (Mapbox/Google Maps abstraction)
const useMap = (): MapReturnType => {
  const { isAuthenticated } = useAuth();
  const { get, post } = useApi();

  // Map state
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapType, setMapTypeState] = useState<'mapbox' | 'google'>('mapbox'); // or 'google'

  // Refs
  const mapContainerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const routesRef = useRef<any[]>([]);

  // Initialize map
  const initializeMap = useCallback(async (options: Record<string, any> = {}): Promise<boolean> => {
    if (!isAuthenticated) {
      setMapError('Authentication required for map services');
      return false;
    }

    try {
      // Check if we should use Mapbox or Google Maps
      // This could be based on config, user preference, or availability
      const useMapbox = mapType === 'mapbox'; // Use the current mapType state

      if (useMapbox) {
        await initializeMapbox(options);
      } else {
        await initializeGoogleMaps(options);
      }

      setIsMapLoaded(true);
      return true;
    } catch (err: any) {
      setMapError(`Failed to initialize map: ${err.message}`);
      return false;
    }
  }, [isAuthenticated, mapType]);

  // Initialize Mapbox map
  const initializeMapbox = useCallback(async (options: Record<string, any> = {}): Promise<void> => {
    // In a real implementation, this would load Mapbox GL JS
    // For now, we'll simulate the initialization

    // Simulate loading Mapbox
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a mock map object
    const mockMap = {
      // Mapbox-like API
      setCenter: (center: { lat: number; lng: number }) => { /* ... */ },
      setZoom: (zoom: number) => { /* ... */ },
      addLayer: (layer: any) => { /* ... */ },
      removeLayer: (layerId: string) => { /* ... */ },
      addSource: (source: any) => { /* ... */ },
      removeSource: (sourceId: string) => { /* ... */ },
      fitBounds: (bounds: any) => { /* ... */ },
      getBounds: () => { /* ... */ },
      // Event handling
      on: (event: string, callback: (...args: any[]) => void) => { /* ... */ },
      off: (event: string, callback: (...args: any[]) => void) => { /* ... */ },
      // Geocoding
      geocode: async (query: string) => { /* ... */ },
      // Directions
      getDirections: async (waypoints: Array<{ lat: number; lng: number }>) => { /* ... */ }
    };

    setMap(mockMap);
    return mockMap;
  }, []);

  // Initialize Google Maps
  const initializeGoogleMaps = useCallback(async (options: Record<string, any> = {}): Promise<void> => {
    // In a real implementation, this would load Google Maps JS API
    // For now, we'll simulate the initialization

    // Simulate loading Google Maps
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a mock map object
    const mockMap = {
      // Google Maps-like API
      setCenter: (center: { lat: number; lng: number }) => { /* ... */ },
      setZoom: (zoom: number) => { /* ... */ },
      addMarker: (markerOptions: any) => { /* ... */ },
      removeMarker: (marker: any) => { /* ... */ },
      addPolyline: (polylineOptions: any) => { /* ... */ },
      removePolyline: (polyline: any) => { /* ... */ },
      fitBounds: (bounds: any) => { /* ... */ },
      getBounds: () => { /* ... */ },
      // Event handling
      addListener: (event: string, callback: (...args: any[]) => void) => { /* ... */ },
      removeListener: (event: string, listener: (...args: any[]) => void) => { /* ... */ },
      // Geocoding
      geocode: async (query: string) => { /* ... */ },
      // Directions
      getDirections: async (request: any) => { /* ... */ }
    };

    setMap(mockMap);
    return mockMap;
  }, []);

  // Add marker to map
  const addMarker = useCallback((markerOptions: Omit<MapMarker, 'id'>): MapMarker | null => {
    if (!map) {
      setMapError('Map not initialized');
      return null;
    }

    try {
      // Create marker
      const marker: MapMarker = {
        id: markerOptions.id || Date.now().toString(),
        position: markerOptions.position,
        title: markerOptions.title,
        element: markerOptions.element,
        data: markerOptions.data || {}
      };

      // Add to state
      setMarkers(prev => [...prev, marker]);

      // In real implementation: add to actual map
      // map.addMarker(marker);

      return marker;
    } catch (err: any) {
      setMapError(`Failed to add marker: ${err.message}`);
      return null;
    }
  }, [map]);

  // Remove marker from map
  const removeMarker = useCallback((markerId: string): boolean => {
    if (!map) {
      setMapError('Map not initialized');
      return false;
    }

    try {
      // Remove from state
      setMarkers(prev => prev.filter(marker => marker.id !== markerId));

      // In real implementation: remove from actual map
      // map.removeMarker(markerId);

      return true;
    } catch (err: any) {
      setMapError(`Failed to remove marker: ${err.message}`);
      return false;
    }
  }, [map]);

  // Add route to map
  const addRoute = useCallback((routeOptions: Omit<MapRoute, 'id'>): MapRoute | null => {
    if (!map) {
      setMapError('Map not initialized');
      return null;
    }

    try {
      // Create route
      const route: MapRoute = {
        id: routeOptions.id || Date.now().toString(),
        path: routeOptions.path,
        options: routeOptions.options || {},
        data: routeOptions.data || {}
      };

      // Add to state
      setRoutes(prev => [...prev, route]);

      // In real implementation: add to actual map
      // map.addRoute(route);

      return route;
    } catch (err: any) {
      setMapError(`Failed to add route: ${err.message}`);
      return null;
    }
  }, [map]);

  // Remove route from map
  const removeRoute = useCallback((routeId: string): boolean => {
    if (!map) {
      setMapError('Map not initialized');
      return false;
    }

    try {
      // Remove from state
      setRoutes(prev => prev.filter(route => route.id !== routeId));

      // In real implementation: remove from actual map
      // map.removeRoute(routeId);

      return true;
    } catch (err: any) {
      setMapError(`Failed to remove route: ${err.message}`);
      return false;
    }
  }, [map]);

  // Clear all markers
  const clearMarkers = useCallback((): boolean => {
    if (!map) {
      setMapError('Map not initialized');
      return false;
    }

    try {
      setMarkers([]);

      // In real implementation: clear all markers from map
      // map.clearMarkers();

      return true;
    } catch (err: any) {
      setMapError(`Failed to clear markers: ${err.message}`);
      return false;
    }
  }, [map]);

  // Clear all routes
  const clearRoutes = useCallback((): boolean => {
    if (!map) {
      setMapError('Map not initialized');
      return false;
    }

    try {
      setRoutes([]);

      // In real implementation: clear all routes from map
      // map.clearRoutes();

      return true;
    } catch (err: any) {
      setMapError(`Failed to clear routes: ${err.message}`);
      return false;
    }
  }, [map]);

  // Geocode address to coordinates
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResponse | null> => {
    if (!isAuthenticated) {
      setMapError('Authentication required');
      return null;
    }

    try {
      // In real implementation, this would call the map service's geocoding API
      // For now, we'll simulate with a backend call or mock data

      // Try backend first
      try {
        const response = await post('/api/map/geocode', { address });
        return response as GeocodingResponse;
      } catch (backendErr) {
        // Fallback to mock data for demo
        // In reality, you'd use Mapbox Geocoding API or Google Maps Geocoding API
        const mockResponse: GeocodingResponse = {
          address,
          coordinates: {
            lat: -1.95 + (Math.random() - 0.5) * 0.1, // Around Kigali
            lng: 30.06 + (Math.random() - 0.5) * 0.1
          },
          formatted_address: address,
          accuracy: 'rooftop'
        };
        return mockResponse;
      }
    } catch (err: any) {
      setMapError(`Geocoding failed: ${err.message}`);
      return null;
    }
  }, [isAuthenticated, post]);

  // Calculate route between points
  const calculateRoute = useCallback(async (waypoints: Array<{ lat: number; lng: number }>, options: Record<string, any> = {}): Promise<DirectionsResponse | null> => {
    if (!isAuthenticated) {
      setMapError('Authentication required');
      return null;
    }

    try {
      // In real implementation, this would call the map service's directions API
      try {
        const response = await post('/api/map/directions', {
          waypoints,
          options
        });
        return response as DirectionsResponse;
      } catch (backendErr) {
        // Fallback to mock data for demo
        const mockResponse: DirectionsResponse = {
          waypoints,
          routes: [{
            distance: Math.floor(Math.random() * 20000), // meters
            duration: Math.floor(Math.random() * 3600), // seconds
            path: waypoints.map(wp => ({
              lat: wp.lat || -1.95 + (Math.random() - 0.5) * 0.1,
              lng: wp.lng || 30.06 + (Math.random() - 0.5) * 0.1
            })),
            instructions: waypoints.map((wp, index) =>
              index === 0 ? 'Start' : `Continue to waypoint ${index}`
            )
          }]
        };
        return mockResponse;
      }
    } catch (err: any) {
      setMapError(`Route calculation failed: ${err.message}`);
      return null;
    }
  }, [isAuthenticated, post]);

  // Get user's current location
  const getCurrentLocation = useCallback(async (): Promise<{ lat: number; lng: number; accuracy: number } | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setMapError('Geolocation not supported');
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setMapError(`Geolocation failed: ${error.message}`);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Watch user's position
  const watchPosition = useCallback((callback: (location: { lat: number; lng: number; accuracy: number }) => void, options: PositionOptions = {}): number | null => {
    if (!navigator.geolocation) {
      setMapError('Geolocation not supported');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        setMapError(`Geolocation watch failed: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        ...options
      }
    );

    return watchId;
  }, []);

  // Clear watch
  const clearWatch = useCallback((watchId: number) => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Fit map to show all markers
  const fitToMarkers = useCallback((): boolean => {
    if (!map || markers.length === 0) return false;

    try {
      // In real implementation: calculate bounds and fit map
      // const bounds = calculateBoundsFromMarkers(markers);
      // map.fitBounds(bounds);

      return true;
    } catch (err: any) {
      setMapError(`Failed to fit map to markers: ${err.message}`);
      return false;
    }
  }, [map, markers]);

  return {
    // State
    map,
    markers,
    routes,
    isMapLoaded,
    mapError,
    mapType,

    // Actions
    initializeMap,
    addMarker,
    removeMarker,
    clearMarkers,
    addRoute,
    removeRoute,
    clearRoutes,
    geocodeAddress,
    calculateRoute,
    getCurrentLocation,
    watchPosition,
    clearWatch,
    fitToMarkers,
    setMapType: setMapTypeState
  };
};

export default useMap;