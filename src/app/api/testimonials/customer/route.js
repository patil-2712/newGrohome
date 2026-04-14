import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '../Testimonial';

// POST - Customer submits a review
export async function POST(req) {
  try {
    await dbConnect();
    
    const { name, email, review, rating, position } = await req.json();

    if (!name || !review) {
      return NextResponse.json(
        { message: 'Name and review are required' },
        { status: 400 }
      );
    }

    // Customer review - needs admin approval
    const testimonial = new Testimonial({
      name,
      email: email || '',
      review,
      rating: rating || 5,
      position: position || 'Customer',
      isActive: false,
      submittedBy: 'customer',
      order: 999,
    });

    await testimonial.save();

    return NextResponse.json(
      { message: 'Review submitted successfully. It will be displayed after admin approval.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting customer review:', error);
    return NextResponse.json(
      { message: 'Failed to submit review', error: error.message },
      { status: 500 }
    );
  }
}