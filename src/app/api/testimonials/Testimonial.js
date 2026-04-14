import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name'],
    trim: true 
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true
  },
  imageUrl: { 
    type: String, 
    default: ''
  },
  review: { 
    type: String, 
    required: [true, 'Please provide a review'],
    trim: true,
    maxLength: [1000, 'Review cannot exceed 1000 characters']
  },
  rating: { 
    type: Number, 
    default: 5,
    min: 1,
    max: 5
  },
  position: { 
    type: String, 
    default: '',
    trim: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  submittedBy: { 
    type: String, 
    enum: ['admin', 'customer'],
    default: 'admin'
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

TestimonialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for sorting
TestimonialSchema.index({ order: 1, isActive: -1, createdAt: -1 });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);