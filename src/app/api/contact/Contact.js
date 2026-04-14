// src/models/Contact.js
import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  shopName: { 
    type: String, 
    required: [true, 'Please provide a shop name'],
    trim: true 
  },
  address: { 
    type: [String], 
    required: [true, 'Please provide address'],
    default: []
  },
  phone: { 
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
  }
}, {
  timestamps: true
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export default Contact;