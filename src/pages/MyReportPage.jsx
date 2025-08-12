import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Construction, 
  Car, 
  Cloud, 
  Crown,
  MapPin,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Plus,
  Filter,
  Search,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../utils/api';
import toast from 'react-hot-toast';

export function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const mockReports = [
    {
      id: '1',
      type: 'accident',
      title: 'Minor Vehicle Collision',
      location: 'Connaught Place, New Delhi',
      description: 'Two vehicle collision at traffic signal, minor injuries reported. Traffic is moving slowly in the left lane.',
      severity: 'medium',
      status: 'verified',
      timestamp: '2 hours ago',
      verified: true,
      votes: 12,
      likes: 8,
      comments: 3,
      views: 45,
      userLiked: false,
      estimatedFixTime: '30-45 minutes',
      photos: ['photo1.jpg', 'photo2.jpg']
    },
    {
      id: '2',
      type: 'pothole',
      title: 'Large Pothole on Main Road',
      location: 'Ring Road, Delhi',
      description: 'Deep pothole causing vehicle damage, needs immediate attention from municipal authorities.',
      severity: 'high',
      status: 'pending',
      timestamp: '1 day ago',
      verified: false,
      votes: 25,
      likes: 18,
      comments: 7,
      views: 89,
      userLiked: true,
      estimatedFixTime: 'Pending assessment',
      photos: ['pothole1.jpg']
    },
    {
      id: '3',
      type: 'construction',
      title: 'Road Repair Work',
      location: 'Lajpat Nagar, Delhi',
      description: 'Ongoing road repair work causing traffic delays. One lane is completely blocked.',
      severity: 'medium',
      status: 'resolved',
      timestamp: '3 days ago',
      verified: true,
      votes: 15,
      likes: 12,
      comments: 5,
      views: 67,
      userLiked: false,
      estimatedFixTime: 'Completed',
      photos: []
    },
    {
      id: '4',
      type: 'congestion',
      title: 'Heavy Traffic Jam',
      location: 'India Gate Circle, Delhi',
      description: 'Unusual traffic congestion due to event at India Gate. Multiple lanes affected.',
      severity: 'low',
      status: 'rejected',
      timestamp: '5 days ago',
      verified: false,
      votes: 3,
      likes: 1,
      comments: 1,
      views: 23,
      userLiked: false,
      estimatedFixTime: 'Event concluded',
      photos: []
    }
  ];

  useEffect(() => {
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      setIsDeleting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success('Report deleted successfully');
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeReport = async (reportId) => {
    try {
      setReports(prev => 
        prev.map(report => {
          if (report.id === reportId) {
            const newLiked = !report.userLiked;
            return {
              ...report,
              userLiked: newLiked,
              likes: newLiked ? report.likes + 1 : report.likes - 1
            };
          }
          return report;
        })
      );
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to like report:', error);
      toast.error('Failed to update like');
    }
  };

  const getIconForType = (type) => {
    const icons = {
      accident: AlertTriangle,
      police: Shield,
      construction: Construction,
      congestion: Car,
      weather: Cloud,
      vip: Crown,
      pothole: AlertTriangle,
      closure: AlertTriangle
    };
    return icons[type] || AlertTriangle;
  };

  const getColorForSeverity = (severity) => {
    const colors = {
      low: 'text-green-600 bg-green-100 border-green-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[severity] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      resolved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const reportTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'accident', label: 'Accidents' },
    { value: 'pothole', label: 'Potholes' },
    { value: 'construction', label: 'Construction' },
    { value: 'congestion', label: 'Traffic Jams' },
    { value: 'police', label: 'Police Checkpoints' },
    { value: 'weather', label: 'Weather Hazards' },
    { value: 'closure', label: 'Road Closures' },
    { value: 'vip', label: 'VIP Movement' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    verified: reports.filter(r => r.status === 'verified').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    totalLikes: reports.reduce((sum, r) => sum + r.likes, 0),
    totalViews: reports.reduce((sum, r) => sum + r.views, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">My Reports</h1>
              <p className="text-slate-600">Manage and track your traffic reports</p>
            </div>
            <Link
              to="/report"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              <span>New Report</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Reports', value: stats.total, icon: BarChart3, color: 'blue' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
            { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'green' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'purple' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'red' },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'indigo' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your reports..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredReports.map((report, index) => {
              const Icon = getIconForType(report.type);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg border-2 ${getColorForSeverity(report.severity)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          {report.verified && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs">Verified</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/report?edit=${report.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Report"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteModal(report.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{report.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Fix: {report.estimatedFixTime}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 mb-4 line-clamp-2">{report.description}</p>
                      
                      {/* Photos */}
                      {report.photos && report.photos.length > 0 && (
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-sm text-slate-500">📷 {report.photos.length} photo(s) attached</span>
                        </div>
                      )}
                      
                      {/* Engagement Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLikeReport(report.id)}
                            className={`flex items-center space-x-1 text-sm ${
                              report.userLiked ? 'text-red-500' : 'text-slate-500'
                            } hover:text-red-500 transition-colors`}
                          >
                            <Heart className={`h-4 w-4 ${report.userLiked ? 'fill-current' : ''}`} />
                            <span>{report.likes}</span>
                          </motion.button>
                          
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <MessageCircle className="h-4 w-4" />
                            <span>{report.comments}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <Eye className="h-4 w-4" />
                            <span>{report.views}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <span>👍 {report.votes}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-500">
                          Type: <span className="capitalize font-medium">{report.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {reports.length === 0 ? 'No reports yet' : 'No reports match your filters'}
            </h3>
            <p className="text-slate-600 mb-6">
              {reports.length === 0 
                ? 'Start contributing to your community by reporting traffic issues'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {reports.length === 0 && (
              <Link
                to="/report"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Report</span>
              </Link>
            )}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Report</h3>
                  <p className="text-slate-600 mb-6">
                    Are you sure you want to delete this report? This action cannot be undone and will remove the report from everywhere in the system.
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteReport(showDeleteModal)}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        'Delete Report'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-6 py-3">
              <p className="text-sm text-slate-600">
                Showing {filteredReports.length} of {reports.length} reports
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}