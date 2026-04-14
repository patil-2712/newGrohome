// app/api/items/upload-image/route.js
import { NextResponse } from "next/server";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import dbConnect from "@/lib/db";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

function isAuthorized(user) {
  if (!user) return false;
  if (user.type === "company") return true;
  const allowedRoles = [
    "admin", "sales manager", "purchase manager", "inventory manager",
    "accounts manager", "hr manager", "support executive",
    "production head", "project manager",
  ];
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  return userRoles.some(role => allowedRoles.includes(role.trim().toLowerCase()));
}

async function validateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { error: "Token missing", status: 401 };
  try {
    const user = await verifyJWT(token);
    if (!user || !isAuthorized(user)) return { error: "Unauthorized", status: 403 };
    return { user };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}

// Helper function to ensure directory exists
async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

/* ========================================
   📤 POST /api/items/upload-image
   Accepts: multipart/form-data with "file" field
   Returns: { success: true, imageUrl: "/uploads/items/..." }
======================================== */
export async function POST(req) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPG, PNG, WebP, GIF allowed." },
        { status: 400 }
      );
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Get file extension
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const fileName = `item_${user.companyId}_${timestamp}${fileExtension}`;
    
    // Create directory structure: public/uploads/items/{companyId}/
    // Since you have images: { unoptimized: true } in next.config, we save in public folder
    const uploadDir = path.join(process.cwd(), "public", "uploads", "items", user.companyId);
    await ensureDirectoryExists(uploadDir);
    
    // Full file path
    const filePath = path.join(uploadDir, fileName);
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Return the URL path for frontend access (relative to public folder)
    const imageUrl = `/uploads/items/${user.companyId}/${fileName}`;

    return NextResponse.json(
      { 
        success: true, 
        imageUrl: imageUrl,
        message: "Image uploaded successfully" 
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Image upload failed" },
      { status: 500 }
    );
  }
}