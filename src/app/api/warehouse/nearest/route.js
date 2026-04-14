// app/api/warehouses/nearest/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Warehouse from "@/models/warehouseModels";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

export async function GET(req) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const companyId = searchParams.get("companyId");
    
    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        message: "Latitude and longitude required"
      }, { status: 400 });
    }
    
    // Find nearest warehouses within 100km radius
    const nearestWarehouses = await Warehouse.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat]
          },
          distanceField: "distance",
          maxDistance: 100000, // 100km in meters
          spherical: true,
          query: companyId ? { companyId: new mongoose.Types.ObjectId(companyId) } : {}
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 5 // Get top 5 nearest warehouses
      }
    ]);
    
    // If no warehouses found within radius, get all warehouses sorted by distance
    let warehouses = nearestWarehouses;
    
    if (warehouses.length === 0) {
      warehouses = await Warehouse.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lng, lat]
            },
            distanceField: "distance",
            spherical: true,
            query: companyId ? { companyId: new mongoose.Types.ObjectId(companyId) } : {}
          }
        },
        {
          $sort: { distance: 1 }
        },
        {
          $limit: 5
        }
      ]);
    }
    
    return NextResponse.json({
      success: true,
      data: warehouses,
      userLocation: { lat, lng }
    });
    
  } catch (error) {
    console.error("Nearest warehouse error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}