import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define the register props type
interface RegisterProps {
  onRegisterSuccess: () => void;
  showMessage: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  theme: 'light' | 'dark';
}

// Registration form component
const Register = ({ onRegisterSuccess, showMessage, theme }: RegisterProps) => {
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
  // State for all form fields, including nested fields for drivers
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'customer',
    // New nested objects for driver-specific fields
    vehicle: {
      make: '',
      model: '',
      licensePlate: '',
      color: '',
    },
    // Removed pricing.hourlyRate field
    bio: '',
    // New driver profile fields
    ageRange: '',
    yearsOfExperience: '',
    transmissionProficiency: 'both',
    vehicleTypesComfortable: [],
    preferredServiceAreas: ['kigali'],
    timeAvailability: 'flexible',
    openToServices: ['shortTrips'],
    languagesSpoken: ['english', 'kinyarwanda']
  });
  const [loading, setLoading] = useState<boolean>(false);

  // General handler for top-level form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Specific handler for nested fields like vehicle
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, parent: string) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      }
    }));
  };

  // Handler for array fields (checkboxes)
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting registration:', formData);

      // Create a payload based on user type
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType,
      };

      // Conditionally add driver-specific fields to the payload
      if (formData.userType === 'driver') {
        // Ensure vehicle object is complete and properly formatted
        payload.vehicle = {
          make: formData.vehicle.make.trim(),
          model: formData.vehicle.model.trim(),
          licensePlate: formData.vehicle.licensePlate.trim().toUpperCase(),
          color: formData.vehicle.color.trim(),
        };
        // Removed pricing field from payload
        payload.bio = formData.bio.trim();

        // Add new driver profile fields
        payload.ageRange = formData.ageRange;
        payload.yearsOfExperience = formData.yearsOfExperience;
        payload.transmissionProficiency = formData.transmissionProficiency;
        payload.vehicleTypesComfortable = formData.vehicleTypesComfortable;
        payload.preferredServiceAreas = formData.preferredServiceAreas;
        payload.timeAvailability = formData.timeAvailability;
        payload.openToServices = formData.openToServices;
        payload.languagesSpoken = formData.languagesSpoken;
      }

      console.log('Final payload being sent:', payload); // Debug log

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Registration response status:', response.status);

      let data: any;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Try to parse as JSON
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid response format');
      }

      if (response.ok) {
        showMessage('Registration successful! Please login.', 'success');
        onRegisterSuccess();
      } else {
        const errorMsg = data.errors?.[0]?.msg || data.msg || `Registration failed (${response.status})`;
        showMessage(errorMsg, 'error');
        console.error('Registration failed:', data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error. Please try again later.';
      showMessage(errorMessage, 'error');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="container p-4 p-md-5 rounded-3 shadow"
      style={{ backgroundColor: colors.cardBg }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="h3 fw-bold text-center mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div className="form-group">
          <label className="form-label fw-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control rounded-3"
            required
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-semibold">User Type</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="form-select rounded-3"
            style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Conditional rendering for driver-specific fields */}
        {formData.userType === 'driver' && (
          <>
            <hr className="my-3"/>
            <h4 className="h5 fw-bold mb-3">Driver Details</h4>

            {/* Basic Information */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Age Range</label>
                  <select
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="">Select age range</option>
                    <option value="20-30">20-30</option>
                    <option value="30-40">30-40</option>
                    <option value="40+">40+</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    min="1"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-3">Vehicle Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.vehicle.make}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Toyota, Ford, BMW"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.vehicle.model}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Camry, F-150, X3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.vehicle.licensePlate}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., RAD015F"
                    required
                    style={{ textTransform: 'uppercase', backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Vehicle Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.vehicle.color}
                    onChange={(e) => handleNestedChange(e, 'vehicle')}
                    className="form-control rounded-3"
                    placeholder="e.g., Blue, Red, White"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>
              </div>
            </div>

            {/* Removed Pricing Section */}

            {/* Driver Preferences Section */}
            <h5 className="h6 fw-semibold mb-2 text-muted mt-3">Driver Preferences</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Transmission Proficiency</label>
                  <select
                    name="transmissionProficiency"
                    value={formData.transmissionProficiency}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">Time Availability</label>
                  <select
                    name="timeAvailability"
                    value={formData.timeAvailability}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Types Comfortable */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Vehicle Types Comfortable</label>
              <div className="row g-2">
                {['sedan', 'suv', 'van', 'pickup', 'luxury'].map((type: string) => (
                  <div key={type} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`vehicle-${type}`}
                        value={type}
                        checked={formData.vehicleTypesComfortable.includes(type)}
                        onChange={(e) => handleArrayChange(e, 'vehicleTypesComfortable')}
                      />
                      <label className="form-check-label" htmlFor={`vehicle-${type}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Preferred Service Areas</label>
              <div className="row g-2">
                {['kigali', 'outsideKigali', 'nationwide'].map((area: string) => (
                  <div key={area} className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`area-${area}`}
                        value={area}
                        checked={formData.preferredServiceAreas.includes(area)}
                        onChange={(e) => handleArrayChange(e, 'preferredServiceAreas')}
                      />
                      <label className="form-check-label" htmlFor={`area-${area}`}>
                        {area === 'kigali' ? 'Kigali' : area === 'outsideKigali' ? 'Outside Kigali' : 'Nationwide'}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Open To Services */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Open To Services</label>
              <div className="row g-2">
                {['shortTrips', 'longTrips', 'events', 'tours'].map((service: string) => (
                  <div key={service} className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`service-${service}`}
                        value={service}
                        checked={formData.openToServices.includes(service)}
                        onChange={(e) => handleArrayChange(e, 'openToServices')}
                      />
                      <label className="form-check-label" htmlFor={`service-${service}`}>
                        {service === 'shortTrips' ? 'Short Trips' :
                         service === 'longTrips' ? 'Long Trips' :
                         service === 'events' ? 'Events' : 'Tours'}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Languages Spoken */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Languages Spoken</label>
              <div className="row g-2">
                {['english', 'kinyarwanda', 'french'].map((lang: string) => (
                  <div key={lang} className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`lang-${lang}`}
                        value={lang}
                        checked={formData.languagesSpoken.includes(lang)}
                        onChange={(e) => handleArrayChange(e, 'languagesSpoken')}
                      />
                      <label className="form-check-label" htmlFor={`lang-${lang}`}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="form-group mt-3">
              <label className="form-label fw-semibold">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control rounded-3"
                rows="3"
                placeholder="Tell customers about your driving experience and what makes you a great driver..."
                required
                style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
              ></textarea>
            </div>
          </>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Register;