import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';
import TracklistPlayer from '@/components/TracklistPlayer';

export const metadata: Metadata = {
  title: 'Descend | Chronix',
  description: "Buy Descend album by Chronix. The mind descends into darkness so easily, but sometimes it also grows in the darkness. Descend into it, and rise out stronger than ever. Digital $8.99 / Physical $14.99",
};

export default function DecendAlbumPage() {
  const album = {
    title: 'Descend',
    artist: 'Chronix',
    genre: 'Experimental Electronic / Dark Ambient',
    year: 2025,
    tracks: 10,
    duration: '44:03',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: 'RRN-CHX-DEC',
    image: '/Decend.svg',
    description: 'The mind descends into darkness so easily, but sometimes it also grows in the darkness rather than falling to it. Descend is an immersive sonic journey through the depths of human consciousness, exploring the transformative power of embracing our shadows. Chronix creates a soundscape where darkness becomes a space for growth, introspection, and ultimately, emergence.',
  };

  const tracklist = [
    { number: 1, title: 'Starting Line', duration: '4:12', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/01%20Starting%20Line.mp3', purchaseUrl: 'https://square.link/u/EQCSb9Zm' },
    { number: 2, title: 'Power of the Few', duration: '4:38', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/02%20Power%20of%20the%20Few.mp3', purchaseUrl: 'https://square.link/u/gILHmo6H' },
    { number: 3, title: 'Rags No More', duration: '4:05', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/03%20Rags%20No%20More.mp3', purchaseUrl: 'https://square.link/u/tW4GpZEt' },
    { number: 4, title: 'Hate No More', duration: '4:22', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/04%20Hate%20No%20More.mp3', purchaseUrl: 'https://square.link/u/GoUQUJXA' },
    { number: 5, title: 'Mark Me Down', duration: '4:48', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/05%20Mark%20Me%20Down.mp3', purchaseUrl: 'https://square.link/u/1vzafXZ0' },
    { number: 6, title: 'No Mistakes', duration: '3:55', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/06%20No%20Mistakes.mp3', purchaseUrl: 'https://square.link/u/uoLk32wj' },
    { number: 7, title: 'Love No More', duration: '4:32', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/07%20Love%20No%20More.mp3', purchaseUrl: 'https://square.link/u/e4Ap86kt' },
    { number: 8, title: 'Kinship', duration: '4:28', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/08%20Kinship.mp3', purchaseUrl: 'https://square.link/u/nKLxawg1' },
    { number: 9, title: 'The Skies', duration: '5:18', featured: true, previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/09%20The%20Skies.mp3', purchaseUrl: 'https://square.link/u/2W1BFTCQ' },
    { number: 10, title: 'Descend', duration: '4:45', previewUrl: 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/10%20Decend.mp3', purchaseUrl: 'https://square.link/u/2u6rpcSr' },
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
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              <div className="mt-6 bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-lg p-4 text-sm space-y-2">
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
                <div className="pt-2 border-t border-indigo-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {album.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-400">
                  DEBUT ALBUM
                </span>
              </div>

              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <Link href="/talent/chronix" className="text-xl sm:text-2xl text-gray-300 hover:text-indigo-400 transition-colors">
                  {album.artist}
                </Link>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {album.description}
              </p>

              <div className="bg-black/60 border-l-4 border-indigo-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg">
                  "The mind descends into darkness so easily, but sometimes it also grows in the darkness rather than falling to it. Descend into it, and rise out stronger than ever."
                </p>
                <p className="text-indigo-400 text-sm mt-2">— Chronix</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Digital Download</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.digitalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Instant delivery • High-quality MP3</p>
                  <a 
                    href="https://square.link/u/XcnNyAXm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-neon-purple flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    Buy Digital
                  </a>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/30 rounded-lg p-6">
                  <h3 className="text-sm text-gray-400 mb-1">Physical CD</h3>
                  <p className="text-3xl font-bold text-white mb-2">${album.physicalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">Shipped • Includes digital copy</p>
                  <a 
                    href="https://square.link/u/QOfoVU7T"
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
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-indigo-400/30 rounded-lg text-center text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/talent/chronix" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
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
            <Music className="w-8 h-8 text-indigo-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Tracklist</span>
          </h2>
          
          <TracklistPlayer tracks={tracklist} accentColor="indigo" />
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Album Details
          </h2>

          <div className="bg-black/40 border border-indigo-500/30 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About This Album</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-indigo-400 font-semibold">Descend</span> marks Chronix's ambitious debut, offering listeners 
                an immersive 52-minute journey through the landscapes of consciousness. This isn't background music. It's an 
                experience that demands attention and rewards introspection.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                The album's narrative arc follows a deliberate descent into psychological darkness, but unlike traditional "dark" 
                electronic music, Descend presents this descent as an opportunity for growth rather than despair. Each track represents 
                a different stage of the journey, from the initial "First Light Fades" through the transformative "Metamorphosis" 
                to the triumphant "Emergence."
              </p>
              <p className="text-gray-300 leading-relaxed">
                Using a combination of analog synthesizers, field recordings, and advanced sound design, Chronix has created a sonic 
                palette that feels simultaneously alien and deeply human. The result is an album that challenges conventional electronic 
                music while remaining emotionally resonant and philosophically profound.
              </p>
            </div>

            <div className="pt-4 border-t border-indigo-500/20">
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

            <div className="pt-4 border-t border-indigo-500/20">
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
          <ExternalLink className="w-12 h-12 text-indigo-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Explore the Chronix Project
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Dive deeper into the experimental sonic world of Chronix and discover the philosophy behind the music.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/talent/chronix" className="btn-neon-purple">
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
