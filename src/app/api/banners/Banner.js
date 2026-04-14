// models/Banner.js
import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please provide a title'],
    trim: true 
  },
  subtitle: { 
    type: String, 
    trim: true,
    default: ''
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Please provide an image'] 
  },
  buttonText: { 
    type: String, 
    default: "ORDER NOW" 
  },
  buttonLink: { 
    type: String, 
    default: "/shop" 
  },
  order: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

export default Banner;