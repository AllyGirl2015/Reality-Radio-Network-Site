import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Disc, ShoppingCart, Music, ArrowRight } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Albums | Buy Full-Length Music',
  description: 'Browse all albums from Reality Radio Network artists. Digital downloads ($8.99) and physical CDs ($9.99-$29.99). Support independent music.',
  openGraph: {
    title: 'Albums | Reality Radio Network',
    description: 'Shop full-length albums from AI-powered artists. Digital and physical formats available.',
  },
};

export default function AlbumsPage() {
  const albums = [
    {
      slug: 'americas-changed',
      title: "America's Changed",
      artist: 'Johnathan Gold & Guilded Hearts',
      genre: 'Country / Americana',
      year: 2025,
      tracks: 10,
      duration: '38:42',
      digitalPrice: 8.99,
      physicalPrice: 14.99,
      image: '/America\'s Changed.png',
      description: 'A heartland journey through quiet strength, gas-station prayers, and Main Street goodbyes — where country roots meet modern storytelling.',
    },
    {
      slug: 'shattered-peaces',
      title: 'Shattered Peaces',
      artist: 'Mathew Cage',
      genre: 'Alt Rock / Emotional Rock',
      year: 2025,
      tracks: 10,
      duration: '42:15',
      digitalPrice: 8.99,
      physicalPrice: 19.99,
      image: '/Shattered Peaces.png',
      description: 'Dives into the depths of emotion, resilience, and identity through gritty rock and raw expression — torn between darkness and light.',
    },
    {
      slug: 'barefoot-supernova',
      title: 'Barefoot Supernova',
      artist: 'Kaira Heartfelt',
      genre: 'Country-Pop',
      year: 2025,
      tracks: 13,
      duration: '45:20',
      digitalPrice: 8.99,
      physicalPrice: 14.99,
      image: '/Barefoot Supernova.png',
      description: 'Small-town sparks and big-sky dreams — pairs country heart with modern storytelling for an unforgettable journey.',
    },
    {
      slug: 'heartfelt-rebellion',
      title: 'Heartfelt Rebellion',
      artist: 'Johnathan Gold & Guilded Hearts',
      genre: 'Country Rock',
      year: 2025,
      tracks: 13,
      duration: '48:33',
      digitalPrice: 8.99,
      physicalPrice: 16.99,
      image: '/Heartfelt Rebellion.png',
      description: 'A bold country-rock statement — tackling faith, fire, and the fight for authenticity with trademark grit and full force.',
    },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <Disc className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Full Albums</span>
            <br />
            <span className="text-white">Complete Stories</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            Explore our complete album collection. Digital downloads at <span className="text-purple-400 font-bold">$8.99</span> 
            {' '}or physical CDs from <span className="text-cyan-400 font-bold">$9.99</span>.
          </p>
        </div>
      </Section>

      {/* Albums Grid */}
      <Section background="solid">
        <div className="grid md:grid-cols-2 gap-8">
          {albums.map((album) => (
            <Link
              key={album.slug}
              href={`/store/albums/${album.slug}`}
              className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {/* Album Cover */}
                <div className="relative w-full md:w-64 h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0">
                  <Image
                    src={album.image}
                    alt={`${album.title} album cover`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-purple-500/90 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                      View Details
                    </div>
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-400 mb-3">
                      {album.year} • {album.genre}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                    {album.title}
                  </h2>
                  
                  <p className="text-gray-400 mb-4">{album.artist}</p>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                    {album.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" aria-hidden="true" />
                      {album.tracks} tracks
                    </span>
                    <span>{album.duration}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Digital</p>
                        <p className="text-lg font-bold text-purple-400">${album.digitalPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Physical CD</p>
                        <p className="text-lg font-bold text-cyan-400">${album.physicalPrice}</p>
                      </div>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <Music className="w-12 h-12 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Can't decide? Try our singles first!
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Sample individual tracks before committing to a full album.
          </p>
          <Link href="/store/singles" className="btn-neon">
            Browse Singles
          </Link>
        </div>
      </Section>
    </main>
  );
}
