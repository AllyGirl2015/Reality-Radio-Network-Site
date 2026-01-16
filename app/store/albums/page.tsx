import { Metadata } from 'next';
import Link from 'next/link';
import { Disc, Music } from 'lucide-react';
import Section from '@/components/Section';
import { AlbumCard } from '@/components/cards';
import { getAllAlbums } from '@/lib/services/albums';

export const metadata: Metadata = {
  title: 'Albums | Buy Full-Length Music',
  description: 'Browse all albums from Reality Radio Network artists. Digital downloads ($8.99) and physical CDs ($9.99-$29.99). Support independent music.',
  openGraph: {
    title: 'Albums | Reality Radio Network',
    description: 'Shop full-length albums from AI-powered artists. Digital and physical formats available.',
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function AlbumsPage() {
  const albums = await getAllAlbums();

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
        {albums.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Disc className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg">No albums available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new releases!</p>
          </div>
        )}
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
