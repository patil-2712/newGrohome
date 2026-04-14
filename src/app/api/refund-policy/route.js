// src/app/api/refund-policy/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RefundPolicy from './RefundPolicy';

// GET all refund policy sections
export async function GET() {
  try {
    await dbConnect();
    
    const sections = await RefundPolicy.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching refund policy:', error);
    return NextResponse.json(
      { message: 'Failed to fetch refund policy', error: error.message },
      { status: 500 }
    );
  }
}

// POST new refund policy section
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

    const policy = new RefundPolicy({
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
    console.error('Error adding refund policy section:', error);
    return NextResponse.json(
      { message: 'Failed to add refund policy section', error: error.message },
      { status: 500 }
    );
  }
}