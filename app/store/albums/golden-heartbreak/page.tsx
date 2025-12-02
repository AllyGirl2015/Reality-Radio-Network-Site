import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';

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
    { number: 1, title: 'Back When We Fell', duration: '3:42', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/01%20Back%20When%20We%20Fell.mp3', purchaseUrl: 'https://square.link/u/wX1OkEC7' },
    { number: 2, title: 'City Girl', duration: '3:28', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/02%20City%20Girl.mp3', purchaseUrl: 'https://square.link/u/rseytD6W' },
    { number: 3, title: 'Country Looks', duration: '3:35', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/03%20Country%20Looks.mp3', purchaseUrl: 'https://square.link/u/FT28aIJZ' },
    { number: 4, title: 'Tractor Heart', duration: '3:45', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/04%20Tractor%20Heart.mp3', purchaseUrl: 'https://square.link/u/yc0nV212' },
    { number: 5, title: "Country Lovin'", duration: '3:52', previewUrl: "https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/05%20Country%20Lovin'.mp3", purchaseUrl: 'https://square.link/u/SnTml1ps' },
    { number: 6, title: 'Backroad Love', duration: '3:38', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/06%20Backroad%20Love.mp3', purchaseUrl: 'https://square.link/u/14e5l2p6' },
    { number: 7, title: 'Country Tangled', duration: '3:48', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/07%20Country%20Tangled.mp3', purchaseUrl: 'https://square.link/u/UN5iXDrE' },
    { number: 8, title: 'The Stash', duration: '3:25', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/08%20The%20Stash.mp3', purchaseUrl: 'https://square.link/u/gZ9LdWRe' },
    { number: 9, title: 'Truckbed', duration: '3:32', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/09%20Truckbed.mp3', purchaseUrl: 'https://square.link/u/QhtXJbYx' },
    { number: 10, title: 'Night on the Farm', duration: '3:55', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/10%20Night%20On%20the%20Farm.mp3', purchaseUrl: 'https://square.link/u/NiuiZitK' },
    { number: 11, title: 'Innocent Love', duration: '3:40', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/11%20Innocent%20Love.mp3', purchaseUrl: 'https://square.link/u/1ztXzbuu' },
    { number: 12, title: 'Country Breakup', duration: '3:48', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/12%20Country%20Breakup.mp3', purchaseUrl: 'https://square.link/u/QzW1bYfl' },
    { number: 13, title: 'I Choose the Truck', duration: '3:35', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/13%20I%20Choose%20the%20Truck.mp3', purchaseUrl: 'https://square.link/u/yoVxzSMt' },
    { number: 14, title: 'Muddy Mistake', duration: '3:42', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/14%20Muddy%20Mistake.mp3', purchaseUrl: 'https://square.link/u/eGGOw13e' },
    { number: 15, title: 'Drunk Love', duration: '3:28', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/15%20Drunk%20Love.mp3', purchaseUrl: 'https://square.link/u/pjnaC8Sw' },
    { number: 16, title: 'The Barn is a Secret', duration: '4:05', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/16%20The%20Barn%20Is%20a%20Secret.mp3', purchaseUrl: 'https://square.link/u/dYj0rvWO' },
    { number: 17, title: 'The Old You and Me', duration: '3:52', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/17%20The%20Old%20You%20and%20Me.mp3', purchaseUrl: 'https://square.link/u/N0bDGyKx' },
    { number: 18, title: 'Heartbreak Song', duration: '4:15', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/18%20Heartbreak%20Song.mp3', purchaseUrl: 'https://square.link/u/UiIMPsRM' },
    { number: 19, title: 'Young Love', duration: '3:38', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/19%20Young%20Love.mp3', purchaseUrl: 'https://square.link/u/tVeSuAoC' },
    { number: 20, title: "Family Livin'", duration: '3:45', previewUrl: "https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/20%20Family%20Livin'.mp3", purchaseUrl: 'https://square.link/u/0iah9h9s' },
    { number: 21, title: 'Tractor Tango', duration: '3:55', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/21%20Tractor%20Tango.mp3', purchaseUrl: 'https://square.link/u/FsUC9ejz' },
    { number: 22, title: 'Golden Heartbreak', duration: '4:32', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/22%20Golden%20Heartbreak.mp3', purchaseUrl: 'https://square.link/u/qaj4NSW0' },
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

              {/* Digital Download */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-lg p-6 mb-4">
                <h3 className="text-sm text-gray-400 mb-1">Digital Download (Vol 1 & 2)</h3>
                <p className="text-3xl font-bold text-white mb-2">${album.digitalPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mb-3">Instant delivery • High-quality MP3 • All 22 Tracks</p>
                <a 
                  href="https://square.link/u/BW8KT7V9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon-purple flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  Buy Digital Album
                </a>
              </div>

              {/* Physical CD Options */}
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-400/30 rounded-lg p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Vol 1 CD</h3>
                  <p className="text-2xl font-bold text-white mb-2">$9.99</p>
                  <p className="text-xs text-gray-400 mb-3">12 Tracks • Shipped</p>
                  <a 
                    href="https://square.link/u/1nvKDsyS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Vol 1
                  </a>
                </div>

                <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-400/30 rounded-lg p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Vol 2 CD</h3>
                  <p className="text-2xl font-bold text-white mb-2">$9.99</p>
                  <p className="text-xs text-gray-400 mb-3">10 Tracks • Shipped</p>
                  <a 
                    href="https://square.link/u/PqMPghF9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Vol 2
                  </a>
                </div>

                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-lg p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Bundle (Vol 1 & 2)</h3>
                  <p className="text-2xl font-bold text-white mb-2">$14.99</p>
                  <p className="text-xs text-gray-400 mb-3">22 Tracks • Save $5</p>
                  <a 
                    href="https://square.link/u/27uIXqSY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon-yellow flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Bundle
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
          
          <TracklistPlayer tracks={tracklist} accentColor="yellow" />
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
