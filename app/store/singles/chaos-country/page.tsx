import { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, Disc } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Chaos Country | Johnathan Gold & Guilded Hearts',
  description: 'Buy Chaos Country by Johnathan Gold & Guilded Hearts. A gritty, defiant anthem wrapped in dust and distortion. Digital download $0.99',
};

export default function ChaosCountrySinglePage() {
  const single = {
    title: 'Chaos Country',
    artist: 'Johnathan Gold & Guilded Hearts',
    album: 'Heartfelt Rebellion',
    genre: 'Country Rock',
    year: 2025,
    duration: '3:55',
    price: 0.99,
    catalog: 'RRN-JG-CC02',
    youtubeId: 'xs7wd9wtYQE',
    description: 'A gritty, defiant anthem wrapped in dust and distortion. "Chaos Country" charges through the noise of modern discontent. Unapologetically Southern, politically layered, and emotionally sharp. It doesn\'t just sing about chaos. It *dares* you to understand it.',
    quote: '"Chaos is but the precursor to the name. If what you seek is more, then seek the whole."',
  };

  return (
    <main className="min-h-screen pt-24">
      {/* Back Button */}
      <Section className="pb-0">
        <Link 
          href="/store/singles" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Singles
        </Link>
      </Section>

      {/* Single Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Single Artwork */}
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Music className="w-20 h-20 text-purple-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-mono">SINGLE</p>
                </div>
              </div>
              
              {/* Quick Info Card */}
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

            {/* Single Details */}
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-400">
                  FEATURED SINGLE
                </span>
              </div>

              <div className="mb-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {single.title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300">{single.artist}</p>
              </div>

              <Link 
                href={`/store/albums/${single.album.toLowerCase().replace(/ /g, '-')}`}
                className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
              >
                <Disc className="w-4 h-4" aria-hidden="true" />
                From the album: <span className="font-semibold">{single.album}</span>
              </Link>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {single.description}
              </p>

              {/* Quote */}
              <div className="bg-black/60 border-l-4 border-purple-400 rounded-r-lg p-4 mb-8">
                <p className="text-gray-300 italic">{single.quote}</p>
              </div>

              {/* Purchase Option */}
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
                  href="https://square.link/u/2ZQY92lI?src=embed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon-purple flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Single
                </a>
              </div>

              <div className="flex gap-4">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-purple-400/30 rounded-lg text-center text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/talent/johnathan-gold" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
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

      {/* Album Upsell */}
      <Section background="solid">
        <div className="max-w-3xl mx-auto text-center">
          <Disc className="w-12 h-12 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Love this track? Get the full album!
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            "Chaos Country" is part of <span className="text-purple-400 font-semibold">{single.album}</span>.
            13 powerful tracks for just $8.99 (save over 40%)
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/store/albums/${single.album.toLowerCase().replace(/ /g, '-')}`} className="btn-neon-purple">
              View Full Album
            </Link>
            <Link href="/store/singles" className="btn-neon">
              More Singles
            </Link>
          </div>
        </div>
      </Section>

      {/* Credits & Info */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Track Information
          </h2>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4 text-gray-300">
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
                Official Release under Reality Radio Network.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Catalog #: {single.catalog}
              </p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link href="/licensing" className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-center">
              <Music className="w-8 h-8 text-cyan-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Need a License?</h3>
              <p className="text-sm text-gray-400">Use this track commercially</p>
            </Link>

            <Link href="/contact" className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-center">
              <ShoppingCart className="w-8 h-8 text-purple-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Bulk Orders?</h3>
              <p className="text-sm text-gray-400">Contact for volume discounts</p>
            </Link>
          </div>
        </div>
      </Section>

      {/* Related Singles */}
      <Section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            You Might Also Like
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { title: 'Heartfelt Rebellion', artist: 'Johnathan Gold', slug: 'heartfelt-rebellion' },
            { title: "America's Changed", artist: 'Johnathan Gold', slug: 'americas-changed' },
            { title: 'Fallen Flag', artist: 'Mathew Cage', slug: 'fallen-flag' },
          ].map((track) => (
            <Link
              key={track.slug}
              href={`/store/singles/${track.slug}`}
              className="group bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30 group-hover:border-cyan-400 transition-all">
                <Play className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-white text-center mb-2 group-hover:text-cyan-300 transition-colors">{track.title}</h3>
              <p className="text-sm text-gray-400 text-center">{track.artist}</p>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
