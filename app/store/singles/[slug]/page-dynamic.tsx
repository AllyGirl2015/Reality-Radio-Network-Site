import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, Disc } from 'lucide-react';
import Section from '@/components/Section';
import MusicPreviewPlayer from '@/components/MusicPreviewPlayer';
import { getSingleBySlug, getAllSingles } from '@/lib/database';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const single = getSingleBySlug(slug);
  
  if (!single) {
    return { title: 'Single Not Found' };
  }

  return {
    title: `${single.title} | ${single.artist}`,
    description: `Buy ${single.title} by ${single.artist}. ${single.description}. Digital download $${single.price}`,
  };
}

export async function generateStaticParams() {
  const singles = getAllSingles();
  return singles.map((single) => ({
    slug: single.slug,
  }));
}

// Color configurations
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

export default async function DynamicSinglePage({ params }: Props) {
  const { slug } = await params;
  const single = getSingleBySlug(slug);

  if (!single) {
    notFound();
  }

  const colors = colorConfig[single.accentColor] || colorConfig.purple;

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link 
          href="/store/singles" 
          className={`inline-flex items-center gap-2 text-gray-400 hover:${colors.text} transition-colors mb-6`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Singles
        </Link>
      </Section>

      <Section className="pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${colors.border} shadow-2xl ${colors.shadow} bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                <div className="text-center p-8">
                  <Music className={`w-20 h-20 ${colors.text} mx-auto mb-4`} aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-mono">SINGLE</p>
                </div>
              </div>
              
              <div className={`mt-4 bg-black/60 backdrop-blur-md border ${colors.border} rounded-lg p-4 text-sm space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Released
                  </span>
                  <span className="text-white font-semibold">{single.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </span>
                  <span className="text-white font-semibold">{single.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    Genre
                  </span>
                  <span className="text-white font-semibold">{single.genre}</span>
                </div>
                <div className={`pt-2 border-t ${colors.border}`}>
                  <p className="text-xs text-gray-400">Catalog #: {single.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              {single.featured && (
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 ${colors.bg} border ${colors.border} rounded-full text-xs font-semibold ${colors.text}`}>
                    FEATURED
                  </span>
                </div>
              )}

              <div className="mb-3">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {single.title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300">{single.artist}</p>
              </div>

              {single.album && (
                <Link 
                  href={`/store/albums/${single.albumSlug}`}
                  className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
                >
                  <Disc className="w-4 h-4" aria-hidden="true" />
                  From the album: <span className="font-semibold">{single.album}</span>
                </Link>
              )}

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {single.description}
              </p>

              {single.quote && (
                <div className={`bg-black/60 border-l-4 ${colors.border} rounded-r-lg p-4 mb-8`}>
                  <p className="text-gray-300 italic">{single.quote}</p>
                </div>
              )}

              {/* Preview Player */}
              {single.previewUrl && (
                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-4 text-center bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                    Preview Track
                  </h3>
                  <MusicPreviewPlayer
                    trackTitle={single.title}
                    artist={single.artist}
                    previewUrl={single.previewUrl}
                    duration={15}
                  />
                </div>
              )}

              <div className={`bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border ${colors.border} rounded-lg p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Digital Download</h3>
                    <p className="text-sm text-gray-400">Instant delivery • High-quality MP3</p>
                  </div>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${colors.gradientAlt} bg-clip-text text-transparent`}>
                    ${single.price.toFixed(2)}
                  </p>
                </div>
                <a 
                  href={single.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full ${colors.btn} flex items-center justify-center gap-2`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Single
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className={`flex-1 px-4 sm:px-6 py-3 border ${colors.border} rounded-lg text-center text-sm sm:text-base ${colors.text} hover:bg-purple-500/10 ${colors.hoverBorder} transition-all duration-300 flex items-center justify-center gap-2`}>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href={`/talent/${single.artistSlug}`} className="px-4 sm:px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-sm sm:text-base text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
                  View Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* YouTube Embed */}
      {single.youtubeId && (
        <Section background="solid">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold mb-6 text-center bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Listen Now
            </h2>
            <div className={`relative aspect-video rounded-lg overflow-hidden border-2 ${colors.border} shadow-2xl ${colors.shadow}`}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${single.youtubeId}`}
                title={`${single.title} - ${single.artist}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
        </Section>
      )}

      {single.album && (
        <Section background={single.youtubeId ? "gradient" : "solid"}>
          <div className="max-w-3xl mx-auto text-center">
            <Disc className={`w-12 h-12 ${colors.text} mx-auto mb-6`} aria-hidden="true" />
            <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Love this track? Get the full album!
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              "{single.title}" is part of <span className={`${colors.text} font-semibold`}>{single.album}</span>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={`/store/albums/${single.albumSlug}`} className={colors.btn}>
                View Full Album
              </Link>
              <Link href="/store/singles" className="btn-neon">
                More Singles
              </Link>
            </div>
          </div>
        </Section>
      )}
    </main>
  );
}
