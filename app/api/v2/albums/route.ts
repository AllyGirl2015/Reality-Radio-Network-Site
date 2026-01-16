import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllAlbums, 
  getAlbumById, 
  createAlbum, 
  updateAlbum, 
  deleteAlbum,
  getTracksByAlbum,
  bulkCreateTracks,
  deleteTrack
} from '@/lib/services/albums';
import { getArtistById } from '@/lib/services/artists';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { AlbumFormData, TrackFormData } from '@/types/database';

// GET - List all albums
export async function GET() {
  try {
    const albums = await getAllAlbums();
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

// POST - Create new album
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const { tracks, ...albumData } = data;
    
    // Get artist info
    const artist = await getArtistById(albumData.artist_id);
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Create album
    const album = await createAlbum(albumData as AlbumFormData, artist.name, artist.slug);
    
    // Create tracks if provided
    if (album && tracks && tracks.length > 0) {
      const trackData: TrackFormData[] = tracks.map((track: TrackFormData, index: number) => ({
        ...track,
        album_id: album.id,
        track_number: track.track_number || index + 1,
      }));
      await bulkCreateTracks(trackData);
    }

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
}

// PUT - Update album
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    const { id, tracks, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const album = await updateAlbum(id, updates);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

// DELETE - Delete album
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const success = await deleteAlbum(id);
    if (!success) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
