// src/app/api/contact/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '../Contact';

// GET single contact location
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json(
        { message: 'Contact location not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact location:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contact location', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE contact location
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const { shopName, address, phone, order, isActive } = await request.json();

    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json(
        { message: 'Contact location not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (shopName) contact.shopName = shopName;
    if (address && address.length > 0) contact.address = address;
    if (phone !== undefined) contact.phone = phone;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        contact.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      contact.isActive = isActive === 'true' || isActive === true;
    }
    contact.updatedAt = new Date();

    await contact.save();

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact location:', error);
    return NextResponse.json(
      { message: 'Failed to update contact location', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE contact location
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json(
        { message: 'Contact location not found' },
        { status: 404 }
      );
    }

    await contact.deleteOne();

    return NextResponse.json(
      { message: 'Contact location deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting contact location:', error);
    return NextResponse.json(
      { message: 'Failed to delete contact location', error: error.message },
      { status: 500 }
    );
  }
}