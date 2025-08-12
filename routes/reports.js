import { Router } from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { validateReport, validate } from '../middleware/validation.js';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads with better error handling
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('photo');

// Create new report
router.post(
  '/',
  protect,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      console.log('📝 Report creation started');
      console.log('User:', req.user._id);
      console.log('Request body:', req.body);
      
      // Parse location if sent as JSON string
      if (req.body.location && typeof req.body.location === 'string') {
        try {
          req.body.location = JSON.parse(req.body.location);
          console.log('📍 Parsed location:', req.body.location);
        } catch (err) {
          console.error('❌ Location parsing error:', err);
          return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON format for location'
          });
        }
      }

      // Parse coordinates if sent as JSON string
      if (req.body.coordinates && typeof req.body.coordinates === 'string') {
        try {
          req.body.coordinates = JSON.parse(req.body.coordinates);
          console.log('📍 Parsed coordinates:', req.body.coordinates);
          
          // Validate coordinates
          const coords = req.body.coordinates.coordinates;
          if (!Array.isArray(coords) || coords.length !== 2 || 
              typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
              isNaN(coords[0]) || isNaN(coords[1]) ||
              coords[0] === 0 || coords[1] === 0) {
            console.log('⚠️ Invalid coordinates, removing coordinates field');
            delete req.body.coordinates;
          } else {
            console.log('✅ Valid coordinates:', coords);
          }
        } catch (err) {
          console.error('❌ Coordinates parsing error:', err);
          delete req.body.coordinates;
        }
      }

      console.log('🔍 Running validation...');
      // Run validation manually
      await Promise.all(validateReport.map((rule) => rule.run(req)));
      const { validationResult } = await import('express-validator');
      const result = validationResult(req);
      if (!result.isEmpty()) {
        console.error('❌ Validation failed:', result.array());
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: result.array()
        });
      }
      console.log('✅ Validation passed');

      req.body.reportedBy = req.user.id;
      console.log('👤 Set reportedBy:', req.body.reportedBy);

      // Fallback title if needed
      if (!req.body.title) {
        req.body.title = `${req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)} Report`;
      }

      console.log('💾 Creating report...');
      
      const report = await Report.create(req.body);
      console.log('✅ Report created:', report._id);
      
      await report.populate('reportedBy', 'name avatar role');
      console.log('👤 Report populated');

      console.log('🏆 Updating user points...');
      await req.user.updatePoints(10);
      console.log('✅ Points updated');

      console.log('🔥 Updating user streak...');
      await req.user.updateStreak();
      console.log('✅ Streak updated');

      // Notify nearby users (only if coordinates exist) - TEMPORARILY DISABLED
      /*
      if (req.body.location?.coordinates?.coordinates?.length === 2) {
        console.log('🔔 Checking for nearby users...');
        const [lng, lat] = req.body.location.coordinates.coordinates;

        const nearbyUsers = await User.find({
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: 5000
            }
          },
          _id: { $ne: req.user.id },
          notificationsEnabled: true,
          'notificationSettings.nearbyReports': true
        });

        console.log(`📢 Found ${nearbyUsers.length} nearby users`);

        for (const user of nearbyUsers) {
          await Notification.createNotification({
            recipient: user._id,
            sender: req.user.id,
            type: 'report_nearby',
            title: 'New Report Nearby',
            message: `${req.body.type} reported near your location`,
            data: {
              reportId: report._id,
              location: req.body.location
            }
          });
        }
        console.log('✅ Notifications sent');
      }
      */

      console.log('🎉 Report creation completed successfully');
      res.status(201).json({
        status: 'success',
        data: { report }
      });
    } catch (error) {
      console.error('❌ Report creation failed:', error);
      next(error);
    }
  }
);

// Get all reports
router.get('/', async (req, res, next) => {
  try {
    console.log('📋 Fetching all reports...');
    
    const reports = await Report.find({ isActive: true })
      .populate('reportedBy', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent 100 reports
    
    console.log(`✅ Found ${reports.length} reports`);
    
    res.status(200).json({
      status: 'success',
      data: { reports }
    });
  } catch (error) {
    console.error('❌ Failed to fetch reports:', error);
    next(error);
  }
});

// Get single report by ID
router.get('/:id', async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name avatar role');
    
    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    console.error('❌ Failed to fetch report:', error);
    next(error);
  }
});

// Test endpoint for location handling
router.post('/test-location', protect, (req, res) => {
  try {
    console.log('🧪 Testing location handling...');
    console.log('Original request body:', req.body);
    
    // Parse location if sent as JSON string
    if (req.body.location && typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
        console.log('📍 Parsed location:', req.body.location);
        
        // Validate coordinates if they exist
        if (req.body.location.coordinates) {
          const coords = req.body.location.coordinates.coordinates;
          if (!Array.isArray(coords) || coords.length !== 2 || 
              typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
              isNaN(coords[0]) || isNaN(coords[1]) ||
              coords[0] === 0 || coords[1] === 0) {
            console.log('⚠️ Invalid coordinates, removing coordinates field');
            delete req.body.location.coordinates;
          } else {
            console.log('✅ Valid coordinates:', coords);
          }
        }
      } catch (err) {
        console.error('❌ Location parsing error:', err);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid JSON format for location'
        });
      }
    }
    
    console.log('✅ Final location data:', req.body.location);
    
    res.status(200).json({
      status: 'success',
      message: 'Location test successful',
      location: req.body.location
    });
  } catch (error) {
    console.error('❌ Location test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Location test failed'
    });
  }
});

export default router;