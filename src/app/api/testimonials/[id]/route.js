import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '../Testimonial';
import { unlink, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET single testimonial
export async function GET(req, { params }) {
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
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { message: 'Failed to fetch testimonial', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE testimonial
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const formData = await req.formData();
    const file = formData.get('image');
    const name = formData.get('name');
    const review = formData.get('review');
    const rating = formData.get('rating');
    const position = formData.get('position');
    const order = formData.get('order');
    const isActive = formData.get('isActive');

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    let imageUrl = testimonial.imageUrl;

    // If new image uploaded
    if (file && file.size > 0) {
      // Delete old image
      const oldImagePath = path.join(process.cwd(), 'public', testimonial.imageUrl);
      try {
        await unlink(oldImagePath);
      } catch (err) {
        console.log('Old image not found:', err.message);
      }

      // Save new image
      const uploadDir = path.join(process.cwd(), 'public/uploads/testimonials');
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/testimonials/${filename}`;
    }

    // Update fields
    if (name) testimonial.name = name;
    if (review) testimonial.review = review;
    if (rating !== undefined && rating !== null) testimonial.rating = parseInt(rating);
    if (position !== undefined) testimonial.position = position;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        testimonial.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      testimonial.isActive = isActive === 'true' || isActive === true;
    }
    testimonial.imageUrl = imageUrl;
    testimonial.updatedAt = new Date();

    await testimonial.save();

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { message: 'Failed to update testimonial', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE testimonial
export async function DELETE(req, { params }) {
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

    // Delete image file
    const imagePath = path.join(process.cwd(), 'public', testimonial.imageUrl);
    try {
      await unlink(imagePath);
    } catch (err) {
      console.log('Image not found:', err.message);
    }

    await testimonial.deleteOne();

    return NextResponse.json(
      { message: 'Testimonial deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { message: 'Failed to delete testimonial', error: error.message },
      { status: 500 }
    );
  }
}