import { NextRequest, NextResponse } from 'next/server';
import { getTracksByAlbum, createTrack, updateTrack, deleteTrack, bulkCreateTracks } from '@/lib/services/albums';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { TrackFormData } from '@/types/database';

// GET - List tracks for an album
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    
    if (!albumId) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const tracks = await getTracksByAlbum(albumId);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

// POST - Create new track or bulk create
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    
    // Check if bulk creation
    if (Array.isArray(data)) {
      const tracks = await bulkCreateTracks(data as TrackFormData[]);
      return NextResponse.json(tracks, { status: 201 });
    }

    // Single track creation
    const track = await createTrack(data as TrackFormData);
    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error('Error creating track:', error);
    return NextResponse.json({ error: 'Failed to create track' }, { status: 500 });
  }
}

// PUT - Update track
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    const track = await updateTrack(id, updates);
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  }
}

// DELETE - Delete track
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    const success = await deleteTrack(id);
    if (!success) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}
