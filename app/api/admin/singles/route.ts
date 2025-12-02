import { NextRequest, NextResponse } from 'next/server';
import { getAllSingles, getSingleById, createSingle, updateSingle, deleteSingle } from '@/lib/database';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

// GET - List all singles
export async function GET() {
  try {
    const singles = getAllSingles();
    return NextResponse.json(singles);
  } catch (error) {
    console.error('Error fetching singles:', error);
    return NextResponse.json({ error: 'Failed to fetch singles' }, { status: 500 });
  }
}

// POST - Create new single
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const single = createSingle(data);
    return NextResponse.json(single, { status: 201 });
  } catch (error) {
    console.error('Error creating single:', error);
    return NextResponse.json({ error: 'Failed to create single' }, { status: 500 });
  }
}

// PUT - Update single
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Single ID is required' }, { status: 400 });
    }

    const single = updateSingle(id, updates);
    if (!single) {
      return NextResponse.json({ error: 'Single not found' }, { status: 404 });
    }

    return NextResponse.json(single);
  } catch (error) {
    console.error('Error updating single:', error);
    return NextResponse.json({ error: 'Failed to update single' }, { status: 500 });
  }
}

// DELETE - Delete single
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Single ID is required' }, { status: 400 });
    }

    const success = deleteSingle(id);
    if (!success) {
      return NextResponse.json({ error: 'Single not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting single:', error);
    return NextResponse.json({ error: 'Failed to delete single' }, { status: 500 });
  }
}
