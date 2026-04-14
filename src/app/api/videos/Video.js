// src/models/Video.js
import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please provide a title'],
    trim: true 
  },
  description: { 
    type: String, 
    trim: true,
    default: ''
  },
  videoUrl: { 
    type: String, 
    required: [true, 'Please provide a video file'],
    trim: true 
  },
  thumbnail: { 
    type: String,
    default: ''
  },
  fileSize: { 
    type: Number,
    default: 0
  },
  duration: { 
    type: String,
    default: ''
  },
  order: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default Video;