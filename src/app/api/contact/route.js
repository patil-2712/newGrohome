// src/app/api/contact/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from './Contact';

// GET all contact locations
export async function GET() {
  try {
    await dbConnect();
    
    const contacts = await Contact.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contact locations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contact locations', error: error.message },
      { status: 500 }
    );
  }
}

// POST new contact location
export async function POST(request) {
  try {
    await dbConnect();
    
    const { shopName, address, phone, order, isActive } = await request.json();

    if (!shopName || !address || address.length === 0) {
      return NextResponse.json(
        { message: 'Shop name and address are required' },
        { status: 400 }
      );
    }

    const contact = new Contact({
      shopName,
      address,
      phone: phone || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await contact.save();

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error adding contact location:', error);
    return NextResponse.json(
      { message: 'Failed to add contact location', error: error.message },
      { status: 500 }
    );
  }
}