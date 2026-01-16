import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Clock, Calendar, Tag, ArrowLeft, ExternalLink, Music } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';
import { getAlbumBySlug, getTracksByAlbum, getAllAlbums } from '@/lib/services/albums';
import { Album, Track } from '@/types/database';
import { getImageUrl } from '@/lib/storage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all albums
export async function generateStaticParams() {
  const albums = await getAllAlbums();
  return albums.map((album) => ({
    slug: album.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  
  if (!album) {
    return { title: 'Album Not Found' };
  }

  return {
    title: `${album.title} | ${album.artist_name}`,
    description: `Buy ${album.title} album by ${album.artist_name}. ${album.description}. Digital $${album.digital_price} / Physical $${album.physical_price}`,
    openGraph: {
      title: `${album.title} | ${album.artist_name}`,
      description: album.description,
      images: [getImageUrl(album.image)],
    },
  };
}

// Color mapping
const accentColors: Record<string, { border: string; text: string; bg: string; shadow: string }> = {
  purple: {
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    shadow: 'shadow-purple-500/20',
  },
  pink: {
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    shadow: 'shadow-pink-500/20',
  },
  red: {
    border: 'border-red-500/30',
    text: 'text-red-400',
    bg: 'bg-red-600',
    shadow: 'shadow-red-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    shadow: 'shadow-indigo-500/20',
  },
};

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  
  if (!album) {
    notFound();
  }

  const tracks = await getTracksByAlbum(album.id);
  const colors = accentColors[album.accent_color] || accentColors.purple;

  // Transform tracks for TracklistPlayer
  const tracklistData = tracks.map((track) => ({
    number: track.track_number,
    title: track.title,
    duration: track.duration,
    featured: track.featured,
    previewUrl: track.preview_url,
    purchaseUrl: track.purchase_url,
  }));

  return (
    <main className="min-h-screen pt-24">
      {/* Back Button */}
      <Section className="pb-0">
        <Link 
          href="/store/albums" 
          className={`inline-flex items-center gap-2 text-gray-400 hover:${colors.text} transition-colors mb-6`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Albums
        </Link>
      </Section>

      {/* Album Hero */}
      <Section className="pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Album Cover */}
          <div className="relative">
            <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${colors.border} shadow-2xl ${colors.shadow}`}>
              <Image
                src={getImageUrl(album.image)}
                alt={`${album.title} album cover`}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Quick Info Card */}
            <div className={`mt-6 bg-black/60 backdrop-blur-md border ${colors.border} rounded-lg p-6`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Released
                  </p>
                  <p className="text-white font-semibold">{album.year}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    Genre
                  </p>
                  <p className="text-white font-semibold">{album.genre}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Music className="w-4 h-4" aria-hidden="true" />
                    Tracks
                  </p>
                  <p className="text-white font-semibold">{tracks.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </p>
                  <p className="text-white font-semibold">{album.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Album Info */}
          <div>
            <p className={`${colors.text} font-medium mb-2`}>
              <Link href={`/talent/${album.artist_slug}`} className="hover:underline">
                {album.artist_name}
              </Link>
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{album.title}</h1>
            <p className="text-gray-300 text-lg mb-8">{album.description}</p>

            {/* Catalog Number */}
            <p className="text-gray-500 text-sm mb-6">Catalog: {album.catalog}</p>

            {/* Purchase Options */}
            <div className="space-y-4">
              {/* Digital */}
              <a
                href={album.digital_buy_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-lg border ${colors.border} bg-black/40 hover:bg-black/60 transition-colors group`}
              >
                <div>
                  <p className="text-white font-semibold">Digital Download</p>
                  <p className="text-gray-400 text-sm">MP3 320kbps</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${colors.text} text-xl font-bold`}>${album.digital_price.toFixed(2)}</span>
                  <ShoppingCart className={`w-5 h-5 ${colors.text} group-hover:scale-110 transition-transform`} />
                </div>
              </a>

              {/* Physical */}
              <a
                href={album.physical_buy_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-lg border ${colors.border} bg-black/40 hover:bg-black/60 transition-colors group`}
              >
                <div>
                  <p className="text-white font-semibold">Physical CD</p>
                  <p className="text-gray-400 text-sm">Includes digital download</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${colors.text} text-xl font-bold`}>${album.physical_price.toFixed(2)}</span>
                  <ShoppingCart className={`w-5 h-5 ${colors.text} group-hover:scale-110 transition-transform`} />
                </div>
              </a>
            </div>

            {/* Streaming Links */}
            {album.streaming_links && Object.keys(album.streaming_links).length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-semibold mb-4">Also available on:</h3>
                <div className="flex flex-wrap gap-3">
                  {album.streaming_links.spotify && (
                    <a
                      href={album.streaming_links.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-green-500 transition-colors flex items-center gap-2"
                    >
                      Spotify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {album.streaming_links.apple_music && (
                    <a
                      href={album.streaming_links.apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-pink-500 transition-colors flex items-center gap-2"
                    >
                      Apple Music <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {album.streaming_links.youtube_music && (
                    <a
                      href={album.streaming_links.youtube_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-red-500 transition-colors flex items-center gap-2"
                    >
                      YouTube Music <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Tracklist */}
      {tracks.length > 0 && (
        <Section>
          <h2 className="text-2xl font-bold text-white mb-6">Tracklist</h2>
          <TracklistPlayer 
            tracks={tracklistData} 
            accentColor={album.accent_color as 'purple' | 'pink' | 'red' | 'indigo'}
          />
        </Section>
      )}
    </main>
  );
}
