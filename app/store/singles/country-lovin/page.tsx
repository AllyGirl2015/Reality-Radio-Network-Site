import { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Play, Music, Clock, Calendar, Tag, ArrowLeft, Disc } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: "Country Lovin' | Johnathan Gold & Guilded Hearts",
  description: "Buy Country Lovin' by Johnathan Gold & Guilded Hearts. Digital download $0.99",
};

export default function CountryLovinPage() {
  const single = {
    title: "Country Lovin'",
    artist: 'Johnathan Gold & Guilded Hearts',
    album: 'Golden Heartbreak',
    genre: 'Country',
    year: 2025,
    duration: '3:52',
    price: 0.99,
    catalog: 'RRN-JG-GH05',
    buyLink: 'https://square.link/u/SnTml1ps',
    description: 'Pure, authentic love the country way.',
  };

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link href="/store/singles" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Singles
        </Link>
      </Section>

      <Section className="pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8 lg:gap-12 items-start">
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Music className="w-20 h-20 text-purple-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-mono">SINGLE</p>
                </div>
              </div>
              
              <div className="mt-4 bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4" aria-hidden="true" />Released</span>
                  <span className="text-white font-semibold">{single.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" aria-hidden="true" />Duration</span>
                  <span className="text-white font-semibold">{single.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><Tag className="w-4 h-4" aria-hidden="true" />Genre</span>
                  <span className="text-white font-semibold">{single.genre}</span>
                </div>
                <div className="pt-2 border-t border-purple-500/20">
                  <p className="text-xs text-gray-400">Catalog #: {single.catalog}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-400">SINGLE</span>
              </div>

              <div className="mb-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{single.title}</h1>
                <p className="text-lg sm:text-xl text-gray-300">{single.artist}</p>
              </div>

              <Link href={`/store/albums/${single.album.toLowerCase().replace(/'/g, '').replace(/ /g, '-')}`} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6">
                <Disc className="w-4 h-4" aria-hidden="true" />
                From the album: <span className="font-semibold">{single.album}</span>
              </Link>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">{single.description}</p>

              <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Digital Download</h3>
                    <p className="text-sm text-gray-400">Instant delivery • High-quality MP3</p>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">${single.price.toFixed(2)}</p>
                </div>
                <a href={single.buyLink} target="_blank" rel="noopener noreferrer" className="w-full btn-neon-purple flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  Buy Single
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="flex-1 px-4 sm:px-6 py-3 border border-purple-400/30 rounded-lg text-center text-sm sm:text-base text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  Listen on Radio
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
