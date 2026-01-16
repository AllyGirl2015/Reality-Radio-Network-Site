import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Clock, Calendar, Tag, ArrowLeft, ExternalLink, Play, Disc } from 'lucide-react';
import Section from '@/components/Section';
import MusicPreviewPlayer from '@/components/MusicPreviewPlayer';
import { getSingleBySlug, getAllSingles } from '@/lib/services/singles';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all singles
export async function generateStaticParams() {
  const singles = await getAllSingles();
  return singles.map((single) => ({
    slug: single.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const single = await getSingleBySlug(slug);
  
  if (!single) {
    return { title: 'Single Not Found' };
  }

  return {
    title: `${single.title} | ${single.artist_name}`,
    description: `Buy ${single.title} by ${single.artist_name}. ${single.description}. $${single.price}`,
    openGraph: {
      title: `${single.title} | ${single.artist_name}`,
      description: single.description,
      images: single.image ? [single.image] : [],
    },
  };
}

// Color mapping
const accentColors: Record<string, { border: string; text: string; bg: string; shadow: string; hover: string }> = {
  purple: {
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    shadow: 'shadow-purple-500/20',
    hover: 'hover:border-purple-500',
  },
  pink: {
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    shadow: 'shadow-pink-500/20',
    hover: 'hover:border-pink-500',
  },
  red: {
    border: 'border-red-500/30',
    text: 'text-red-400',
    bg: 'bg-red-600',
    shadow: 'shadow-red-500/20',
    hover: 'hover:border-red-500',
  },
  indigo: {
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    shadow: 'shadow-indigo-500/20',
    hover: 'hover:border-indigo-500',
  },
};

export default async function SinglePage({ params }: PageProps) {
  const { slug } = await params;
  const single = await getSingleBySlug(slug);
  
  if (!single) {
    notFound();
  }

  const colors = accentColors[single.accent_color] || accentColors.purple;

  return (
    <main className="min-h-screen pt-24">
      {/* Back Button */}
      <Section className="pb-0">
        <Link 
          href="/store/singles" 
          className={`inline-flex items-center gap-2 text-gray-400 hover:${colors.text} transition-colors mb-6`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Singles
        </Link>
      </Section>

      {/* Single Hero */}
      <Section className="pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Single Cover */}
          <div className="relative">
            <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${colors.border} shadow-2xl ${colors.shadow}`}>
              {single.image ? (
                <Image
                  src={single.image}
                  alt={`${single.title} single cover`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                  <Disc className="w-24 h-24 text-white/50" />
                </div>
              )}
            </div>
            
            {/* Quick Info Card */}
            <div className={`mt-6 bg-black/60 backdrop-blur-md border ${colors.border} rounded-lg p-6`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Released
                  </p>
                  <p className="text-white font-semibold">{single.year}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    Genre
                  </p>
                  <p className="text-white font-semibold">{single.genre}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </p>
                  <p className="text-white font-semibold">{single.duration}</p>
                </div>
                {single.album_title && (
                  <div>
                    <p className="text-gray-400 mb-1 flex items-center gap-2">
                      <Disc className="w-4 h-4" aria-hidden="true" />
                      From Album
                    </p>
                    <Link 
                      href={`/store/albums/${single.album_slug}`}
                      className={`${colors.text} font-semibold hover:underline`}
                    >
                      {single.album_title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Single Info */}
          <div>
            <p className={`${colors.text} font-medium mb-2`}>
              <Link href={`/talent/${single.artist_slug}`} className="hover:underline">
                {single.artist_name}
              </Link>
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{single.title}</h1>
            <p className="text-gray-300 text-lg mb-8">{single.description}</p>

            {/* Catalog Number */}
            <p className="text-gray-500 text-sm mb-6">Catalog: {single.catalog}</p>

            {/* Preview Player */}
            {single.preview_url && (
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4">Preview</h3>
                <MusicPreviewPlayer 
                  previewUrl={single.preview_url} 
                  trackTitle={single.title}
                  artist={single.artist_name}
                />
              </div>
            )}

            {/* Purchase */}
            <a
              href={single.buy_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-lg border ${colors.border} bg-black/40 hover:bg-black/60 transition-colors group`}
            >
              <div>
                <p className="text-white font-semibold">Digital Download</p>
                <p className="text-gray-400 text-sm">MP3 320kbps</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`${colors.text} text-xl font-bold`}>${single.price.toFixed(2)}</span>
                <ShoppingCart className={`w-5 h-5 ${colors.text} group-hover:scale-110 transition-transform`} />
              </div>
            </a>

            {/* Streaming Links */}
            {single.streaming_links && Object.keys(single.streaming_links).length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-semibold mb-4">Also available on:</h3>
                <div className="flex flex-wrap gap-3">
                  {single.streaming_links.spotify && (
                    <a
                      href={single.streaming_links.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-green-500 transition-colors flex items-center gap-2"
                    >
                      Spotify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {single.streaming_links.apple_music && (
                    <a
                      href={single.streaming_links.apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-pink-500 transition-colors flex items-center gap-2"
                    >
                      Apple Music <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {single.streaming_links.youtube_music && (
                    <a
                      href={single.streaming_links.youtube_music}
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
    </main>
  );
}
