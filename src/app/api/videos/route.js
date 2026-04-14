// src/app/api/videos/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import Video from './Video';

// GET all videos
export async function GET() {
  try {
    await dbConnect();
    
    const videos = await Video.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { message: 'Failed to fetch videos', error: error.message },
      { status: 500 }
    );
  }
}

// POST new video with file upload
export async function POST(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('video');
    const title = formData.get('title');
    const description = formData.get('description');
    const order = formData.get('order');
    const isActive = formData.get('isActive');

    if (!file || !title) {
      return NextResponse.json(
        { message: 'Title and video file are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid video format. Please upload MP4, WebM, or OGG video.' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Video file too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/videos');
    await mkdir(uploadDir, { recursive: true });

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
    const videoUrl = `/uploads/videos/${filename}`;

    // Generate thumbnail (you can add a thumbnail generation library later)
    const thumbnail = `/uploads/videos/${filename}.jpg`; // Placeholder

    // Create video in database
    const video = new Video({
      title,
      description: description || '',
      videoUrl,
      thumbnail,
      fileSize: file.size,
      order: order ? parseInt(order) : 0,
      isActive: isActive === 'true' || isActive === true
    });

    await video.save();

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { message: 'Failed to upload video', error: error.message },
      { status: 500 }
    );
  }
}