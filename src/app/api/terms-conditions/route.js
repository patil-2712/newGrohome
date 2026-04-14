// src/app/api/terms-conditions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TermsConditions from './TermsConditions';

// GET all terms & conditions sections
export async function GET() {
  try {
    await dbConnect();
    
    const sections = await TermsConditions.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching terms & conditions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch terms & conditions', error: error.message },
      { status: 500 }
    );
  }
}

// POST new terms & conditions section
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

    const terms = new TermsConditions({
      section,
      content: content || '',
      type: type || 'paragraph',
      listItems: listItems || [],
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await terms.save();

    return NextResponse.json(terms, { status: 201 });
  } catch (error) {
    console.error('Error adding terms & conditions section:', error);
    return NextResponse.json(
      { message: 'Failed to add terms & conditions section', error: error.message },
      { status: 500 }
    );
  }
}