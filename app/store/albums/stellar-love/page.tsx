import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';

export const metadata: Metadata = {
  title: 'Stellar Love | Kaira Heartfelt',
  description: "Buy Stellar Love album by Kaira Heartfelt. A clashing of love, lust, and heartbreak. A whirlwind of romantic emotions! Digital $8.99 / Physical $14.99",
};

export default function StellarLoveAlbumPage() {
  const album = {
    title: 'Stellar Love',
    artist: 'Kaira Heartfelt',
    genre: 'Country-Pop / Romantic Country',
    year: 2025,
    tracks: 11,
    duration: '40:23',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: 'RRN-KH-SL',
    image: '/Stellar Love.svg',
    description: 'A clashing of love, lust, and heartbreak. Stellar Love is a whirlwind of romantic emotions that takes you through the highs and lows of modern romance. Kaira Heartfelt delivers her most emotionally raw and vulnerable work yet, blending country authenticity with contemporary pop sensibilities.',
  };

  const tracklist = [
    { number: 1, title: 'Lustful Love', duration: '3:28', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/01%20Lustful%20Love.mp3', purchaseUrl: 'https://square.link/u/7Z7NtdOx' },
    { number: 2, title: 'Love Killer', duration: '3:45', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/02%20Love%20Killer.mp3', purchaseUrl: 'https://square.link/u/YkZwnMzA' },
    { number: 3, title: 'The Stars Above', duration: '3:52', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/03%20The%20Stars%20Above.mp3', purchaseUrl: 'https://square.link/u/1vJh1PwJ' },
    { number: 4, title: 'Take My Love', duration: '3:18', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/04%20Take%20My%20Love.mp3', purchaseUrl: 'https://square.link/u/8kANPQUF' },
    { number: 5, title: 'Rebound', duration: '3:35', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/05%20Rebound.mp3', purchaseUrl: 'https://square.link/u/HaZTz5xe' },
    { number: 6, title: 'Heart Call', duration: '3:42', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/06%20Heart%20Call.mp3', purchaseUrl: 'https://square.link/u/O4PioY92' },
    { number: 7, title: 'Catcall', duration: '4:05', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/07%20Catcall.mp3', purchaseUrl: 'https://square.link/u/xXVJu6EJ' },
    { number: 8, title: 'Fisher', duration: '3:38', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/08%20Fisher.mp3', purchaseUrl: 'https://square.link/u/6EAJJTol' },
    { number: 9, title: 'Confidential', duration: '3:25', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/09%20Confidential.mp3', purchaseUrl: 'https://square.link/u/lfs9e6sC' },
    { number: 10, title: 'Chaos Love', duration: '3:48', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/10%20Chaos%20Love.mp3', purchaseUrl: 'https://square.link/u/Z864AJ0B' },
    { number: 11, title: "Devil's Number", duration: '4:12', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/11%20Devils%20Number.mp3', purchaseUrl: 'https://square.link/u/a6D5Cfmh' },
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20">
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              <div className="mt-6 bg-black/60 backdrop-blur-md border border-pink-500/30 rounded-lg p-4 text-sm space-y-2">
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
                <div className="pt-2 border-t border-pink-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-500/20 border border-pink-400/30 rounded-full text-xs font-semibold text-pink-400">
                  NEW RELEASE
                </span>
              </div>

              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <Link href="/talent/kaira-heartfelt" className="text-xl sm:text-2xl text-gray-300 hover:text-pink-400 transition-colors">
                  {album.artist}
                </Link>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {album.description}
              </p>

              <div className="bg-black/60 border-l-4 border-pink-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg">
                  "Love is never simple. It's chaos, beauty, heartbreak, and hope all tangled together like stars in the night sky."
                </p>
                <p className="text-pink-400 text-sm mt-2">— Kaira Heartfelt</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Digital Download</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.digitalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Instant delivery • High-quality MP3</p>
                  <a 
                    href="https://square.link/u/gctD7ugw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon-purple flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Digital
                  </a>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Physical CD</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.physicalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Shipped • Includes digital copy</p>
                  <a 
                    href="https://square.link/u/TuUw7VjD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Physical
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-pink-400/30 rounded-lg text-center text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/talent/kaira-heartfelt" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
                  View Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Music className="w-8 h-8 text-pink-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Tracklist</span>
          </h2>
          
          <TracklistPlayer tracks={tracklist} accentColor="pink" />
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Album Details
          </h2>

          <div className="bg-black/40 border border-pink-500/30 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About This Album</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-pink-400 font-semibold">Stellar Love</span> marks a bold new chapter in Kaira Heartfelt's musical journey. 
                This album explores the full spectrum of romantic experience, from the intoxicating highs of new love to the devastating lows 
                of heartbreak, all set against the backdrop of modern country-pop production.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With 12 tracks that blend traditional country storytelling with contemporary pop sensibilities, Stellar Love showcases 
                Kaira's growth as both a vocalist and songwriter. The album features collaborations with top Nashville producers and 
                captures the raw emotion and vulnerability that have become her trademark.
              </p>
            </div>

            <div className="pt-4 border-t border-pink-500/20">
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

            <div className="pt-4 border-t border-pink-500/20">
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
          <ExternalLink className="w-12 h-12 text-pink-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Explore More from Kaira Heartfelt
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Discover her complete discography and learn more about her musical journey.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/talent/kaira-heartfelt" className="btn-neon-purple">
              View Artist Profile
            </Link>
            <Link href="/store/albums" className="btn-neon">
              Browse All Albums
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
