// src/app/api/terms-conditions/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TermsConditions from '../TermsConditions';

// GET single terms & conditions section
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const terms = await TermsConditions.findById(id);
    if (!terms) {
      return NextResponse.json(
        { message: 'Terms & conditions section not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error fetching terms & conditions section:', error);
    return NextResponse.json(
      { message: 'Failed to fetch terms & conditions section', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE terms & conditions section
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const { section, content, type, listItems, order, isActive } = await request.json();

    const terms = await TermsConditions.findById(id);
    if (!terms) {
      return NextResponse.json(
        { message: 'Terms & conditions section not found' },
        { status: 404 }
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

    // Update fields
    if (section) terms.section = section;
    if (content !== undefined) terms.content = content;
    if (type) terms.type = type;
    if (listItems !== undefined) terms.listItems = listItems;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        terms.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      terms.isActive = isActive === 'true' || isActive === true;
    }
    terms.updatedAt = new Date();

    await terms.save();

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error updating terms & conditions section:', error);
    return NextResponse.json(
      { message: 'Failed to update terms & conditions section', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE terms & conditions section
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const terms = await TermsConditions.findById(id);
    if (!terms) {
      return NextResponse.json(
        { message: 'Terms & conditions section not found' },
        { status: 404 }
      );
    }

    await terms.deleteOne();

    return NextResponse.json(
      { message: 'Terms & conditions section deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting terms & conditions section:', error);
    return NextResponse.json(
      { message: 'Failed to delete terms & conditions section', error: error.message },
      { status: 500 }
    );
  }
}