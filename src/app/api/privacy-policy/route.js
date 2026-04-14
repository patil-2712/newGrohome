// src/app/api/privacy-policy/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrivacyPolicy from './PrivacyPolicy';

// GET all privacy policy sections
export async function GET() {
  try {
    await dbConnect();
    
    const sections = await PrivacyPolicy.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json(
      { message: 'Failed to fetch privacy policy', error: error.message },
      { status: 500 }
    );
  }
}

// POST new privacy policy section
export async function POST(request) {
  try {
    await dbConnect();
    
    const { section, content, type, listItems, order, isActive } = await request.json();

    if (!section) {
      return NextResponse.json(
        { message: 'Section title is required' },
        { status: 400 }
      );
    }

    // Validate based on type
    if (type === 'paragraph' && (!content || content.trim() === '')) {
      return NextResponse.json(
        { message: 'Content is required for paragraph type' },
        { status: 400 }
      );
    }

    if (type === 'list' && (!listItems || listItems.length === 0 || listItems.every(item => !item.trim()))) {
      return NextResponse.json(
        { message: 'At least one list item is required for list type' },
        { status: 400 }
      );
    }

    const policy = new PrivacyPolicy({
      section,
      content: content || '',
      type: type || 'paragraph',
      listItems: listItems || [],
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await policy.save();

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error adding privacy policy section:', error);
    return NextResponse.json(
      { message: 'Failed to add privacy policy section', error: error.message },
      { status: 500 }
    );
  }
}