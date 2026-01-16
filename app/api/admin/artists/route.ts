import { NextRequest, NextResponse } from 'next/server';
import { getAllArtists, createArtist, getArtistById, updateArtist, deleteArtist } from '@/lib/services/artists';
import { ArtistFormData } from '@/types/database';

// Verificação de autenticação simples
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  
  const token = authHeader.split(' ')[1];
  return token === process.env.ADMIN_SECRET_KEY;
}

// GET - Listar todos os artistas
export async function GET(request: NextRequest) {
  try {
    const artists = await getAllArtists();
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

// POST - Criar novo artista
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ArtistFormData = await request.json();
    
    // Validação básica
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const artist = await createArtist(body);
    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 });
  }
}

// PUT - Atualizar artista
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...formData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    const artist = await updateArtist(id, formData);
    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 });
  }
}

// DELETE - Deletar artista
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    await deleteArtist(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artist:', error);
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 });
  }
}
