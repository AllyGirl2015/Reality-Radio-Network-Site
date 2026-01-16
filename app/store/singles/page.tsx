import { Metadata } from 'next';
import Link from 'next/link';
import { Music, Play, Disc } from 'lucide-react';
import Section from '@/components/Section';
import { SingleCard } from '@/components/cards';
import { getAllSingles, getFeaturedSingles } from '@/lib/services/singles';

export const metadata: Metadata = {
  title: 'Singles | Buy Individual Tracks',
  description: 'Browse all singles from Reality Radio Network. Individual tracks from $0.99. Instant digital download.',
  openGraph: {
    title: 'Singles | Reality Radio Network',
    description: 'Shop individual tracks from our AI-powered artists. Instant digital downloads.',
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function SinglesPage() {
  const [allSingles, featuredSingles] = await Promise.all([
    getAllSingles(),
    getFeaturedSingles(),
  ]);

  // Get non-featured singles
  const featuredIds = new Set(featuredSingles.map(s => s.id));
  const moreSingles = allSingles.filter(s => !featuredIds.has(s.id));

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="text-center max-w-3xl mx-auto px-4">
          <Music className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 mx-auto mb-4 md:mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Singles</span>
            <br />
            <span className="text-white">Instant Impact</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
            Individual tracks from our best albums. Starting at <span className="text-cyan-400 font-bold">$0.99</span>.
            {' '}Instant digital download.
          </p>
        </div>
      </Section>

      {/* Featured Singles */}
      {featuredSingles.length > 0 && (
        <Section background="solid">
          <div className="mb-8 md:mb-12 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-purple-400" aria-hidden="true" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Featured Singles</span>
            </h2>
            <p className="text-gray-400">Hand-picked tracks that showcase our artists' best work</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 px-4">
            {featuredSingles.map((single) => (
              <SingleCard key={single.id} single={single} variant="featured" />
            ))}
          </div>
        </Section>
      )}

      {/* All Singles */}
      <Section background={featuredSingles.length > 0 ? undefined : "solid"}>
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Disc className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {featuredSingles.length > 0 ? 'More Singles' : 'All Singles'}
            </span>
          </h2>
          <p className="text-gray-400">Browse our complete catalog of individual tracks</p>
        </div>

        {moreSingles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-4">
            {moreSingles.map((single) => (
              <SingleCard key={single.id} single={single} variant="compact" />
            ))}
          </div>
        ) : allSingles.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg">No singles available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new releases!</p>
          </div>
        ) : null}
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center px-4">
          <Disc className="w-12 h-12 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Want the full experience?
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Check out our complete albums for the full artistic vision.
          </p>
          <Link href="/store/albums" className="btn-neon">
            Browse Albums
          </Link>
        </div>
      </Section>
    </main>
  );
}
