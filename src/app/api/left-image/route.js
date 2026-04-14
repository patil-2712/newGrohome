// src/app/api/left-image/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import LeftImage from './LeftImage';

// GET left image
export async function GET() {
  try {
    await dbConnect();
    
    let leftImage = await LeftImage.findOne();
    
    if (!leftImage) {
      // Create default if none exists
      leftImage = new LeftImage({
        imageUrl: "/maker15.jpg",
        alt: "Featured collection"
      });
      await leftImage.save();
    }
    
    return NextResponse.json(leftImage);
  } catch (error) {
    console.error('Error fetching left image:', error);
    return NextResponse.json(
      { message: 'Failed to fetch left image', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE left image
export async function PUT(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const alt = formData.get('alt');

    let leftImage = await LeftImage.findOne();
    
    if (!leftImage) {
      leftImage = new LeftImage();
    }

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { message: 'Invalid image format. Please upload JPG, PNG, or WEBP.' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { message: 'Image too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      // Delete old image if it exists and is not default
      if (leftImage.imageUrl && leftImage.imageUrl !== "/maker15.jpg" && 
          !leftImage.imageUrl.startsWith('/maker15.jpg')) {
        const oldImagePath = path.join(process.cwd(), 'public', leftImage.imageUrl);
        try {
          await unlink(oldImagePath);
        } catch (err) {
          console.log('Old image not found:', err.message);
        }
      }

      // Create uploads directory
      const uploadDir = path.join(process.cwd(), 'public/uploads/left-image');
      await mkdir(uploadDir, { recursive: true });

      // Save new image
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      const imageUrl = `/uploads/left-image/${filename}`;

      leftImage.imageUrl = imageUrl;
    }

    // Update alt text
    if (alt) {
      leftImage.alt = alt;
    }
    
    leftImage.updatedAt = new Date();
    await leftImage.save();

    return NextResponse.json(leftImage);
  } catch (error) {
    console.error('Error updating left image:', error);
    return NextResponse.json(
      { message: 'Failed to update left image', error: error.message },
      { status: 500 }
    );
  }
}