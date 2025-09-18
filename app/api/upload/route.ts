import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logSuspiciousFileAccess } from '@/lib/auth-security-integration';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Get client IP for security monitoring
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // TODO: Get actual user ID from session
    const userId = 'user-upload';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Security checks for suspicious files
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs'];
    const fileName = file.name.toLowerCase();
    const isExecutable = suspiciousExtensions.some(ext => fileName.endsWith(ext));
    
    if (isExecutable) {
      await logSuspiciousFileAccess(userId, file.name, ip, 'Attempted to upload executable file');
      return NextResponse.json(
        { error: 'File type not allowed for security reasons' },
        { status: 403 }
      );
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      await logSuspiciousFileAccess(userId, file.name, ip, `Large file upload attempt: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // For now, return the base64 data URL
    // In production, you'd upload to a storage service like Supabase Storage
    return NextResponse.json({ 
      url: base64,
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}