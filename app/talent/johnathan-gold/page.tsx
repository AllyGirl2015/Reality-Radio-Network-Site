import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Music2, Play, ShoppingCart, Radio, Disc, ArrowRight } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Johnathan Gold & Guilded Hearts | Reality Radio Network',
  description: "Johnathan Gold's warm grit and Guilded Hearts' rich instrumentation bridge classic country and modern Americana. Stories of resilience, quiet faith, and everyday heroes.",
};

export default function JohnathanGoldPage() {
  const albums = [
    {
      title: "America's Changed",
      slug: 'americas-changed',
      description: 'A heartland journey through gas-station prayers and Main Street goodbyes, where country roots meet modern storytelling.',
      tracks: 10,
      year: 2025,
    },
    {
      title: 'Golden Heartbreak',
      slug: 'golden-heartbreak',
      description: 'Country love, lust, and heartbreak. Proves that country and love go together so well with emotionally vulnerable storytelling.',
      tracks: 22,
      year: 2025,
    },
    {
      title: 'Heartfelt Rebellion',
      slug: 'heartfelt-rebellion',
      description: 'Raw harmony and honest fire, standing for love, grit, and the unquiet heart.',
      tracks: 13,
      year: 2025,
    },
  ];

  const highlightedTracks = [
    {
      title: 'Chaos Country',
      album: 'Heartfelt Rebellion',
      slug: 'chaos-country',
      description: 'A defiant blend of twang and fire',
    },
    {
      title: "America's Changed",
      album: "America's Changed",
      slug: 'americas-changed',
      description: 'The title track that started it all',
    },
    {
      title: 'Heartfelt Rebellion',
      album: 'Heartfelt Rebellion',
      slug: 'heartfelt-rebellion',
      description: 'Soul-soaked strings and rebellion',
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
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                <Music2 className="w-32 h-32 text-purple-400 opacity-50" />
              </div>
              <div className="mt-6 space-y-3">
                <Link href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="btn-neon w-full flex items-center justify-center gap-2">
                  <Radio className="w-5 h-5" />
                  Listen on Radio
                </Link>
                <Link href="/store/albums/americas-changed" className="btn-neon-purple w-full flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shop Music
                </Link>
              </div>
            </div>

            {/* Artist Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-xs font-semibold text-orange-400">
                  COUNTRY / AMERICANA
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
                Johnathan Gold & Guilded Hearts
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Johnathan Gold's warm grit and Guilded Hearts' rich instrumentation bridge classic country and modern Americana. 
                Their music tells stories of <strong className="text-purple-400">resilience</strong>, <strong className="text-cyan-400">quiet faith</strong>, 
                and <strong className="text-purple-400">everyday heroes</strong>. perfect for late-night drives and Sunday mornings alike.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-black/40 border border-purple-500/30 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{albums.length}</div>
                  <div className="text-sm text-gray-400">Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{highlightedTracks.length}+</div>
                  <div className="text-sm text-gray-400">Hit Singles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">2025</div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-orange-500 bg-clip-text text-transparent">
              Albums
            </h2>
            <p className="text-gray-400">Complete studio albums from Johnathan Gold & Guilded Hearts</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {albums.map((album) => (
              <Link
                key={album.slug}
                href={`/store/albums/${album.slug}`}
                className="group bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                <div className="aspect-square rounded-lg mb-6 overflow-hidden relative">
                  <Image
                    src={album.title === "Golden Heartbreak" ? `/${album.title}.svg` : `/${album.title}.png`}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">
                  {album.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {album.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{album.tracks} tracks</span>
                  <span>{album.year}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-purple-400 font-semibold">
                  View Album
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Highlighted Tracks
            </h2>
            <p className="text-gray-400">Fan favorites and chart-toppers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlightedTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/store/singles/${track.slug}`}
                className="group bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30 group-hover:border-cyan-400 transition-all">
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
            <Link href="/store/singles" className="btn-neon inline-flex items-center gap-2">
              View All Singles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
            Experience the Sound
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            From gas-station prayers to Main Street goodbyes, Johnathan Gold & Guilded Hearts bring you 
            authentic country storytelling with modern heart. Listen now on Reality Radio Network.
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
