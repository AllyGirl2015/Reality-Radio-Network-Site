import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Shattered Peaces | Mathew Cage',
  description: "Buy Shattered Peaces album by Mathew Cage. Alt rock journey through emotion, resilience, and identity. Digital $8.99 / Physical $19.99",
};

export default function ShatteredPeacesAlbumPage() {
  const album = {
    title: 'Shattered Peaces',
    artist: 'Mathew Cage',
    genre: 'Alt Rock / Emotional Rock',
    year: 2025,
    duration: '42:15',
    digitalPrice: 8.99,
    physicalPrice: 19.99,
    catalog: 'RRN-MC-SP',
    image: '/Shattered Peaces.png',
    description: 'Shattered Peaces dives into the depths of emotion, resilience, and identity through gritty rock and raw expression. Mathew Cage delivers an unforgettable journey. torn between darkness and light. that demands to be felt.',
  };

  const tracklist = [
    { number: 1, title: 'World of Gold', duration: '3:06', featured: true },
    { number: 2, title: 'Fractured Signal', duration: '4:02' },
    { number: 3, title: 'The Line Was Crossed', duration: '3:58' },
    { number: 4, title: 'Echoes of the Cage', duration: '4:28' },
    { number: 5, title: 'Shattered', duration: '3:45' },
    { number: 6, title: 'Broken Peace', duration: '4:15' },
    { number: 7, title: 'Fallen Flag', duration: '5:05', featured: true },
    { number: 8, title: 'Soulbound', duration: '3:52' },
    { number: 9, title: 'Corruption', duration: '4:38' },
    { number: 10, title: 'Opening', duration: '4:20' },
  ];

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link 
          href="/store/albums" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Albums
        </Link>
      </Section>

      <Section className="pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <Image
                src={album.image}
                alt={`${album.title} album cover`}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="mt-6 bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
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
                  <p className="text-white font-semibold">{tracklist.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </p>
                  <p className="text-white font-semibold">{album.duration}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                <p className="text-xs text-gray-400">© Reality Radio Network</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-400">
                DEBUT ALBUM
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {album.title}
              </span>
            </h1>

            <p className="text-2xl text-gray-300 mb-6">{album.artist}</p>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {album.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Digital Download</h3>
                    <p className="text-sm text-gray-400">Instant delivery • MP3/WAV formats</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    ${album.digitalPrice}
                  </p>
                </div>
                <a 
                  href="https://square.link/u/VrGeO94l?src=embed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon-purple flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Digital Album
                </a>
              </div>

              <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-400/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Physical CD</h3>
                    <p className="text-sm text-gray-400">Handmade • Ships in 1-2 weeks</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${album.physicalPrice}
                  </p>
                </div>
                <a 
                  href="https://square.link/u/9ZDDsbZv?src=embed"
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
              <Link href="/radio" className="flex-1 px-6 py-3 border border-purple-400/30 rounded-lg text-center text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" aria-hidden="true" />
                Listen on Radio
              </Link>
              <Link href="/artists/mathew-cage" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
                View Artist
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section background="solid">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Music className="w-8 h-8 text-purple-400" aria-hidden="true" />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Tracklist</span>
        </h2>

        <div className="max-w-4xl space-y-2">
          {tracklist.map((track) => (
            <div
              key={track.number}
              className={`group flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                track.featured
                  ? 'bg-purple-500/10 border border-purple-400/30 hover:bg-purple-500/20'
                  : 'bg-black/40 border border-gray-700/30 hover:bg-black/60 hover:border-purple-400/30'
              }`}
            >
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-gray-400 font-mono">{track.number}</span>
              </div>

              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-400/30 group-hover:border-purple-400 group-hover:scale-110 transition-all">
                  <Play className="w-4 h-4 text-purple-400" aria-hidden="true" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                  {track.title}
                  {track.featured && (
                    <span className="ml-2 text-xs bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 rounded-full text-purple-400">
                      FEATURED
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex-shrink-0 text-gray-400 text-sm font-mono">
                {track.duration}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Total Duration: <span className="text-white font-semibold">{album.duration}</span>
          </p>
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            About This Album
          </h2>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4 text-gray-300">
            <p className="leading-relaxed">
              <strong className="text-purple-400">Shattered Peaces</strong> is Mathew Cage's raw exploration of the 
              human condition. Each track peels back layers of emotion, from the corruptive allure of "World of Gold" 
              to the haunting reckoning of "Fallen Flag."
            </p>
            
            <p className="leading-relaxed">
              This isn't background music—it's a visceral experience that demands your full attention. With heavy 
              guitar riffs, introspective lyrics, and Cage's powerful vocals, the album oscillates between rage 
              and vulnerability, never settling for easy answers.
            </p>

            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-sm text-gray-400 italic">
                "When the world is gilded in gold, it's hard to tell what's truly worth holding."
              </p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link href="/licensing" className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-center">
              <ExternalLink className="w-8 h-8 text-cyan-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Need a License?</h3>
              <p className="text-sm text-gray-400">Use this music in your projects</p>
            </Link>

            <Link href="/contact" className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-center">
              <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2">Questions?</h3>
              <p className="text-sm text-gray-400">Contact our team</p>
            </Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            More Albums You Might Like
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["America's Changed", 'Heartfelt Rebellion', 'Barefoot Supernova'].map((title) => (
            <Link
              key={title}
              href={`/store/albums/${title.toLowerCase().replace(/'/g, '').replace(/ /g, '-')}`}
              className="group bg-black/40 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-center"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 relative overflow-hidden">
                <Image
                  src={`/${title}.png`}
                  alt={`${title} album cover`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{title}</h3>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
