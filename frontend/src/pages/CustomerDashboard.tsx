import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import DriverCard from '../components/widgets/DriverCard';
import AnimatedCard from '../components/ui/AnimatedCard';
import DriverTrackingMap from '../components/widgets/DriverTrackingMap';
import DriverPriceCalculator from '../components/widgets/DriverPriceCalculator';
import { NotificationContext } from '../contexts/NotificationContext';

// Define the customer dashboard props type
interface CustomerDashboardProps {
  user: {
    userType: 'admin' | 'customer' | 'driver';
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  token: string;
  showMessage: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  setCurrentPage: (pageName: string) => void;
  theme: 'light' | 'dark';
}

// Define the driver type based on what we expect from the API
interface Driver {
  _id: string;
  user: {
    name: string;
    email: string;
    // Add other user fields as needed
  };
  ageRange?: string;
  yearsOfExperience?: string;
  transmissionProficiency?: string;
  vehicleTypesComfortable?: string[];
  preferredServiceAreas?: string[];
  timeAvailability?: string;
  openToServices?: string[];
  languagesSpoken?: string[];
  vehicle?: {
    make?: string;
    model?: string;
    licensePlate?: string;
    color?: string;
  };
  // Add other driver fields as needed
}

// Define the booking data type
interface BookingData {
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: string;
  vehicleType: string;
  transmissionType: string;
  days: number;
  calculatedFare: number;
  durationValue: number;
  durationUnit: 'hours' | 'days' | 'weeks';
  language: string;
  paymentMethod: string;
}

// Define the filters type
interface Filters {
  ageRange: string;
  minExperience: string;
  transmission: string;
  vehicleType: string;
  serviceArea: string;
  timeAvailability: string;
  serviceType: string;
  language: string;
}

// Define the active booking type
interface ActiveBooking {
  _id: string;
  driverId: string;
  pickupLocation: {
    type: 'Point';
    coordinates: number[];
    address: string;
  };
  dropoffLocation?: {
    type: 'Point';
    coordinates: number[];
    address: string;
  };
  bookingType: string;
  duration: {
    value: number;
    unit: string;
  };
  scheduledTime: string;
  paymentMethod: string;
  pricing: {
    baseAmount: number;
    discount: number;
    tax: number;
    totalAmount: number;
  };
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Page transition configuration
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// CustomerDashboard component
const CustomerDashboard = ({ user, token, showMessage, setCurrentPage, theme }: CustomerDashboardProps) => {
  const themeColors = {
    light: {
      primary: '#0056b3',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      background: '#ffffff',
      text: '#212529',
      cardBg: '#ffffff',
      border: '#dee2e6'
    },
    dark: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#198754',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#0dcaf0',
      light: '#f8f9fa',
      dark: '#212529',
      background: '#121212',
      text: '#f8f9fa',
      cardBg: '#1e1e1e',
      border: '#343a40'
    }
  };

  const colors = themeColors[theme];
  const { addNotification } = useContext(NotificationContext);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState<boolean>(false);
  const [bookedDriverId, setBookedDriverId] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showFareCalculator, setShowFareCalculator] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fixed payment method state to use the exact format backend expects
  const [bookingData, setBookingData] = useState<BookingData>({
    pickupAddress: '',
    dropoffAddress: '',
    scheduledTime: '',
    vehicleType: '',
    transmissionType: '',
    days: 1, // Changed from distance to days
    calculatedFare: 15000, // Initial fare for 1 day
    durationValue: 1,
    durationUnit: 'hours',
    language: 'english',
    paymentMethod: "MomoPay Code 123456" // Only payment method allowed by backend
  });

  // Driver filter state
  const [filters, setFilters] = useState<Filters>({
    ageRange: '',
    minExperience: '',
    transmission: '',
    vehicleType: '',
    serviceArea: '',
    timeAvailability: '',
    serviceType: '',
    language: ''
  });

  // Voice control state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceCommand, setVoiceCommand] = useState<string>('');
  const [voiceRecognition, setVoiceRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceCommand(transcript);
        processVoiceCommand(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showMessage(`Voice recognition error: ${event.error}`, 'error');
      };

      setVoiceRecognition(recognition);
    } else {
      showMessage('Voice recognition not supported in this browser', 'warning');
    }
  }, [showMessage]);

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);

    // Simple voice command processing
    if (command.includes('book') || command.includes('reserve')) {
      // Extract driver name if mentioned
      // This is a simplified implementation - in a real app, you'd use NLP
      showMessage('I heard you want to book a ride. Please select a driver and tap the book button.', 'info');
    } else if (command.includes('cancel') || command.includes('stop')) {
      if (showBookingForm) {
        setShowBookingForm(false);
        setSelectedDriver(null);
        showMessage('Booking cancelled', 'info');
      }
    } else if (command.includes('refresh') || command.includes('update')) {
      fetchDrivers();
      showMessage('Refreshing driver list', 'info');
    } else if (command.includes('help')) {
      showMessage('Available voice commands: book, cancel, refresh, help', 'info');
    } else {
      // If we don't understand the command, ask for clarification
      if (command.trim() !== '') {
        showMessage(`I didn't understand: "${command}". Try saying "book", "cancel", "refresh", or "help".`, 'warning');
      }
    }
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (voiceRecognition) {
      try {
        voiceRecognition.start();
        setIsListening(true);
        showMessage('Listening...', 'info');
      } catch (err) {
        console.error('Error starting voice recognition:', err);
        showMessage('Error starting voice recognition', 'error');
      }
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (voiceRecognition) {
      try {
        voiceRecognition.stop();
        setIsListening(false);
      } catch (err) {
        console.error('Error stopping voice recognition:', err);
      }
    }
  };

  // Fetch available drivers
  const fetchDrivers = async () => {
    try {
      setError(null);
      console.log(`Fetching drivers from: ${process.env.REACT_APP_API_URL}/api/drivers/all-drivers`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/all-drivers`, {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Handle 404 - endpoint doesn't exist or server issues
      if (response.status === 404) {
        console.log('Drivers endpoint not found (404)');
        setDrivers([]);
        setFilteredDrivers([]);
        setError('The drivers service is currently unavailable. Please try again later.');
        showMessage('Drivers service temporarily unavailable.', 'error');
        return;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Drivers API response:', data);

      // Check if the response is the "no drivers found" message
      if (data.msg && data.msg.includes('No drivers found')) {
        console.log('No drivers found in database');
        setDrivers([]); // Set empty array so the UI shows "No drivers available"
        setFilteredDrivers([]);
        setError(null); // Clear any previous errors
        showMessage('No drivers are currently available in your area.', 'info');
      } else if (Array.isArray(data)) {
        // If data is an array of drivers, use it
        console.log('Found drivers array:', data.length);
        setDrivers(data);
        setFilteredDrivers(data);
        setError(null);
      } else if (data.drivers && Array.isArray(data.drivers)) {
        // If data has a drivers property that's an array, use it
        console.log('Found drivers in data.drivers:', data.drivers.length);
        setDrivers(data.drivers);
        setFilteredDrivers(data.drivers);
        setError(null);
      } else {
        // Fallback: unexpected response format
        console.log('Unexpected response format:', data);
        setDrivers([]);
        setFilteredDrivers([]);
        setError('Unable to load drivers. Please try again.');
        showMessage('Unable to load drivers. Please try again.', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching drivers:', err);
      setDrivers([]); // Set empty array on error
      setFilteredDrivers([]);

      // More specific error handling
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to the server. Please check if the backend is running.');
        showMessage('Cannot connect to server. Please try again later.', 'error');
      } else {
        setError('Failed to load drivers. Please try again.');
        showMessage('Failed to load drivers.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when drivers or filter criteria change
  useEffect(() => {
    if (drivers.length === 0) {
      setFilteredDrivers([]);
      return;
    }

    let result = [...drivers];

    // Apply age range filter
    if (filters.ageRange) {
      result = result.filter(driver =>
        driver.ageRange === filters.ageRange
      );
    }

    // Apply minimum experience filter
    if (filters.minExperience) {
      result = result.filter(driver => {
        const driverExp = parseInt(driver.yearsOfExperience || '0') || 0;
        const minExp = parseInt(filters.minExperience) || 0;
        return driverExp >= minExp;
      });
    }

    // Apply transmission proficiency filter
    if (filters.transmission) {
      result = result.filter(driver =>
        driver.transmissionProficiency === filters.transmission ||
        driver.transmissionProficiency === 'both'
      );
    }

    // Apply vehicle type filter
    if (filters.vehicleType) {
      result = result.filter(driver =>
        driver.vehicleTypesComfortable &&
        driver.vehicleTypesComfortable.includes(filters.vehicleType)
      );
    }

    // Apply service area filter
    if (filters.serviceArea) {
      result = result.filter(driver =>
        driver.preferredServiceAreas &&
        driver.preferredServiceAreas.includes(filters.serviceArea)
      );
    }

    // Apply time availability filter
    if (filters.timeAvailability) {
      result = result.filter(driver =>
        driver.timeAvailability === filters.timeAvailability ||
        driver.timeAvailability === 'flexible'
      );
    }

    // Apply service type filter
    if (filters.serviceType) {
      result = result.filter(driver =>
        driver.openToServices &&
        driver.openToServices.includes(filters.serviceType)
      );
    }

    // Apply language filter
    if (filters.language) {
      result = result.filter(driver =>
        driver.languagesSpoken &&
        driver.languagesSpoken.includes(filters.language)
      );
    }

    setFilteredDrivers(result);
  }, [drivers, filters]);

  // Handle filter input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      ageRange: '',
      minExperience: '',
      transmission: '',
      vehicleType: '',
      serviceArea: '',
      timeAvailability: '',
      serviceType: '',
      language: ''
    });
  };

  useEffect(() => {
    // Fetch a list of available drivers on component mount
    fetchDrivers();

    // Fetch active booking if exists
    const fetchActiveBooking = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setActiveBooking(data);
        }
      } catch (err) {
        console.error('Error fetching active booking:', err);
      }
    };

    fetchActiveBooking();
  }, [token, showMessage]);

  // Handle booking form input changes
  const handleBookingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate fare when days changes
    if (name === 'days') {
      const daysValue = parseInt(value) || 0;
      let fare = 0;

      if (daysValue === 1) {
        fare = 15000;
      } else {
        fare = daysValue * 10000;
      }

      setBookingData(prev => ({
        ...prev,
        calculatedFare: fare
      }));
    }
  };

  // Open booking form for a specific driver
  const handleBookDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowBookingForm(true);
    // Reset form data
    setBookingData({
      pickupAddress: '',
      dropoffAddress: '',
      scheduledTime: '',
      vehicleType: '',
      transmissionType: '',
      days: 1,
      calculatedFare: 15000,
      durationValue: 1,
      durationUnit: 'hours',
      language: 'english',
      paymentMethod: "MomoPay Code 123456"
    });
  };

  // Fixed submitBooking function with new pricing logic
  const submitBooking = async () => {
    if (!selectedDriver) return;

    setIsBookingInProgress(true);
    setBookedDriverId(selectedDriver._id);

    try {
      // Validate required fields
      if (!bookingData.pickupAddress || !bookingData.scheduledTime) {
        throw new Error('Pickup address and scheduled time are required');
      }

      // Calculate pricing based on days
      const daysValue = parseInt(bookingData.days) || 0;
      let baseAmount = 0;

      if (daysValue === 1) {
        baseAmount = 15000;
      } else {
        baseAmount = daysValue * 10000;
      }

      const discount = 0; // No discount for now
      const tax = 0; // No tax for now
      const totalAmount = baseAmount - discount + tax;

      // Validate pricing
      if (isNaN(baseAmount) || isNaN(totalAmount) || baseAmount <= 0 || totalAmount <= 0) {
        throw new Error('Invalid pricing calculation. Please check your inputs.');
      }

      // Prepare the booking payload with all required fields
      const bookingPayload = {
        driverId: selectedDriver._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-1.9441, 30.0619], // Default coordinates for Kigali
          address: bookingData.pickupAddress
        },
        bookingType: 'once', // Default to one-time booking
        duration: {
          value: parseInt(bookingData.durationValue),
          unit: bookingData.durationUnit
        },
        scheduledTime: bookingData.scheduledTime,
        // Send paymentMethod as the exact string backend expects
        paymentMethod: bookingData.paymentMethod, // "MomoPay Code 123456"
        // Add pricing fields that backend might expect
        pricing: {
          baseAmount: baseAmount,
          discount: discount,
          tax: tax,
          totalAmount: totalAmount
        },
        notes: `Vehicle Type: ${bookingData.vehicleType}, Transmission: ${bookingData.transmissionType}, Language: ${bookingData.language}, Days: ${bookingData.days}`
      };

      // Add dropoff location only if provided
      if (bookingData.dropoffAddress && bookingData.dropoffAddress.trim()) {
        bookingPayload.dropoffLocation = {
          type: 'Point',
          coordinates: [-1.9441, 30.0619],
          address: bookingData.dropoffAddress
        };
      }

      console.log('Sending booking payload:', JSON.stringify(bookingPayload, null, 2));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      console.log('Booking response status:', response.status);

      if (!response.ok) {
        // Enhanced error handling to get detailed error information
        let errorData: any;
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);

          // Try to parse as JSON
          errorData = errorText ? JSON.parse(errorText) : { msg: 'Unknown error' };
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { msg: `Server error: ${response.status} ${response.statusText}` };
        }

        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => err.msg).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }

        // Use the server's error message if available
        const errorMessage = errorData.error || errorData.msg || errorData.message || 'Failed to create booking';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Booking successful:', data);

      // Trigger notification for successful booking
      addNotification(
        `Booking request sent to ${selectedDriver?.user.name}. Waiting for driver's response.`,
        'success',
        true // Enable browser notification
      );

      showMessage('Booking created successfully!', 'success');
      setShowBookingForm(false);

      // Refresh drivers list
      fetchDrivers();

    } catch (err: any) {
      console.error('Error creating booking:', err);
      showMessage(`Failed to create booking: ${err.message}`, 'error');
    } finally {
      setIsBookingInProgress(false);
      setBookedDriverId(null);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchDrivers();
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="p-3 p-md-4"
    >
      {/* Active Booking Section */}
      {activeBooking && (
        <DriverTrackingMap booking={activeBooking} theme={theme} />
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className="h3 fw-bold">Welcome, {user.name}!</h2>
          <p className="text-muted">Find and book a driver for your next trip.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <motion.button
            onClick={fetchDrivers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </motion.button>
          <motion.button
            className="btn btn-info text-white"
            onClick={() => setShowFareCalculator(!showFareCalculator)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-calculator me-1"></i>
            {showFareCalculator ? 'Hide' : 'Show'} Calculator
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-funnel me-1"></i>
            {showFilters ? 'Hide' : 'Get your desired driver'}
          </motion.button>
          {/* Voice Control Button */}
          <motion.button
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            className={`btn ${isListening ? 'btn-danger' : 'btn-outline-success'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <>
                <i className="bi bi-mic me-1"></i>
                <span> Listening...</span>
              </>
            ) : (
              <>
                <i className="bi bi-mic-off me-1"></i>
                <span> Voice Control</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          className="card border-0 shadow-sm mb-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="card-body p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">Filter Drivers</h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Age Range</label>
                <select
                  className="form-select"
                  name="ageRange"
                  value={filters.ageRange}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Age</option>
                  <option value="20-30">20-30</option>
                  <option value="30-40">30-40</option>
                  <option value="40+">40+</option>
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Minimum Experience (years)</label>
                <input
                  type="number"
                  className="form-control"
                  name="minExperience"
                  value={filters.minExperience}
                  onChange={handleFilterChange}
                  min="0"
                  placeholder="e.g. 2"
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                />
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Transmission</label>
                <select
                  className="form-select"
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="both">Both</option
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Vehicle Type</label>
                <select
                  className="form-select"
                  name="vehicleType"
                  value={filters.vehicleType}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Vehicle</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="pickup">Pickup</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Service Area</label>
                <select
                  className="form-select"
                  name="serviceArea"
                  value={filters.serviceArea}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Area</option>
                  <option value="kigali">Kigali</option>
                  <option value="outsideKigali">Outside Kigali</option>
                  <option value="nationwide">Nationwide</option>
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Time Availability</label>
                <select
                  className="form-select"
                  name="timeAvailability"
                  value={filters.timeAvailability}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Time</option>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Service Type</label>
                <select
                  className="form-select"
                  name="serviceType"
                  value={filters.serviceType}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Service</option>
                  <option value="shortTrips">Short Trips</option>
                  <option value="longTrips">Long Trips</option>
                  <option value="events">Events</option>
                  <option value="tours">Tours</option>
                </select>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Language</label>
                <select
                  className="form-select"
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="">Any Language</option>
                  <option value="english">English</option>
                  <option value="kinyarwanda">Kinyarwanda</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>

            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div className="text-muted">
                {filteredDrivers.length} of {drivers.length} drivers match your filters
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Driver Price Calculator */}
      {showFareCalculator && (
        <DriverPriceCalculator theme={theme} />
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-warning text-center mb-4" role="alert">
          <h5 className="alert-heading">Service Unavailable</h5>
          <p className="mb-3">{error}</p>
          <motion.button
            onClick={handleRetry}
            className="btn btn-outline-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      )}

      {/* Drivers List */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '12rem' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted h5">Loading drivers...</p>
              </div>
            </div>
          </div>
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver, index) => (
            <div key={driver._id} className="col-12 col-md-6 col-lg-4">
              <AnimatedCard delay={index * 0.1}>
                <DriverCard
                  driver={driver}
                  onBook={handleBookDriver}
                  isBooking={isBookingInProgress && bookedDriverId === driver._id}
                  theme={theme}
                />
              </AnimatedCard>
            </div>
          ))
        ) : (
          !error && (
            <div className="col-12">
              <div className="text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-car-front text-muted" style={{fontSize: '4rem'}}></i>
                </div>
                <h4 className="text-muted mb-3">
                  {drivers.length > 0 ? 'No drivers match your filters' : 'No Drivers Available'}
                </h4>
                <p className="text-muted">
                  {drivers.length > 0
                    ? 'Try adjusting your filter criteria to see more results.'
                    : 'There are currently no drivers available in your area. Please check back later.'
                  }
                </p>
                {drivers.length > 0 && (
                  <motion.button
                    onClick={resetFilters}
                    className="btn btn-outline-primary mt-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Filters
                  </motion.button>
                )}
                <motion.button
                  onClick={handleRetry}
                  className="btn btn-outline-primary mt-3 ms-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </motion.button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedDriver && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Book Driver: {selectedDriver.user.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowBookingForm(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* 1. Pickup Address */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">1. Pickup Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pickupAddress"
                      value={bookingData.pickupAddress}
                      onChange={handleBookingInputChange}
                      required
                      placeholder="Enter pickup location"
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                  </div>

                  {/* 2. Pickup Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">2. Pickup Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="scheduledTime"
                      value={bookingData.scheduledTime}
                      onChange={handleBookingInputChange}
                      min={new Date().toISOString().slice(0, 16)} // Set min to current date/time
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                  </div>

                  {/* 3. Vehicle Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">3. Vehicle Type</label>
                    <select
                      className="form-select"
                      name="vehicleType"
                      value={bookingData.vehicleType}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="pickup">Pickup</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>

                  {/* 4. Transmission Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">4. Transmission Type</label>
                    <select
                      className="form-select"
                      name="transmissionType"
                      value={bookingData.transmissionType}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="">Select transmission type</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  {/* 5. Number of Days */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">5. Number of Days</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="days"
                        value={bookingData.days}
                        onChange={handleBookingInputChange}
                        placeholder="Enter number of days"
                        min="1"
                        step="1"
                        style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                      />
                      <span className="input-group-text">days</span>
                    </div>
                    {bookingData.days > 0 && (
                      <div className="mt-2 alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Estimated Fare: <strong>{bookingData.calculatedFare.toLocaleString()} RWF</strong>
                      </div>
                    )}
                  </div>

                  {/* 6. Duration */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">6. Duration</label>
                    <div className="row g-2">
                      <div className="col-8">
                        <input
                          type="number"
                          className="form-control"
                          name="durationValue"
                          value={bookingData.durationValue}
                          onChange={handleBookingInputChange}
                          min="1"
                          required
                          style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                        />
                      </div>
                      <div className="col-4">
                        <select
                          className="form-select"
                          name="durationUnit"
                          value={bookingData.durationUnit}
                          onChange={handleBookingInputChange}
                          style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 7. Language */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">7. Preferred Language</label>
                    <select
                      className="form-select"
                      name="language"
                      value={bookingData.language}
                      onChange={handleBookingInputChange}
                      required
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <option value="english">English</option>
                      <option value="kinyarwanda">Kinyarwanda</option>
                      <option value="french">French</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Method</label>
                    <input
                      type="text"
                      className="form-control"
                      name="paymentMethod"
                      value={bookingData.paymentMethod}
                      readOnly
                      style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                    <small className="text-muted">Payment method is fixed to MomoPay Code 123456</small>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Close</button>
                <motion.button
                  type="button"
                  className="btn btn-primary"
                  onClick={submitBooking}
                  disabled={isBookingInProgress}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isBookingInProgress ? 'Booking...' : 'Book Now'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CustomerDashboard;