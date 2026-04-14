// src/app/api/about/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import About from '../About';

// GET single about content
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const about = await About.findById(id);
    if (!about) {
      return NextResponse.json(
        { message: 'About content not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch about content', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE about content
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const { language, title, content, order, isActive } = await request.json();

    const about = await About.findById(id);
    if (!about) {
      return NextResponse.json(
        { message: 'About content not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (language) about.language = language;
    if (title) about.title = title;
    if (content) about.content = content;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        about.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      about.isActive = isActive === 'true' || isActive === true;
    }
    about.updatedAt = new Date();

    await about.save();

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json(
      { message: 'Failed to update about content', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE about content
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const about = await About.findById(id);
    if (!about) {
      return NextResponse.json(
        { message: 'About content not found' },
        { status: 404 }
      );
    }

    await about.deleteOne();

    return NextResponse.json(
      { message: 'About content deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting about content:', error);
    return NextResponse.json(
      { message: 'Failed to delete about content', error: error.message },
      { status: 500 }
    );
  }
}