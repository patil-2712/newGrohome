import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Wishlist from "./Wishlist";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// GET - Fetch user's wishlist
export async function GET(req) {
  await dbConnect();

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: user.id });
    
    if (!wishlist) {
      wishlist = { userId: user.id, items: [] };
    }

    return NextResponse.json({
      success: true,
      data: wishlist.items || [],
    });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(req) {
  await dbConnect();

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { productId, name, price, img } = await req.json();

    // Validate required fields
    if (!productId || !name || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Product ID, name, and price are required" },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: user.id, items: [] });
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: "Item already in wishlist" },
        { status: 400 }
      );
    }

    // Add new item
    wishlist.items.push({
      productId,
      name,
      price,
      img: img || "",
      addedAt: new Date(),
    });

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      data: wishlist.items,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req) {
  await dbConnect();

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, message: "Wishlist not found" },
        { status: 404 }
      );
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist.items,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}