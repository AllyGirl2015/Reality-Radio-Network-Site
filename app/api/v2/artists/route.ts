import { NextRequest, NextResponse } from 'next/server';
import { getAllArtists, createArtist, updateArtist, deleteArtist } from '@/lib/services/artists';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { ArtistFormData } from '@/types/database';

// GET - List all artists
export async function GET() {
  try {
    const artists = await getAllArtists();
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

// POST - Create new artist
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data: ArtistFormData = await request.json();
    
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const artist = await createArtist(data);
    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 });
  }
}

// PUT - Update artist
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    const artist = await updateArtist(id, updates);
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 });
  }
}

// DELETE - Delete artist
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    const success = await deleteArtist(id);
    if (!success) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artist:', error);
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 });
  }
}
