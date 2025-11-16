import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Golden Heartbreak | Johnathan Gold & Guilded Hearts',
  description: "Buy Golden Heartbreak album by Johnathan Gold & Guilded Hearts. Country love, lust, and heartbreak. Country and love go together so well. Digital $8.99 / Physical $14.99",
};

export default function GoldenHeartbreakAlbumPage() {
  const album = {
    title: 'Golden Heartbreak',
    artist: 'Johnathan Gold & Guilded Hearts',
    genre: 'Country / Heartbreak Country',
    year: 2025,
    tracks: 22,
    duration: '78:45',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: 'RRN-JGGH-GH',
    image: '/Golden Heartbreak.svg',
    description: 'Country love, lust, and heartbreak. Golden Heartbreak proves that country and love go together so well. Johnathan Gold and Guilded Hearts deliver their most emotionally vulnerable album yet, weaving tales of romance, loss, and the bittersweet memories that linger long after love fades.',
  };

  const tracklist = [
    { number: 1, title: 'Back When We Fell', duration: '3:42', featured: true },
    { number: 2, title: 'City Girl', duration: '3:28' },
    { number: 3, title: 'Country Looks', duration: '3:35' },
    { number: 4, title: 'Tractor Heart', duration: '3:45', featured: true },
    { number: 5, title: "Country Lovin'", duration: '3:52' },
    { number: 6, title: 'Backroad Love', duration: '3:38' },
    { number: 7, title: 'Country Tangled', duration: '3:48' },
    { number: 8, title: 'The Stash', duration: '3:25' },
    { number: 9, title: 'Truckbed', duration: '3:32' },
    { number: 10, title: 'Night On the Farm', duration: '3:55' },
    { number: 11, title: 'Innocent Love', duration: '3:40' },
    { number: 12, title: 'Country Breakup', duration: '3:48' },
    { number: 13, title: 'I Choose the Truck', duration: '3:35', featured: true },
    { number: 14, title: 'Muddy Mistake', duration: '3:42' },
    { number: 15, title: 'Drunk Love', duration: '3:28' },
    { number: 16, title: 'The Barn Is a Secret', duration: '4:05' },
    { number: 17, title: 'The Old You and Me', duration: '3:52' },
    { number: 18, title: 'Heartbreak Song', duration: '4:15', featured: true },
    { number: 19, title: 'Young Love', duration: '3:38' },
    { number: 20, title: "Family Livin'", duration: '3:45' },
    { number: 21, title: 'Tractor Tango', duration: '3:55' },
    { number: 22, title: 'Golden Heartbreak', duration: '4:32', featured: true },
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
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20">
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              <div className="mt-6 bg-black/60 backdrop-blur-md border border-yellow-500/30 rounded-lg p-4 text-sm space-y-2">
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
                <div className="pt-2 border-t border-yellow-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full text-xs font-semibold text-yellow-400">
                  NEW RELEASE
                </span>
              </div>

              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <Link href="/talent/johnathan-gold" className="text-xl sm:text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                  {album.artist}
                </Link>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {album.description}
              </p>

              <div className="bg-black/60 border-l-4 border-yellow-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg">
                  "Love and heartbreak are two sides of the same golden coin. You can't have one without risking the other. That's what makes it beautiful."
                </p>
                <p className="text-yellow-400 text-sm mt-2">— Johnathan Gold</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Digital Download</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.digitalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Instant delivery • High-quality MP3</p>
                  <a 
                    href="https://square.link/u/cY1R9Yas?src=embed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon-purple flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Digital
                  </a>
                </div>

                <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Physical CD</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.physicalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Shipped • Includes digital copy</p>
                  <a 
                    href="https://square.link/u/cY1R9Yas?src=embed"
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
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-yellow-400/30 rounded-lg text-center text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 flex items-center justify-center gap-2">
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

      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Heart className="w-8 h-8 text-yellow-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Tracklist</span>
          </h2>
          
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg overflow-hidden">
            {tracklist.map((track, index) => (
              <div
                key={track.number}
                className={`flex items-center justify-between p-4 hover:bg-yellow-500/5 transition-colors ${
                  index !== tracklist.length - 1 ? 'border-b border-yellow-500/20' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-gray-500 font-mono text-sm w-6 text-right flex-shrink-0">{track.number}</span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{track.title}</h3>
                      {track.featured && (
                        <span className="text-xs text-yellow-400">Featured Track</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm ml-4 flex-shrink-0">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Album Details
          </h2>

          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About This Album</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-yellow-400 font-semibold">Golden Heartbreak</span> is Johnathan Gold and Guilded Hearts' 
                most intimate and emotionally resonant work to date. This album strips away pretense to reveal the raw truth about 
                love, lust, and the inevitable heartbreak that follows.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With 12 tracks that blend traditional country storytelling with modern production, Golden Heartbreak explores the 
                full spectrum of romantic experience. From the intoxicating rush of new love to the crushing weight of loss, each 
                song captures a moment in time that listeners will instantly recognize from their own lives. Featuring a special 
                collaboration with Kaira Heartfelt on "Broken Promises," this album showcases the perfect marriage of country 
                authenticity and emotional vulnerability.
              </p>
            </div>

            <div className="pt-4 border-t border-yellow-500/20">
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

            <div className="pt-4 border-t border-yellow-500/20">
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
          <ExternalLink className="w-12 h-12 text-yellow-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Explore More from Johnathan Gold
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Discover his complete discography and the story behind Guilded Hearts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/talent/johnathan-gold" className="btn-neon-purple">
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
