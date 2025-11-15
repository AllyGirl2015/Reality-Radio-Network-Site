import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Music2, Play, ShoppingCart, Radio, Disc, ArrowRight } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Mathew Cage | Reality Radio Network',
  description: 'Mathew Cage channels internal chaos into powerful waves of sound. a rock-driven, emotionally raw artist who turns pain into poetry.',
};

export default function MathewCagePage() {
  const albums = [
    {
      title: 'Shattered Peaces',
      slug: 'shattered-peaces',
      description: 'A volatile journey through fracture, resolve, and resurrection. Walking the line between collapse and clarity, offering heavy truths across searing ballads, haunting breakdowns, and rebel soul anthems.',
      tracks: 10,
      year: 2025,
    },
  ];

  const highlightedTracks = [
    {
      title: 'World of Gold',
      album: 'Shattered Peaces',
      slug: 'world-of-gold',
      description: 'Cinematic emotion about the corruptive grip of wealth',
    },
    {
      title: 'Fallen Flag',
      album: 'Shattered Peaces',
      slug: 'fallen-flag',
      description: 'A cinematic ballad that grieves what we lost',
    },
    {
      title: 'Fractured Signal',
      album: 'Shattered Peaces',
      slug: 'fractured-signal',
      description: 'Opening track that sets the volatile tone',
    },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <Section className="pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
            {/* Artist Image Placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center">
                <Music2 className="w-32 h-32 text-purple-400 opacity-50" />
              </div>
              <div className="mt-6 space-y-3">
                <Link href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="btn-neon w-full flex items-center justify-center gap-2">
                  <Radio className="w-5 h-5" />
                  Listen on Radio
                </Link>
                <Link href="/store/albums/shattered-peaces" className="btn-neon-purple w-full flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shop Music
                </Link>
              </div>
            </div>

            {/* Artist Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-xs font-semibold text-red-400">
                  ALT ROCK / EMOTIONAL ROCK
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent">
                Mathew Cage
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Mathew Cage channels internal chaos into powerful waves of sound. a rock-driven, emotionally raw artist who turns
                <strong className="text-red-400"> pain into poetry</strong>. With a voice sharpened by heartbreak and lyrics forged from personal reckoning, 
                Cage delivers <strong className="text-purple-400">catharsis, not just songs</strong>.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-black/40 border border-purple-500/30 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{albums.length}</div>
                  <div className="text-sm text-gray-400">Album</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-1">10</div>
                  <div className="text-sm text-gray-400">Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">2025</div>
                  <div className="text-sm text-gray-400">Debut Year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Albums Section */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent">
              Album
            </h2>
            <p className="text-gray-400">Studio album from Mathew Cage</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {albums.map((album) => (
              <Link
                key={album.slug}
                href={`/store/albums/${album.slug}`}
                className="group bg-black/40 border border-purple-500/30 rounded-lg p-8 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all block"
              >
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
                  <div className="aspect-square rounded-lg overflow-hidden relative group-hover:scale-105 transition-transform">
                    <Image
                      src="/Shattered Peaces.png"
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                      {album.title}
                    </h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {album.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{album.tracks} tracks</span>
                      <span>•</span>
                      <span>{album.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      View Album
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Highlighted Tracks */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-red-500 bg-clip-text text-transparent">
              Highlighted Tracks
            </h2>
            <p className="text-gray-400">Powerful anthems and emotional journeys</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlightedTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/store/singles/${track.slug}`}
                className="group bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-red-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30 group-hover:border-cyan-400 transition-all">
                  <Play className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white text-center mb-2 group-hover:text-cyan-300 transition-colors">
                  {track.title}
                </h3>
                <p className="text-sm text-gray-400 text-center mb-2">
                  from <span className="text-purple-400">{track.album}</span>
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {track.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/store/albums/shattered-peaces" className="btn-neon inline-flex items-center gap-2">
              View Full Album
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Featured Quote */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-black/40 border-l-4 border-red-400 rounded-r-lg p-8">
            <blockquote className="text-2xl text-gray-300 italic mb-4">
              "Fractured Signal, In the Devil's Name I Pray, Fallen Flag... Each track walks the line between collapse and clarity."
            </blockquote>
            <p className="text-gray-500">Shattered Peaces Album Review</p>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent">
            Feel the Raw Emotion
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Mathew Cage's music isn't background noise. it's a visceral experience.
            Heavy truths, searing ballads, and rebel soul anthems await. Listen now on Reality Radio Network.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="btn-neon flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Listen Live
            </Link>
            <Link href="/store" className="btn-neon-purple flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shop All Music
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
