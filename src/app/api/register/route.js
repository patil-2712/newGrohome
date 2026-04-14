import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import EcommerceUser from './EcommerceUser';

export async function POST(req) {
  await dbConnect();
  
  try {
    const { 
      fullName, phone, addresses, defaultAddress 
    } = await req.json();
    
    console.log("Registration request:", { fullName, phone, addressesCount: addresses?.length });
    
    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Name is required" 
      }, { status: 400 });
    }
    
    if (!phone || !phone.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Phone number is required" 
      }, { status: 400 });
    }
    
    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid phone number. Please enter 10 digits." 
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await EcommerceUser.findOne({ phone });
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User already exists with this phone number. Please login." 
      }, { status: 400 });
    }
    
    // Generate customer code
    const lastUser = await EcommerceUser.findOne({ customerCode: { $exists: true, $ne: null } })
      .sort({ customerCode: -1 })
      .limit(1);
    
    let nextNumber = 1;
    if (lastUser && lastUser.customerCode) {
      const match = lastUser.customerCode.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    const customerCode = `CUST${String(nextNumber).padStart(6, '0')}`;
    
    console.log("Generated customer code:", customerCode);
    
    // Prepare addresses with proper structure
    const formattedAddresses = (addresses || []).map(addr => ({
      type: addr.type || 'home',
      label: addr.label || addr.type || 'Home',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      isDefault: addr.isDefault || false,
      location: addr.location || null
    }));
    
    // Create ecommerce user
    const user = await EcommerceUser.create({
      name: fullName.trim(),
      phone: phone.trim(),
      customerCode,
      roles: ["customer"],
      type: "customer",
      status: "active",
      addresses: formattedAddresses,
      defaultAddress: defaultAddress || formattedAddresses.find(a => a.isDefault) || formattedAddresses[0] || null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Ecommerce user created successfully:", user._id);
    
    // Generate token for auto-login
    const token = jwt.sign(
      { 
        id: user._id, 
        phone: user.phone, 
        type: user.type,
        name: user.name,
        roles: user.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Prepare response
    const userResponse = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      customerCode: user.customerCode,
      addresses: user.addresses,
      defaultAddress: user.defaultAddress,
      location: user.location,
      isVerified: user.isVerified,
      roles: user.roles,
      type: user.type,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      token,
      user: userResponse
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Phone number already registered. Please login instead." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Registration failed. Please try again." 
    }, { status: 500 });
  }
}