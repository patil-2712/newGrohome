// src/models/RefundPolicy.js
import mongoose from 'mongoose';

const RefundPolicySchema = new mongoose.Schema({
  section: { 
    type: String, 
    required: [true, 'Please provide a section title'],
    trim: true 
  },
  content: { 
    type: String, 
    trim: true,
    default: ''  // Make content optional with default empty string
  },
  type: { 
    type: String, 
    enum: ['paragraph', 'heading', 'list'],
    default: 'paragraph'
  },
  listItems: { 
    type: [String],
    default: []
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Remove the required validator for content when type is heading or list
RefundPolicySchema.pre('validate', function(next) {
  if (this.type === 'heading' || this.type === 'list') {
    this.content = this.content || '';
  }
  next();
});

const RefundPolicy = mongoose.models.RefundPolicy || mongoose.model('RefundPolicy', RefundPolicySchema);

export default RefundPolicy;