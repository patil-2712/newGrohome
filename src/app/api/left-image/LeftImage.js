// src/models/LeftImage.js
import mongoose from 'mongoose';

const LeftImageSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: [true, 'Please provide an image'],
    trim: true 
  },
  alt: { 
    type: String, 
    default: 'Featured collection',
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const LeftImage = mongoose.models.LeftImage || mongoose.model('LeftImage', LeftImageSchema);

export default LeftImage;