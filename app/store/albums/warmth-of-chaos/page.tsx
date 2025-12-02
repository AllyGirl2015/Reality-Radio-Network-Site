import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink, Flame } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';

export const metadata: Metadata = {
  title: 'Warmth of Chaos | Daina Vein',
  description: "Buy Warmth of Chaos album by Daina Vein. An intense journey through electronic chaos and warmth. Digital $8.99 / Physical $14.99",
};

export default function WarmthOfChaosAlbumPage() {
  const album = {
    title: 'Warmth of Chaos',
    artist: 'Daina Vein',
    genre: 'Electronic / Industrial',
    year: 2025,
    duration: '28:45',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: 'RRN-DV-WOC',
    image: '/Warmth of Chaos.svg',
    description: 'Warmth of Chaos is Daina Vein\'s explosive debut, blending electronic intensity with raw emotional power. Each track ignites with industrial beats and ethereal vocals, creating a soundscape that embraces the beauty within chaos.',
  };

  const tracklist = [
    { number: 1, title: 'Break Me Up', duration: '4:32', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/01%20Break%20Me%20Up.mp3' },
    { number: 2, title: 'Split Matrix', duration: '4:48', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/02%20Split%20Matrix.mp3' },
    { number: 3, title: 'Chaos Sake', duration: '4:55', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/03%20Chaos%20Sake.mp3' },
    { number: 4, title: 'Trial By Fire', duration: '5:02', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/04%20Trial%20By%20Fire.mp3' },
    { number: 5, title: 'We Stand As One', duration: '4:38', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/05%20We%20Stand%20As%20One.mp3' },
    { number: 6, title: 'United They Fall', duration: '4:50', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/06%20United%20They%20Fall.mp3' },
  ];

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link 
          href="/store/albums" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Albums
        </Link>
      </Section>

      <Section className="pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              <div className="mt-6 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Released
                  </span>
                  <span className="text-white font-semibold">{album.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Duration
                  </span>
                  <span className="text-white font-semibold">{album.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    Genre
                  </span>
                  <span className="text-white font-semibold">{album.genre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Music className="w-4 h-4" aria-hidden="true" />
                    Tracks
                  </span>
                  <span className="text-white font-semibold">{tracklist.length}</span>
                </div>
                <div className="pt-2 border-t border-red-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-xs font-semibold text-red-400">
                  DEBUT ALBUM
                </span>
              </div>

              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <p className="text-xl sm:text-2xl text-gray-300">
                  {album.artist}
                </p>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {album.description}
              </p>

              <div className="bg-black/60 border-l-4 border-red-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg">
                  "In chaos, we find warmth. In fire, we find truth. Break apart to become whole."
                </p>
                <p className="text-red-400 text-sm mt-2">— Daina Vein</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Digital Download</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.digitalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Instant delivery • High-quality MP3</p>
                  <div className="w-full btn-neon-purple flex items-center justify-center gap-2 text-sm opacity-50 cursor-not-allowed">
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Coming Soon
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Physical CD</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.physicalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Shipped • Includes digital copy</p>
                  <div className="w-full btn-neon flex items-center justify-center gap-2 text-sm opacity-50 cursor-not-allowed">
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Coming Soon
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-red-400/30 rounded-lg text-center text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/store/albums" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
                  Browse Albums
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Flame className="w-8 h-8 text-red-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Tracklist</span>
          </h2>
          
          <TracklistPlayer tracks={tracklist} accentColor="red" />
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Album Details
          </h2>

          <div className="bg-black/40 border border-red-500/30 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About This Album</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-red-400 font-semibold">Warmth of Chaos</span> marks Daina Vein's explosive entry 
                into the electronic music scene. This 6-track EP delivers an uncompromising blend of industrial beats, 
                glitchy textures, and hauntingly beautiful vocals.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                From the opening assault of "Break Me Up" to the anthemic finale "United They Fall," the album takes 
                listeners on a journey through digital destruction and emotional reconstruction. "We Stand As One" 
                serves as the album's centerpiece, a rallying cry for unity in an increasingly fragmented world.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Produced with cutting-edge synthesis techniques and raw analog warmth, Warmth of Chaos challenges 
                conventions while remaining deeply accessible. It's electronic music with a heart beating beneath 
                the circuits.
              </p>
            </div>

            <div className="pt-4 border-t border-red-500/20">
              <h3 className="text-lg font-bold text-white mb-3">Production Credits</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="text-sm text-gray-400">Artist</p>
                  <p className="font-semibold text-white">{album.artist}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Label</p>
                  <p className="font-semibold text-white">Reality Radio Network</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Genre</p>
                  <p className="font-semibold text-white">{album.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Release Year</p>
                  <p className="font-semibold text-white">{album.year}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-500/20">
              <p className="text-sm text-gray-400">
                © {album.year} Reality Radio Network. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Catalog #: {album.catalog}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <ExternalLink className="w-12 h-12 text-red-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Explore More Music
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Discover more albums from Reality Radio Network artists.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/store/albums" className="btn-neon-purple">
              Browse All Albums
            </Link>
            <Link href="/store/singles" className="btn-neon">
              Browse Singles
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
