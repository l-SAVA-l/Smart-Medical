import { NextResponse } from 'next/server';
import { getServicesMenuFromDB } from '@/lib/getServicesMenu';

// GET - получение динамического меню услуг
export async function GET() {
  try {
    const menuData = await getServicesMenuFromDB();
    return NextResponse.json({ menuData: menuData ?? [] });
  } catch (error) {
    console.error('Error fetching services menu:', error);
    return NextResponse.json({ menuData: [] }, { status: 200 });
  }
}
