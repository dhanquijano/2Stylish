import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    
    // Test reset link
    const testResetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=test-token-123`;
    
    console.log('Testing password reset email...');
    console.log('Sending to:', email);
    console.log('Reset link:', testResetLink);
    
    const emailSent = await sendPasswordResetEmail(email, testResetLink, 'Test User');
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Password reset email sent successfully to ${email}`,
        testResetLink,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email. Check server logs for details.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
