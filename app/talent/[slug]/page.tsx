import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Music, Play, ShoppingBag, Disc, ArrowLeft, User } from 'lucide-react';
import Section from '@/components/Section';
import { notFound } from 'next/navigation';
import { getArtistBySlug, getAllArtists } from '@/lib/services/artists';
import { getAlbumsByArtist } from '@/lib/services/albums';
import { getSinglesByArtist } from '@/lib/services/singles';
import { getImageUrl } from '@/lib/storage';
import { AlbumCard, SingleCard } from '@/components/cards';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all artists
export async function generateStaticParams() {
  const artists = await getAllArtists();
  return artists.map((artist) => ({
    slug: artist.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  
  if (!artist) {
    return { title: 'Artist Not Found' };
  }

  return {
    title: `${artist.name} | Talent Profile`,
    description: artist.bio,
    openGraph: {
      title: `${artist.name} | Reality Radio Network`,
      description: artist.bio,
      images: artist.image ? [artist.image] : [],
    },
  };
}

// Color mapping
const accentColors: Record<string, { border: string; text: string; bg: string; gradient: string }> = {
  purple: {
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    gradient: 'from-purple-500/20 to-purple-900/40',
  },
  pink: {
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    gradient: 'from-pink-500/20 to-pink-900/40',
  },
  red: {
    border: 'border-red-500/30',
    text: 'text-red-400',
    bg: 'bg-red-600',
    gradient: 'from-red-500/20 to-red-900/40',
  },
  indigo: {
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    gradient: 'from-indigo-500/20 to-indigo-900/40',
  },
};

export default async function TalentPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch artist and their content in parallel
  const artist = await getArtistBySlug(slug);
  
  if (!artist) {
    notFound();
  }

  const [albums, singles] = await Promise.all([
    getAlbumsByArtist(artist.id),
    getSinglesByArtist(artist.id),
  ]);

  const colors = accentColors[(artist as any).accentColor ?? (artist as any).accent_color] || accentColors.purple;
  const artistImage = getImageUrl((artist as any).image ?? (artist as any).image);

  // Get featured singles (limit to 5)
  const featuredSingles = singles.filter(s => s.featured).slice(0, 5);

  return (
    <main className="min-h-screen pt-24">
      {/* Back Button */}
      <Section className="pb-0">
        <Link 
          href="/talent" 
          className={`inline-flex items-center gap-2 text-gray-400 hover:${colors.text} transition-colors mb-6`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to All Talents
        </Link>
      </Section>

      {/* Hero */}
      <Section className="pb-12" background="grid">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Artist Image */}
            <div className={`aspect-square bg-gradient-to-br ${colors.gradient} rounded-lg overflow-hidden relative`}>
              {artistImage ? (
                <Image
                  src={artistImage}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className={`w-32 h-32 ${colors.text} opacity-50`} />
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">
                {artist.name}
              </h1>
              <p className={`text-xl ${colors.text} mb-6`}>{artist.genre}</p>
              
              <div className={`card-neon bg-[#00f3ff]/5 border ${colors.border} rounded-lg p-6 mb-6`}>
                <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                <div className={`bg-black/40 border ${colors.border} rounded-lg p-4 flex-1 text-center`}>
                  <p className={`text-3xl font-bold ${colors.text}`}>{albums.length}</p>
                  <p className="text-gray-400 text-sm">Album{albums.length !== 1 ? 's' : ''}</p>
                </div>
                <div className={`bg-black/40 border ${colors.border} rounded-lg p-4 flex-1 text-center`}>
                  <p className={`text-3xl font-bold ${colors.text}`}>{singles.length}</p>
                  <p className="text-gray-400 text-sm">Single{singles.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Quick Links */}
              {(albums.length > 0 || singles.length > 0) && (
                <div className="flex flex-wrap gap-4">
                  {albums.length > 0 && (
                    <a href="#albums" className="btn-neon flex items-center gap-2">
                      <Disc className="w-4 h-4" aria-hidden="true" />
                      View Albums
                    </a>
                  )}
                  {singles.length > 0 && (
                    <a href="#singles" className="btn-neon-alt flex items-center gap-2">
                      <Play className="w-4 h-4" aria-hidden="true" />
                      View Singles
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Albums Section */}
      {albums.length > 0 && (
        <Section id="albums" background="solid">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <Disc className={`w-6 h-6 md:w-8 md:h-8 ${colors.text}`} aria-hidden="true" />
              <span className={`bg-gradient-to-r ${colors.text} to-cyan-400 bg-clip-text text-transparent`}>Albums</span>
            </h2>
            <p className="text-gray-400">Full-length releases from {artist.name}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      )}

      {/* Singles Section */}
      {singles.length > 0 && (
        <Section id="singles" background={albums.length > 0 ? undefined : "solid"}>
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <Music className={`w-6 h-6 md:w-8 md:h-8 ${colors.text}`} aria-hidden="true" />
              <span className={`bg-gradient-to-r ${colors.text} to-cyan-400 bg-clip-text text-transparent`}>Singles</span>
            </h2>
            <p className="text-gray-400">Individual tracks from {artist.name}</p>
          </div>

          {/* Featured Singles */}
          {featuredSingles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Featured Tracks</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredSingles.map((single) => (
                  <SingleCard key={single.id} single={single} variant="featured" />
                ))}
              </div>
            </div>
          )}

          {/* All Singles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {singles.filter(s => !s.featured).map((single) => (
              <SingleCard key={single.id} single={single} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      {/* No Content State */}
      {albums.length === 0 && singles.length === 0 && (
        <Section background="solid">
          <div className="text-center py-16">
            <Music className={`w-16 h-16 ${colors.text} opacity-50 mx-auto mb-4`} aria-hidden="true" />
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400 text-lg">
              {artist.name} doesn&apos;t have any releases yet, but music is on the way!
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon for new albums and singles.
            </p>
          </div>
        </Section>
      )}

      {/* CTA Section */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <ShoppingBag className={`w-12 h-12 ${colors.text} mx-auto mb-6`} aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 neon-text">
            Discover More Artists
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Explore our full roster of AI-powered talents.
          </p>
          <Link href="/talent" className="btn-neon">
            View All Talents
          </Link>
        </div>
      </Section>
    </main>
  );
}
