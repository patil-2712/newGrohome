// src/app/api/privacy-policy/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrivacyPolicy from '../PrivacyPolicy';

// GET single privacy policy section
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const policy = await PrivacyPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Privacy policy section not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error fetching privacy policy section:', error);
    return NextResponse.json(
      { message: 'Failed to fetch privacy policy section', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE privacy policy section
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const { section, content, type, listItems, order, isActive } = await request.json();

    const policy = await PrivacyPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Privacy policy section not found' },
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
    if (section) policy.section = section;
    if (content !== undefined) policy.content = content;
    if (type) policy.type = type;
    if (listItems !== undefined) policy.listItems = listItems;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        policy.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      policy.isActive = isActive === 'true' || isActive === true;
    }
    policy.updatedAt = new Date();

    await policy.save();

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error updating privacy policy section:', error);
    return NextResponse.json(
      { message: 'Failed to update privacy policy section', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE privacy policy section
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const policy = await PrivacyPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Privacy policy section not found' },
        { status: 404 }
      );
    }

    await policy.deleteOne();

    return NextResponse.json(
      { message: 'Privacy policy section deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting privacy policy section:', error);
    return NextResponse.json(
      { message: 'Failed to delete privacy policy section', error: error.message },
      { status: 500 }
    );
  }
}