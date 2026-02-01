import { Metadata } from 'next';
import { Users, Sparkles, Music } from 'lucide-react';
import Section from '@/components/Section';
import { ArtistCard } from '@/components/cards';
import { getAllArtists } from '@/lib/services/artists';
import { getAllAlbums } from '@/lib/services/albums';
import { getAllSingles } from '@/lib/services/singles';

export const metadata: Metadata = {
  title: 'Talents | AI-Powered Personas',
  description: 'Discover unique AI-powered talents at Reality Radio Network. From country to rock, pop to experimental—each with their own sound, story, and style.',
  openGraph: {
    title: 'Talents | Reality Radio Network',
    description: 'Meet unique AI-powered personas, each with distinct sound and story.',
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function TalentsPage() {
  // Fetch all data in parallel
  const [artists, albums, singles] = await Promise.all([
    getAllArtists(),
    getAllAlbums(),
    getAllSingles(),
  ]);

  // Calculate album and single counts per artist
  const artistStats = artists.map(artist => {
    const albumCount = albums.filter(a => a.artistSlug === artist.slug || a.artist === artist.name).length;
    const singleCount = singles.filter(s => s.artistSlug === artist.slug || s.artist === artist.name).length;
    return { artist, albumCount, singleCount };
  });

  // Separate artists with releases and those without
  const activeArtists = artistStats.filter(a => a.albumCount > 0 || a.singleCount > 0);
  const upcomingArtists = artistStats.filter(a => a.albumCount === 0 && a.singleCount === 0);

  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <Section className="pb-12" background="grid">
        <div className="text-center max-w-3xl mx-auto px-4">
          <Users className="w-12 h-12 md:w-16 md:h-16 text-[#00f3ff] mx-auto mb-4 md:mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="neon-text">Our Talents</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
            Meet the unique AI-powered personas behind Reality Radio Network. 
            Each artist brings their own style, story, and sound to life.
          </p>
        </div>
      </Section>

      {/* Active Artists - With Releases */}
      {activeArtists.length > 0 && (
        <Section background="solid">
          <div className="mb-8 md:mb-12 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <Music className="w-6 h-6 md:w-8 md:h-8 text-purple-400" aria-hidden="true" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Featured Artists</span>
            </h2>
            <p className="text-gray-400">Artists with available music in our store</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {activeArtists.map(({ artist, albumCount, singleCount }) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist} 
                albumCount={albumCount}
                singleCount={singleCount}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Upcoming Artists - No Releases Yet */}
      {upcomingArtists.length > 0 && (
        <Section background={activeArtists.length > 0 ? undefined : "solid"}>
          <div className="mb-8 md:mb-12 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" aria-hidden="true" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Coming Soon</span>
            </h2>
            <p className="text-gray-400">New talents with music on the way</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {upcomingArtists.map(({ artist }) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist} 
                albumCount={0}
                singleCount={0}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Empty State */}
      {artists.length === 0 && (
        <Section background="solid">
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg">No artists available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new talent!</p>
          </div>
        </Section>
      )}

      {/* CTA Section */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center px-4">
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 neon-text">
            Ready to explore?
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Discover the music behind these unique AI-powered personas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/store/albums" className="btn-neon">
              Browse Albums
            </a>
            <a href="/store/singles" className="btn-neon-alt">
              Browse Singles
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
