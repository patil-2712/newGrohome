// src/models/TermsConditions.js
import mongoose from 'mongoose';

const TermsConditionsSchema = new mongoose.Schema({
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
TermsConditionsSchema.pre('validate', function(next) {
  if (this.type === 'heading' || this.type === 'list') {
    this.content = this.content || '';
  }
  next();
});

const TermsConditions = mongoose.models.TermsConditions || mongoose.model('TermsConditions', TermsConditionsSchema);

export default TermsConditions;