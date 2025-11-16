import { Metadata } from 'next';
import Link from 'next/link';
import { Music, Play, ShoppingBag, ExternalLink, Disc } from 'lucide-react';
import Section from '@/components/Section';
import { notFound } from 'next/navigation';

// This would be fetched from a database/CMS in a real app
const artistsData: Record<string, any> = {
  'johnathan-gold': {
    name: 'Johnathan Gold & Guilded Hearts',
    pronunciation: 'JON-uh-thin Gold',
    genre: '90s & Modern Country / Americana',
    bio: `Johnathan Gold's warm grit and Guilded Hearts' rich instrumentation bridge classic country and modern Americana. Their music tells stories of resilience, quiet faith, and everyday heroes—perfect for late-night drives and Sunday mornings alike.`,
    theme: 'Heartfelt, patriotic, and deeply observant. Voice of the everyday American, telling stories of unity, loss, and resilience.',
    albums: [
      {
        title: "America's Changed",
        year: 2024,
        description: 'A heartland journey through gas-station prayers and Main Street goodbyes, where country roots meet modern storytelling.',
        tracks: 12,
        href: '/store/albums/americas-changed',
      },
      {
        title: 'Heartfelt Rebellion',
        year: 2024,
        description: 'Raw harmony and honest fire, standing for love, grit, and the unquiet heart.',
        tracks: 10,
        href: '/store/albums/heartfelt-rebellion',
      },
    ],
    singles: [
      { title: "America's Changed", year: 2024, href: '/store/singles/americas-changed' },
      { title: 'Chaos Country', year: 2024, href: '/store/singles/chaos-country' },
      { title: 'Heartfelt Rebellion', year: 2024, href: '/store/singles/heartfelt-rebellion' },
      { title: 'Goodbye Mainstreet', year: 2024, href: '/store/singles/goodbye-mainstreet' },
    ],
    highlights: [
      { title: 'Chaos Country', album: 'Heartfelt Rebellion' },
      { title: 'Goodbye Mainstreet', album: "America's Changed" },
      { title: 'Generations', album: "America's Changed" },
    ],
  },
  'kaira-heartfelt': {
    name: 'Kaira Heartfelt',
    pronunciation: 'KAI-rah Heart-felt',
    genre: '2000s Country-Pop',
    bio: `Kaira Heartfelt blends small-town sparks with big-sky dreams—a country/Americana voice built on grace, grit, and melodies that linger long after the porch light fades.`,
    theme: 'Romantic fire with strength, blending emotional vulnerability with empowering country anthems.',
    albums: [
      {
        title: 'Barefoot Supernova',
        year: 2024,
        description: 'Small-town starlight meets open-road resolve. Barefoot Supernova pairs country heart with modern storytelling.',
        tracks: 11,
        href: '/store/albums/barefoot-supernova',
      },
    ],
    singles: [
      { title: 'Small Town Supernova', year: 2024, href: '/store/singles/small-town-supernova' },
      { title: 'Evil Love', year: 2024, href: '/store/singles/evil-love' },
    ],
    highlights: [
      { title: 'Small Town Supernova', album: 'Barefoot Supernova' },
      { title: 'Evil Love', album: 'Barefoot Supernova' },
      { title: 'Beautiful Broken Love (Ft. Johnathan Gold)', album: 'Barefoot Supernova' },
    ],
  },
  'mathew-cage': {
    name: 'Mathew Cage',
    pronunciation: 'MATH-yoo Cage',
    genre: 'Alt Rock / Emotional Rock',
    bio: `Mathew Cage channels internal chaos into powerful waves of sound—a rock-driven, emotionally raw artist who turns pain into poetry. With a voice sharpened by heartbreak and lyrics forged from personal reckoning, Cage delivers catharsis, not just songs.`,
    theme: 'Gritty and raw, tackling mental health struggles, survival, and personal redemption.',
    albums: [
      {
        title: 'Shattered Peaces',
        year: 2024,
        description: 'A volatile journey through fracture, resolve, and resurrection. Shattered Peaces walks the line between collapse and clarity.',
        tracks: 10,
        href: '/store/albums/shattered-peaces',
      },
    ],
    singles: [
      { title: 'World of Gold', year: 2024, href: '/store/singles/world-of-gold' },
      { title: 'Fallen Flag', year: 2024, href: '/store/singles/fallen-flag' },
      { title: 'In the Devil\'s Name I Pray', year: 2024, href: '/store/singles/in-the-devils-name' },
    ],
    highlights: [
      { title: 'Fractured Signal', album: 'Shattered Peaces' },
      { title: 'In the Devil\'s Name I Pray', album: 'Shattered Peaces' },
      { title: 'Fallen Flag', album: 'Shattered Peaces' },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(artistsData).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const artist = artistsData[params.slug];
  
  if (!artist) {
    return {
      title: 'Artist Not Found',
    };
  }

  return {
    title: `${artist.name} | Talent Profile`,
    description: `${artist.bio}`,
    openGraph: {
      title: `${artist.name} | Reality Radio Network`,
      description: artist.theme,
    },
  };
}

export default function TalentPage({ params }: { params: { slug: string } }) {
  const artist = artistsData[params.slug];

  if (!artist) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12" background="grid">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Artist Image Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-[#00f3ff]/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Music className="w-32 h-32 text-[#00f3ff] opacity-50" />
            </div>

            {/* Artist Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-text">
                {artist.name}
              </h1>
              <p className="text-sm text-gray-500 mb-4">{artist.pronunciation}</p>
              <p className="text-xl text-[#0ff] mb-6">{artist.genre}</p>
              
              <div className="card-neon bg-[#00f3ff]/5 mb-6">
                <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
              </div>

              <div className="card-neon mb-6">
                <h3 className="text-sm font-semibold text-[#00f3ff] mb-2">Theme & Style</h3>
                <p className="text-sm text-gray-400">{artist.theme}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/store" className="btn-neon flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Music
                </Link>
                <Link href="/personas" className="btn-neon-cyan flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Adopt Persona
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Discography - Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <Section background="solid">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Disc className="w-8 h-8 text-[#00f3ff]" />
              <span className="neon-text">Albums</span>
            </h2>

            <div className="space-y-6">
              {artist.albums.map((album: any, index: number) => (
                <Link
                  key={index}
                  href={album.href}
                  className="group card-neon flex flex-col md:flex-row gap-6 hover:bg-[#00f3ff]/5 transition-colors"
                >
                  <div className="w-full md:w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-16 h-16 text-[#00f3ff] opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold group-hover:text-[#00f3ff] transition-colors">
                          {album.title}
                        </h3>
                        <p className="text-sm text-gray-500">{album.year}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#00f3ff]/20 text-[#00f3ff] text-xs rounded border border-[#00f3ff]">
                        {album.tracks} tracks
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{album.description}</p>
                    <div className="flex items-center gap-2 text-[#00f3ff]">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">Listen & Buy →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Highlighted Tracks */}
      {artist.highlights && artist.highlights.length > 0 && (
        <Section background="gradient">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Music className="w-8 h-8 text-[#0ff]" />
              <span className="neon-text-cyan">Highlighted Tracks</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artist.highlights.map((track: any, index: number) => (
                <div key={index} className="card-neon flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0ff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-6 h-6 text-[#0ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{track.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{track.album}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Singles */}
      {artist.singles && artist.singles.length > 0 && (
        <Section background="solid">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Music className="w-8 h-8 text-[#00f3ff]" />
              <span className="neon-text">Singles</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {artist.singles.map((single: any, index: number) => (
                <Link
                  key={index}
                  href={single.href}
                  className="group card-neon flex items-center gap-4 hover:bg-[#00f3ff]/5 transition-colors"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00f3ff]/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-6 h-6 text-[#00f3ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold group-hover:text-[#00f3ff] transition-colors truncate">
                      {single.title}
                    </h3>
                    <p className="text-sm text-gray-500">{single.year}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#00f3ff] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section background="grid">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 neon-text">
            Support {artist.name}
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Every purchase directly supports Reality Radio Network's mission to elevate real talent.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/store" className="btn-neon flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shop Albums & Singles
            </Link>
            <Link href="/personas" className="btn-neon-cyan flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Adopt This Persona
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
