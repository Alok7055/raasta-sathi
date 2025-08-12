import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Construction, 
  Car, 
  Cloud, 
  Crown,
  MapPin,
  Camera,
  Send,
  CheckCircle,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';

export function ReportPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Refs for the file inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const reportTypes = [
    { id: 'accident', label: t('report.accident'), icon: AlertTriangle, color: 'red' },
    { id: 'police', label: t('report.police'), icon: Shield, color: 'blue' },
    { id: 'pothole', label: t('report.pothole'), icon: AlertTriangle, color: 'orange' },
    { id: 'construction', label: t('report.construction'), icon: Construction, color: 'yellow' },
    { id: 'congestion', label: t('report.congestion'), icon: Car, color: 'purple' },
    { id: 'closure', label: t('report.closure'), icon: AlertTriangle, color: 'gray' },
    { id: 'weather', label: t('report.weather'), icon: Cloud, color: 'cyan' },
    { id: 'vip', label: t('report.vip'), icon: Crown, color: 'pink' }
  ];

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    // Reset the value of the file inputs to allow re-selection of the same file
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleUseCurrentLocation = () => {
  setIsFetchingLocation(true);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setCoordinates({ lat: latitude, lng: longitude });
        toast.success('Location fetched successfully!');
        setIsFetchingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error('Could not fetch location. Please enable location services.');
        setIsFetchingLocation(false);
      }
    );
  } else {
    toast.error('Geolocation is not supported by your browser.');
    setIsFetchingLocation(false);
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedType || !location || !description) {
    toast.error('Please fill in all required fields');
    return;
  }

  if (!user) {
    toast.error('Please login to submit a report.');
    return;
  }

  // Check if user token is valid
  const token = localStorage.getItem('raasta_sathi_token');
  if (!token) {
    toast.error('Authentication token missing. Please login again.');
    navigate('/login');
    return;
  }

  setIsSubmitting(true);

  // Test connection first
  try {
    console.log('Testing connection...');
    await apiService.testConnection();
    console.log('Connection test successful');
  } catch (error) {
    console.error('Connection test failed:', error);
    toast.error('Connection test failed. Please check your internet connection.');
    setIsSubmitting(false);
    return;
  }

  const formData = new FormData();
  formData.append('type', selectedType);
  formData.append('description', description);
  formData.append('severity', severity);
  formData.append('reportedBy', user._id);

  // Prepare location data (without coordinates)
  const locationData = {
    address: location,
    country: "India" // Default country
  };

  console.log('🔍 Current coordinates state:', coordinates);

  // Handle coordinates separately
  if (coordinates.lat !== null && coordinates.lng !== null && 
      typeof coordinates.lat === 'number' && 
      typeof coordinates.lng === 'number' &&
      !isNaN(coordinates.lat) && 
      !isNaN(coordinates.lng) &&
      coordinates.lat !== 0 && coordinates.lng !== 0) {
    
    // Add coordinates as a separate field
    const coordinatesData = {
      type: 'Point',
      coordinates: [coordinates.lng, coordinates.lat] // MongoDB expects [longitude, latitude]
    };
    formData.append('coordinates', JSON.stringify(coordinatesData));
    console.log('📍 Including coordinates:', coordinatesData);
  } else {
    console.log('📍 No valid coordinates, excluding coordinates field');
  }

  formData.append('location', JSON.stringify(locationData));

  if (photo) {
    console.log('Adding photo to form data, size:', photo.size);
    formData.append('photo', photo);
  }

  console.log('Submitting report with data:', {
    type: selectedType,
    description: description,
    severity: severity,
    hasPhoto: !!photo,
    photoSize: photo?.size,
    user: user._id
  });

  try {
    const response = await apiService.createReport(formData);
    console.log('Report submission successful:', response);
    toast.success('Report submitted successfully! Your report will appear on the live map.');
    setTimeout(() => {
      navigate('/map');
    }, 2000);
  } catch (error) {
    console.error('Report submission error:', error);
    const errorMessage = error.message || 'Failed to submit report. Please try again.';
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const getColorClasses = (color, selected) => {
    const colors = {
      red: selected ? 'bg-red-100 border-red-300 text-red-700' : 'border-red-200 hover:border-red-300 text-red-600',
      blue: selected ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-blue-200 hover:border-blue-300 text-blue-600',
      orange: selected ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-orange-200 hover:border-orange-300 text-orange-600',
      yellow: selected ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'border-yellow-200 hover:border-yellow-300 text-yellow-600',
      purple: selected ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-purple-200 hover:border-purple-300 text-purple-600',
      gray: selected ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 hover:border-gray-300 text-gray-600',
      cyan: selected ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : 'border-cyan-200 hover:border-cyan-300 text-cyan-600',
      pink: selected ? 'bg-pink-100 border-pink-300 text-pink-700' : 'border-pink-200 hover:border-pink-300 text-pink-600'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            {isEditing && (
              <Link
                to="/my-reports"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to My Reports</span>
              </Link>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {isEditing ? 'Edit Traffic Report' : 'Report Traffic Issue'}
          </h1>
          <p className="text-lg text-slate-600">
            {isEditing 
              ? 'Update your traffic report with new information'
              : 'Help your community by reporting real-time traffic conditions'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Report Traffic Issue</h1>
          <p className="text-lg text-slate-600">Help your community by reporting real-time traffic conditions</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-4">
                    What type of issue are you reporting? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            getColorClasses(type.color, isSelected)
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2" />
                          <span className="text-sm font-medium block">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location or use current location"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isFetchingLocation}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isFetchingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      '📍 Use current location'
                    )}
                  </button>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                          severity === level
                            ? level === 'low' ? 'bg-green-100 border-green-300 text-green-700'
                              : level === 'medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                              : 'bg-red-100 border-red-300 text-red-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the traffic condition..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Add Photo (Optional)
                  </label>
                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                    capture="environment" // Asks for the main back camera
                  />

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center transition-colors">
                    {photoPreview ? (
                      <div className="relative group">
                        <img src={photoPreview} alt="Report preview" className="rounded-lg mx-auto max-h-48" />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current.click()}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Camera className="h-4 w-4" />
                          Take Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="h-5 w-5" />
                      <span>Submit Report</span>
                    </div>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reporting Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Be specific about the exact location</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Include photos when possible</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Report safely - don't use while driving</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Update if situation changes</p>
                </div>
              </div>
            </motion.div>

            {/* Reward Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-blue-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Earn Rewards</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Verified Report</span>
                  <span className="text-sm font-semibold text-green-600">+10 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">With Photo</span>
                  <span className="text-sm font-semibold text-blue-600">+5 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Community Upvotes</span>
                  <span className="text-sm font-semibold text-purple-600">+1 pt each</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
