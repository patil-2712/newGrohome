// src/app/api/videos/[id]/route.js
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import Video from '../Video';

// GET single video
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { message: 'Failed to fetch video', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE video
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('video');
    const title = formData.get('title');
    const description = formData.get('description');
    const order = formData.get('order');
    const isActive = formData.get('isActive');

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    let videoUrl = video.videoUrl;

    // If new video uploaded
    if (file && file.size > 0) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: 'Invalid video format' },
          { status: 400 }
        );
      }

      // Delete old video file
      const oldVideoPath = path.join(process.cwd(), 'public', video.videoUrl);
      try {
        await unlink(oldVideoPath);
      } catch (err) {
        console.log('Old video not found:', err.message);
      }

      // Save new video
      const uploadDir = path.join(process.cwd(), 'public/uploads/videos');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      videoUrl = `/uploads/videos/${filename}`;
      
      video.fileSize = file.size;
    }

    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (order !== undefined && order !== null && order !== '') {
      const parsedOrder = parseInt(order);
      if (!isNaN(parsedOrder)) {
        video.order = parsedOrder;
      }
    }
    if (isActive !== undefined) {
      video.isActive = isActive === 'true' || isActive === true;
    }
    video.videoUrl = videoUrl;
    video.updatedAt = new Date();

    await video.save();

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { message: 'Failed to update video', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE video
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete video file
    const videoPath = path.join(process.cwd(), 'public', video.videoUrl);
    try {
      await unlink(videoPath);
    } catch (err) {
      console.log('Video file not found:', err.message);
    }

    await video.deleteOne();

    return NextResponse.json(
      { message: 'Video deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { message: 'Failed to delete video', error: error.message },
      { status: 500 }
    );
  }
}