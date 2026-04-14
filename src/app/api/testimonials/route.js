import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from './Testimonial';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET all active testimonials (for frontend)
export async function GET() {
  try {
    await dbConnect();
    
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { message: 'Failed to fetch testimonials', error: error.message },
      { status: 500 }
    );
  }
}

// POST new testimonial (admin only)
export async function POST(req) {
  try {
    await dbConnect();
    
    const formData = await req.formData();
    const file = formData.get('image');
    const name = formData.get('name');
    const review = formData.get('review');
    const rating = formData.get('rating');
    const position = formData.get('position');
    const order = formData.get('order');
    const isActive = formData.get('isActive');

    if (!file || !name || !review) {
      return NextResponse.json(
        { message: 'Name, review and image are required' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads/testimonials');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('Upload directory created');
    }

    // Save image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeFilename}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/testimonials/${filename}`;

    // Create testimonial
    const testimonial = new Testimonial({
      name,
      imageUrl,
      review,
      rating: rating ? parseInt(rating) : 5,
      position: position || '',
      order: order ? parseInt(order) : 0,
      isActive: isActive === 'true' || isActive === true,
      submittedBy: 'admin'
    });

    await testimonial.save();

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('Error uploading testimonial:', error);
    return NextResponse.json(
      { message: 'Failed to upload testimonial', error: error.message },
      { status: 500 }
    );
  }
}