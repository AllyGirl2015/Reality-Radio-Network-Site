import { NextResponse } from 'next/server';
import { getSearchData } from '@/lib/database';

// GET - Get all searchable data
export async function GET() {
  try {
    const searchData = getSearchData();
    return NextResponse.json(searchData);
  } catch (error) {
    console.error('Error fetching search data:', error);
    return NextResponse.json({ error: 'Failed to fetch search data' }, { status: 500 });
  }
}
