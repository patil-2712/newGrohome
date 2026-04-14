import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '../../Testimonial';

// PUT - Approve a customer review
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    testimonial.isActive = true;
    testimonial.updatedAt = new Date();
    await testimonial.save();
    
    return NextResponse.json(
      { message: 'Review approved successfully' }
    );
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { message: 'Failed to approve review', error: error.message },
      { status: 500 }
    );
  }
}