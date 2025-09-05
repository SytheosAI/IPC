import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  
  return NextResponse.json({
    success: !!accessToken,
    hasToken: !!accessToken,
    message: accessToken ? 'Authenticated' : 'No auth token found'
  });
}