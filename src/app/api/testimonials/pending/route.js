import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '../Testimonial';

// GET pending testimonials (customer submitted, not approved)
export async function GET() {
  try {
    await dbConnect();
    
    const pendingTestimonials = await Testimonial.find({ 
      isActive: false,
      submittedBy: 'customer'
    }).sort({ createdAt: -1 });
    
    return NextResponse.json(pendingTestimonials);
  } catch (error) {
    console.error('Error fetching pending testimonials:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pending testimonials', error: error.message },
      { status: 500 }
    );
  }
}