import { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, Disc } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: "America's Changed | Johnathan Gold & Guilded Hearts",
  description: "Buy America's Changed by Johnathan Gold & Guilded Hearts. A powerful anthem reflecting the state of a changing nation. Digital download $0.99",
};

export default function AmericasChangedSinglePage() {
  const single = {
    title: "America's Changed",
    artist: 'Johnathan Gold & Guilded Hearts',
    album: "America's Changed",
    genre: 'Country / Americana',
    year: 2025,
    duration: '3:20',
    price: 0.99,
    catalog: 'RRN-JG-AC01',
    youtubeId: '79tszJ3bX_o',
    description: 'A powerful and unapologetic anthem reflecting the state of a changing nation. "America\'s Changed" delivers heartland truths with raw emotion, balancing modern country roots and bold lyrical honesty. This single sets the tone for Johnathan Gold\'s musical rebellion. Direct, emotional, unforgettable.',
    quote: '"Sometimes you need to look beyond the meaning of one, and instead look for the meaning of many."',
  };

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link 
          href="/store/singles" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Singles
        </Link>
      </Section>

      <Section className="pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Music className="w-20 h-20 text-purple-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-mono">SINGLE</p>
                </div>
              </div>
              
              <div className="mt-4 bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 text-sm space-y-2">
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
                <div className="pt-2 border-t border-purple-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {single.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-400">
                  TITLE TRACK
                </span>
              </div>

              <div className="mb-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {single.title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300">{single.artist}</p>
              </div>

              <Link 
                href={`/store/albums/${single.album.toLowerCase().replace(/'/g, '').replace(/ /g, '-')}`}
                className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
              >
                <Disc className="w-4 h-4" aria-hidden="true" />
                From the album: <span className="font-semibold">{single.album}</span>
              </Link>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {single.description}
              </p>

              <div className="bg-black/60 border-l-4 border-purple-400 rounded-r-lg p-4 mb-8">
                <p className="text-gray-300 italic">{single.quote}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Digital Download</h3>
                    <p className="text-sm text-gray-400">Instant delivery • High-quality MP3</p>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    ${single.price.toFixed(2)}
                  </p>
                </div>
                <a 
                  href="https://square.link/u/cY1R9Yas?src=embed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon-purple flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Single
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-4 sm:px-6 py-3 border border-purple-400/30 rounded-lg text-center text-sm sm:text-base text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/artists/johnathan-gold" className="px-4 sm:px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-sm sm:text-base text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
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
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Listen Now
            </h2>
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
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

      <Section background={single.youtubeId ? "gradient" : "solid"}>
        <div className="max-w-3xl mx-auto text-center">
          <Disc className="w-12 h-12 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Love this track? Get the full album!
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            "{single.title}" is part of <span className="text-purple-400 font-semibold">{single.album}</span>.
            10 powerful tracks for just $8.99 (save over 40%)
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/store/albums/${single.album.toLowerCase().replace(/'/g, '').replace(/ /g, '-')}`} className="btn-neon-purple">
              View Full Album
            </Link>
            <Link href="/store/singles" className="btn-neon">
              More Singles
            </Link>
          </div>
        </div>
      </Section>

      <Section background={single.youtubeId ? "solid" : "gradient"}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Track Information
          </h2>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 space-y-4 text-gray-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Artist</h3>
                <p className="text-white font-semibold">{single.artist}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Album</h3>
                <p className="text-white font-semibold">{single.album}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Genre</h3>
                <p className="text-white font-semibold">{single.genre}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Label</h3>
                <p className="text-white font-semibold">Reality Radio Network</p>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-sm text-gray-400">
                © {single.year} Reality Radio Network. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Catalog #: {single.catalog}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
