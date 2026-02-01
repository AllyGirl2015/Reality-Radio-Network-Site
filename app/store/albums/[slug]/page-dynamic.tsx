import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';
import { getAlbumBySlug, getAllAlbums, Album } from '@/lib/database';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  
  if (!album) {
    return { title: 'Album Not Found' };
  }

  return {
    title: `${album.title} | ${album.artist}`,
    description: `Buy ${album.title} album by ${album.artist}. ${album.description}. Digital $${album.digitalPrice} / Physical $${album.physicalPrice}`,
  };
}

export async function generateStaticParams() {
  const albums = getAllAlbums();
  return albums.map((album) => ({
    slug: album.slug,
  }));
}

// Color configurations for different artists
const colorConfig = {
  purple: {
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400',
    text: 'text-purple-400',
    gradient: 'from-cyan-400 to-purple-500',
    gradientAlt: 'from-purple-400 to-cyan-400',
    bg: 'bg-purple-500/20',
    shadow: 'shadow-purple-500/20',
    btn: 'btn-neon-purple',
  },
  pink: {
    border: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-400',
    text: 'text-pink-400',
    gradient: 'from-pink-400 to-purple-500',
    gradientAlt: 'from-purple-400 to-pink-400',
    bg: 'bg-pink-500/20',
    shadow: 'shadow-pink-500/20',
    btn: 'btn-neon-pink',
  },
  red: {
    border: 'border-red-500/30',
    hoverBorder: 'hover:border-red-400',
    text: 'text-red-400',
    gradient: 'from-red-400 to-orange-500',
    gradientAlt: 'from-orange-400 to-red-400',
    bg: 'bg-red-500/20',
    shadow: 'shadow-red-500/20',
    btn: 'btn-neon-red',
  },
  indigo: {
    border: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-400',
    text: 'text-indigo-400',
    gradient: 'from-indigo-400 to-purple-500',
    gradientAlt: 'from-purple-400 to-indigo-400',
    bg: 'bg-indigo-500/20',
    shadow: 'shadow-indigo-500/20',
    btn: 'btn-neon-indigo',
  },
};

export default async function DynamicAlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  const colors = colorConfig[album.accentColor] || colorConfig.purple;

  return (
    <main className="min-h-screen pt-24">
      {/* Back Button */}
      <Section className="pb-0">
        <Link 
          href="/store/albums" 
          className={`inline-flex items-center gap-2 text-gray-400 ${colors.hoverBorder.replace('hover:border', 'hover:text')} transition-colors mb-6`}
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
              {album.image ? (
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Music className={`w-24 h-24 ${colors.text}`} />
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
                  <p className="text-white font-semibold">{album.tracklist.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </p>
                  <p className="text-white font-semibold">{album.duration}</p>
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${colors.border}`}>
                <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                <p className="text-xs text-gray-400">© Reality Radio Network</p>
              </div>
            </div>
          </div>

          {/* Album Details */}
          <div>
            {album.featured && (
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 ${colors.bg} border ${colors.border} rounded-full text-xs font-semibold ${colors.text}`}>
                  FEATURED ALBUM
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                {album.title}
              </span>
            </h1>

            <p className="text-2xl text-gray-300 mb-6">{album.artist}</p>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {album.description}
            </p>

            {/* Purchase Options */}
            <div className="space-y-4 mb-8">
              <div className={`bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border ${colors.border} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Digital Download</h3>
                    <p className="text-sm text-gray-400">Instant delivery • MP3/WAV formats</p>
                  </div>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${colors.gradientAlt} bg-clip-text text-transparent`}>
                    ${album.digitalPrice}
                  </p>
                </div>
                <a 
                  href={album.digitalBuyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full ${colors.btn} flex items-center justify-center gap-2`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Digital Album
                </a>
              </div>

              <div className={`bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border ${colors.border} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Physical CD</h3>
                    <p className="text-sm text-gray-400">Handmade • Ships in 1-2 weeks</p>
                  </div>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                    ${album.physicalPrice}
                  </p>
                </div>
                <a 
                  href={album.physicalBuyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Physical CD
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/radio" className={`flex-1 px-6 py-3 border ${colors.border} rounded-lg text-center ${colors.text} hover:bg-purple-500/10 ${colors.hoverBorder} transition-all duration-300 flex items-center justify-center gap-2`}>
                <Play className="w-5 h-5" aria-hidden="true" />
                Listen on Radio
              </Link>
              <Link href={`/talent/${album.artistSlug}`} className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
                View Artist
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Tracklist */}
      <Section background="solid">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Music className={`w-8 h-8 ${colors.text}`} aria-hidden="true" />
          <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>Tracklist</span>
        </h2>

        <p className="text-gray-400 text-sm mb-6">
          Click the play button to hear the full track.
        </p>

        <TracklistPlayer
          tracks={album.tracklist}
          artist={album.artist}
          previewDuration={0}
          accentColor={album.accentColor}
        />

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Total Duration: <span className="text-white font-semibold">{album.duration}</span>
          </p>
        </div>
      </Section>

      {/* Additional Info */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-2xl font-bold mb-6 text-center bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            About This Album
          </h2>

          <div className={`bg-black/40 border ${colors.border} rounded-lg p-6 space-y-4 text-gray-300`}>
            <p className="leading-relaxed">
              {album.description}
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link href="/licensing" className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-center">
              <ExternalLink className="w-8 h-8 text-cyan-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Need a License?</h3>
              <p className="text-sm text-gray-400">Use this music in your projects</p>
            </Link>

            <Link href="/contact" className={`bg-black/40 border ${colors.border} rounded-lg p-6 ${colors.hoverBorder} hover:shadow-lg ${colors.shadow} transition-all duration-300 text-center`}>
              <Music className={`w-8 h-8 ${colors.text} mx-auto mb-3`} aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Questions?</h3>
              <p className="text-sm text-gray-400">Contact our team</p>
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
