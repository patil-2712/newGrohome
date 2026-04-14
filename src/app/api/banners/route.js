// src/app/api/banners/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from './Banner';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET all banners
export async function GET() {
  try {
    // Ensure database connection is established
    await dbConnect();
    
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch banners', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// POST new banner
export async function POST(req) {
  try {
    // Ensure database connection is established
    await dbConnect();
    
    const formData = await req.formData();
    const file = formData.get('image');
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const buttonText = formData.get('buttonText');
    const buttonLink = formData.get('buttonLink');

    if (!file || !title) {
      return NextResponse.json(
        { message: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('Upload directory already exists or created');
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeFilename}`;
    const filepath = path.join(uploadDir, filename);
    
    // Save file
    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    // Create banner in database
    const banner = new Banner({
      title,
      subtitle: subtitle || '',
      imageUrl,
      buttonText: buttonText || "ORDER NOW",
      buttonLink: buttonLink || "/shop",
      order: 0,
      isActive: true
    });

    await banner.save();

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error uploading banner:', error);
    return NextResponse.json(
      { 
        message: 'Failed to upload banner', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}