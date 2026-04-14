// src/app/api/banners/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '../Banner';
import { unlink, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET single banner
export async function GET(req, { params }) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;
    
    await dbConnect();
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { message: 'Failed to fetch banner', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE banner
export async function PUT(req, { params }) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;
    
    await dbConnect();
    
    const formData = await req.formData();
    const file = formData.get('image');
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const buttonText = formData.get('buttonText');
    const buttonLink = formData.get('buttonLink');
    const order = formData.get('order');
    const isActive = formData.get('isActive');

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }

    let imageUrl = banner.imageUrl;

    // If new image uploaded
    if (file && file.size > 0) {
      // Delete old image
      const oldImagePath = path.join(process.cwd(), 'public', banner.imageUrl);
      try {
        await unlink(oldImagePath);
      } catch (err) {
        console.log('Old image not found:', err.message);
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await mkdir(uploadDir, { recursive: true });

      // Save new image
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Update banner fields with proper validation
    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (buttonText) banner.buttonText = buttonText;
    if (buttonLink) banner.buttonLink = buttonLink;
    
    // Fix order field - handle NaN case
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        banner.order = parsedOrder;
      }
    }
    
    // Fix isActive field
    if (isActive !== undefined) {
      banner.isActive = isActive === 'true' || isActive === true;
    }
    
    banner.imageUrl = imageUrl;
    banner.updatedAt = new Date();

    await banner.save();

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { message: 'Failed to update banner', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE banner
export async function DELETE(req, { params }) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;
    
    await dbConnect();
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete image file
    const imagePath = path.join(process.cwd(), 'public', banner.imageUrl);
    try {
      await unlink(imagePath);
    } catch (err) {
      console.log('Image not found:', err.message);
    }

    await banner.deleteOne();

    return NextResponse.json(
      { message: 'Banner deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { message: 'Failed to delete banner', error: error.message },
      { status: 500 }
    );
  }
}