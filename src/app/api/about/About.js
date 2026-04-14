// src/models/About.js
import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  language: { 
    type: String, 
    required: true,
    enum: ['en', 'mr'], // English or Marathi
    trim: true 
  },
  title: { 
    type: String, 
    required: [true, 'Please provide a title'],
    trim: true 
  },
  content: { 
    type: String, 
    required: [true, 'Please provide content'],
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  order: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

const About = mongoose.models.About || mongoose.model('About', AboutSchema);

export default About;