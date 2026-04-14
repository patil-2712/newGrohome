// src/app/api/refund-policy/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RefundPolicy from '../RefundPolicy';

// GET single refund policy section
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const policy = await RefundPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Refund policy section not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error fetching refund policy section:', error);
    return NextResponse.json(
      { message: 'Failed to fetch refund policy section', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE refund policy section
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const { section, content, type, listItems, order, isActive } = await request.json();

    const policy = await RefundPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Refund policy section not found' },
        { status: 404 }
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
    console.error('Error updating refund policy section:', error);
    return NextResponse.json(
      { message: 'Failed to update refund policy section', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE refund policy section
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const policy = await RefundPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { message: 'Refund policy section not found' },
        { status: 404 }
      );
    }

    await policy.deleteOne();

    return NextResponse.json(
      { message: 'Refund policy section deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting refund policy section:', error);
    return NextResponse.json(
      { message: 'Failed to delete refund policy section', error: error.message },
      { status: 500 }
    );
  }
}