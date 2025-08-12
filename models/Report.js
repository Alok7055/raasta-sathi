import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['accident', 'police', 'pothole', 'construction', 'congestion', 'closure', 'weather', 'vip']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved', 'rejected'],
    default: 'pending'
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  photos: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 200 },
    createdAt: { type: Date, default: Date.now }
  }],
  votes: {
    up: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, votedAt: { type: Date, default: Date.now } }],
    down: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, votedAt: { type: Date, default: Date.now } }]
  },
  views: { type: Number, default: 0 },
  viewedBy: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, viewedAt: { type: Date, default: Date.now } }],
  estimatedResolutionTime: String,
  actualResolutionTime: Date,
  resolutionNotes: String,
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1, min: 1, max: 5 },
  tags: [String],
  reportedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove index requiring coordinates
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedAt: -1 });
reportSchema.index({ severity: 1, status: 1 });
reportSchema.index({ 'location.city': 1 });

reportSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});
reportSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});
reportSchema.virtual('voteScore').get(function () {
  return this.votes.up.length - this.votes.down.length;
});

reportSchema.methods.addLike = function (userId) {
  const alreadyLiked = this.likes.some(like => like.user.toString() === userId.toString());
  if (!alreadyLiked) this.likes.push({ user: userId });
  return this.save();
};
reportSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};
reportSchema.methods.addComment = function (userId, text) {
  this.comments.push({ user: userId, text });
  return this.save();
};
reportSchema.methods.vote = function (userId, voteType) {
  this.votes.up = this.votes.up.filter(v => v.user.toString() !== userId.toString());
  this.votes.down = this.votes.down.filter(v => v.user.toString() !== userId.toString());
  if (voteType === 'up') this.votes.up.push({ user: userId });
  else if (voteType === 'down') this.votes.down.push({ user: userId });
  return this.save();
};

reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Handle invalid coordinates
  if (this.location && this.location.coordinates) {
    const coords = this.location.coordinates.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2 || 
        typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
        isNaN(coords[0]) || isNaN(coords[1]) ||
        coords[0] === 0 || coords[1] === 0) {
      // Remove invalid coordinates
      console.log('🗑️ Removing invalid coordinates from report');
      delete this.location.coordinates;
    } else {
      console.log('✅ Valid coordinates in report:', coords);
    }
  }
  
  next();
});

export default model('Report', reportSchema);