import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Music, Play, ExternalLink, Users, Sparkles } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Chronix | Reality Radio Network',
  description: 'Discover Chronix, the experimental electronic artist exploring the depths of human consciousness. The mind descends into darkness so easily, but sometimes it also grows in the darkness.',
  openGraph: {
    title: 'Chronix | Reality Radio Network Artists',
    description: 'Electronic experimentation meets introspective darkness. Chronix creates soundscapes that challenge the mind.',
  },
};

export default function ChronixPage() {
  const artist = {
    name: 'Chronix',
    genre: 'Experimental Electronic / Dark Ambient',
    bio: 'Chronix is an enigmatic electronic artist who explores the depths of human consciousness through sound. Creating atmospheric soundscapes that traverse the boundary between light and darkness, Chronix\'s music is a journey through the mind\'s most hidden corners. The project challenges listeners to descend into darkness not to be consumed by it, but to grow stronger through understanding it.',
    quote: '"The mind descends into darkness so easily, but sometimes it also grows in the darkness rather than falling to it. Descend into it, and rise out stronger than ever."',
    style: 'Dark ambient textures meet experimental electronic production, creating immersive sonic experiences that are both unsettling and transformative.',
    image: '/Chronix.svg',
  };

  const albums = [
    {
      title: 'Descend',
      slug: 'decend',
      year: 2025,
      image: '/Decend.svg',
      description: 'A journey through the darkness of the mind, exploring growth through introspection.',
    },
  ];

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                <Image
                  src={artist.image}
                  alt={`${artist.name} artist photo`}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="mt-6 bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-indigo-400 mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Genre</span>
                    <span className="text-white text-right">{artist.genre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Albums</span>
                    <span className="text-white">{albums.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Label</span>
                    <span className="text-white text-right">Reality Radio Network</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <a 
                  href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full btn-neon-purple flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-400">
                  EXPERIMENTAL ARTIST
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                {artist.name}
              </h1>

              <p className="text-xl text-indigo-400 mb-6">{artist.genre}</p>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg text-gray-300 leading-relaxed mb-4">
                  {artist.bio}
                </p>
              </div>

              <div className="bg-black/60 border-l-4 border-indigo-400 rounded-r-lg p-5 mb-8">
                <p className="text-gray-300 italic text-lg leading-relaxed">
                  {artist.quote}
                </p>
                <p className="text-indigo-400 text-sm mt-3">— {artist.name}</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                  Musical Style
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {artist.style}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/store/albums" className="btn-neon-purple">
                  View Albums
                </Link>
                <Link href="/personas" className="btn-neon flex items-center gap-2">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  All Artists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="solid">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Music className="w-8 h-8 text-indigo-400" aria-hidden="true" />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Discography</span>
            </h2>
            <p className="text-gray-400">Explore {artist.name}'s sonic journey through consciousness</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link
                key={album.slug}
                href={`/store/albums/${album.slug}`}
                className="group bg-black/40 border border-indigo-500/30 rounded-lg overflow-hidden hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={album.image}
                    alt={`${album.title} album cover`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ExternalLink className="w-12 h-12 text-indigo-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{album.year}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{album.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-12 h-12 text-indigo-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Part of the Persona Adoption Program
          </h2>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            Chronix is part of our innovative approach to music creation. Learn more about our artist personas 
            and how they represent a new frontier in musical expression.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/personas" className="btn-neon-purple">
              Learn About Personas
            </Link>
            <Link href="/store" className="btn-neon">
              Browse Music Store
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
