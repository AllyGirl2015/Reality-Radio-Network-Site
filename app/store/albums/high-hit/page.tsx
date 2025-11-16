import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'High Hit | Mathew Cage',
  description: "Buy High Hit album by Mathew Cage. A multi-meaning album of fire and resolve. A voice for the people. Digital $8.99 / Physical $14.99",
};

export default function HighHitAlbumPage() {
  const album = {
    title: 'High Hit',
    artist: 'Mathew Cage',
    genre: 'Alt Rock / Protest Rock',
    year: 2025,
    tracks: 10,
    duration: '41:40',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: 'RRN-MC-HH',
    image: '/High Hit.svg',
    description: 'A multi-meaning album of fire and resolve. High Hit is a voice for the people, channeling raw emotion and social consciousness into powerful rock anthems. Mathew Cage delivers his most politically charged and emotionally resonant work, creating a soundtrack for resistance and hope.',
  };

  const tracklist = [
    { number: 1, title: 'Scraps', duration: '4:12', featured: true },
    { number: 2, title: 'One Drink', duration: '3:45' },
    { number: 3, title: 'Fallen Dust', duration: '4:28' },
    { number: 4, title: 'Drown It Out', duration: '3:52', featured: true },
    { number: 5, title: 'Chronicles', duration: '4:05' },
    { number: 6, title: 'Reflection', duration: '3:38' },
    { number: 7, title: 'Hollow Leaning', duration: '4:18' },
    { number: 8, title: 'Youth', duration: '4:42', featured: true },
    { number: 9, title: 'High Hit', duration: '3:55', featured: true },
    { number: 10, title: 'Made Us', duration: '4:25' },
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
                  NEW RELEASE
                </span>
              </div>

              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <Link href="/talents/mathew-cage" className="text-xl sm:text-2xl text-gray-300 hover:text-red-400 transition-colors">
                  {album.artist}
                </Link>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {album.description}
              </p>

              <div className="bg-black/60 border-l-4 border-red-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg">
                  "This album is for everyone who's ever felt unheard. Every voice matters. Every struggle counts. This is our moment to rise."
                </p>
                <p className="text-red-400 text-sm mt-2">— Mathew Cage</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-400/30 rounded-lg p-6">
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

                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 rounded-lg p-6">
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
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 border border-red-400/30 rounded-lg text-center text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
                <Link href="/talents/mathew-cage" className="px-6 py-3 border border-cyan-400/30 rounded-lg text-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
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
            <Music className="w-8 h-8 text-red-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Tracklist</span>
          </h2>
          
          <div className="bg-black/40 border border-red-500/30 rounded-lg overflow-hidden">
            {tracklist.map((track, index) => (
              <div
                key={track.number}
                className={`flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors ${
                  index !== tracklist.length - 1 ? 'border-b border-red-500/20' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-gray-500 font-mono text-sm w-6 text-right flex-shrink-0">{track.number}</span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{track.title}</h3>
                      {track.featured && (
                        <span className="text-xs text-red-400">Featured Track</span>
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
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Album Details
          </h2>

          <div className="bg-black/40 border border-red-500/30 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About This Album</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-red-400 font-semibold">High Hit</span> represents Mathew Cage's evolution as both an artist and 
                an activist. This album fearlessly tackles social issues, political discourse, and personal struggle while maintaining 
                the raw emotional power that defines his sound.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With lyrics that challenge the status quo and melodies that refuse to be forgotten, High Hit is more than just music. 
                It's a rallying cry for change, a testament to resilience, and a reminder that art can be both beautiful and purposeful. 
                Each track builds on themes of empowerment, justice, and the unbreakable human spirit.
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
            Explore More from Mathew Cage
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Discover his complete discography and learn more about his musical activism.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/talents/mathew-cage" className="btn-neon-purple">
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
