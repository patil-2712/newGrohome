import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OTP from "./OTP";
import twilio from "twilio";

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  await dbConnect();

  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    // Delete any existing OTP for this phone
    await OTP.deleteMany({ phone: phone });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      phone: phone,
      otp: otp,
      expiresAt: expiresAt,
    });

    console.log(`\n========== OTP REQUEST ==========`);
    console.log(`Phone: +91${phone}`);
    console.log(`OTP: ${otp}`);
    console.log(`=====================================\n`);

    // Send SMS via Twilio
    try {
      const message = await client.messages.create({
        body: `Your Gruham login OTP is ${otp}. Valid for 10 minutes.`,
        to: `+91${phone}`,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      console.log("Twilio Message SID:", message.sid);
      console.log("Twilio Message Status:", message.status);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your mobile number",
      });
    } catch (twilioError) {
      console.error("Twilio Error:", twilioError);
      
      // Return OTP for testing if Twilio fails
      return NextResponse.json({
        success: true,
        message: `[TEST] OTP: ${otp} (Check console)`,
        devMode: true,
        otp: otp,
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}