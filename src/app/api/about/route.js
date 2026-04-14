// src/app/api/about/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import About from './About';

// GET all about content
export async function GET() {
  try {
    await dbConnect();
    
    const about = await About.find({ isActive: true })
      .sort({ language: 1, order: 1 });
    
    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch about content', error: error.message },
      { status: 500 }
    );
  }
}

// POST new about content
export async function POST(request) {
  try {
    await dbConnect();
    
    const { language, title, content, order, isActive } = await request.json();

    if (!language || !title || !content) {
      return NextResponse.json(
        { message: 'Language, title, and content are required' },
        { status: 400 }
      );
    }

    const about = new About({
      language,
      title,
      content,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await about.save();

    return NextResponse.json(about, { status: 201 });
  } catch (error) {
    console.error('Error adding about content:', error);
    return NextResponse.json(
      { message: 'Failed to add about content', error: error.message },
      { status: 500 }
    );
  }
}