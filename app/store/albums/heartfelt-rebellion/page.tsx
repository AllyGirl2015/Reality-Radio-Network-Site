import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Heartfelt Rebellion | Johnathan Gold & Guilded Hearts',
  description: "Buy Heartfelt Rebellion album by Johnathan Gold & Guilded Hearts. A bold country-rock statement tackling faith, fire, and authenticity. Digital $8.99 / Physical $16.99",
};

export default function HeartfeltRebellionAlbumPage() {
  const album = {
    title: 'Heartfelt Rebellion',
    artist: 'Johnathan Gold & Guilded Hearts',
    genre: 'Country Rock',
    year: 2025,
    duration: '48:33',
    digitalPrice: 8.99,
    physicalPrice: 16.99,
    catalog: 'RRN-JGGH-HR',
    image: '/Heartfelt Rebellion.png',
    description: 'Heartfelt Rebellion captures the essence of defiance and passion. Mathew Cage\'s powerful voice and intense guitar work create an anthem of resistance and hope.',

  };

  const tracklist = [
    { number: 1, title: 'Heartfelt Rebellion', duration: '3:28', featured: true },
    { number: 2, title: 'Country Bonfire', duration: '3:48' },
    { number: 3, title: 'Screens', duration: '3:22' },
    { number: 4, title: 'Forgotten Sons', duration: '4:18' },
    { number: 5, title: 'Chaos Country', duration: '3:55', featured: true },
    { number: 6, title: 'Lifeline', duration: '3:38' },
    { number: 7, title: 'Connections', duration: '3:42' },
    { number: 8, title: 'Country Style', duration: '3:28' },
    { number: 9, title: 'Civilization Outlaw', duration: '4:25' },
    { number: 10, title: 'Religious Truth', duration: '4:32' },
    { number: 11, title: 'Unspoken Words', duration: '3:55' },
    { number: 12, title: 'Truth is What You Make It', duration: '4:12' },
    { number: 13, title: 'Empathy', duration: '4:13' },
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
                COUNTRY ROCK ALBUM
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
                  href="https://square.link/u/RC8iXmY6"
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
                  href="https://square.link/u/ekPAXcLE"
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
              <Link href="/talent/johnathan-gold" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
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
              <strong className="text-purple-400">Heartfelt Rebellion</strong> isn't just music it's a movement.
              This album tackles the hard questions about faith, identity, and authenticity in modern America with 
              unflinching honesty and soul-stirring melodies.
            </p>
            
            <p className="leading-relaxed">
              From the defiant title track to the thought-provoking "Religious Truth," each song challenges listeners 
              to think deeper while keeping feet tapping with irresistible country-rock grooves. "Chaos Country" became 
              an instant fan favorite for its raw energy and political edge.
            </p>

            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-sm text-gray-400 italic">
                "Rebellion isn't always loud sometimes it's the whisper that refuses to fade."
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
          {["America's Changed", 'Shattered Peaces', 'Barefoot Supernova'].map((title) => (
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
