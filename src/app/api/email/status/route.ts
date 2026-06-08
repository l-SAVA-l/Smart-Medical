import { NextResponse } from 'next/server';
import { isEmailConfigured } from '@/lib/email/config';

export async function GET() {
  return NextResponse.json({ configured: isEmailConfigured() });
}
