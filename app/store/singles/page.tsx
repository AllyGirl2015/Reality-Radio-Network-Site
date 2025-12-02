import { Metadata } from 'next';
import Link from 'next/link';
import { Music, Play, ShoppingCart, ArrowRight } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Singles | Buy Individual Tracks',
  description: 'Browse all singles from Reality Radio Network. Individual tracks from $0.99. Instant digital download.',
  openGraph: {
    title: 'Singles | Reality Radio Network',
    description: 'Shop individual tracks from our AI-powered artists. Instant digital downloads.',
  },
};

export default function SinglesPage() {
  const singles = [
    // === JOHNATHAN GOLD - America's Changed Album ===
    { slug: 'americas-changed', title: "America's Changed", artist: 'Johnathan Gold & Guilded Hearts', album: "America's Changed", genre: 'Country / Americana', duration: '3:20', price: 0.99, featured: true, hasLink: true, description: 'A powerful and unapologetic anthem reflecting the state of a changing nation.' },
    { slug: 'goodbye-mainstreet', title: 'Goodbye Mainstreet', artist: 'Johnathan Gold & Guilded Hearts', album: "America's Changed", genre: 'Country', duration: '3:35', price: 0.99, featured: false, hasLink: true },
    { slug: 'she-wore-red-i-wore-blue', title: 'She Wore Red, I Wore Blue', artist: 'Johnathan Gold & Guilded Hearts', album: "America's Changed", genre: 'Country', duration: '4:05', price: 0.99, featured: false, hasLink: true },
    { slug: 'god-blessed-the-silent-ones', title: 'God Blessed the Silent Ones', artist: 'Johnathan Gold & Guilded Hearts', album: "America's Changed", genre: 'Country', duration: '3:58', price: 0.99, featured: false, hasLink: true },
    { slug: 'gas-station-prayers', title: 'Gas Station Prayers', artist: 'Johnathan Gold & Guilded Hearts', album: "America's Changed", genre: 'Country', duration: '4:12', price: 0.99, featured: false, hasLink: true },

    // === JOHNATHAN GOLD - Heartfelt Rebellion Album ===
    { slug: 'heartfelt-rebellion', title: 'Heartfelt Rebellion', artist: 'Johnathan Gold & Guilded Hearts', album: 'Heartfelt Rebellion', genre: 'Country Rock', duration: '3:28', price: 0.99, featured: true, hasLink: true, description: 'A defiant anthem wrapped in soul-soaked strings and weathered vocals.' },
    { slug: 'country-bonfire', title: 'Country Bonfire', artist: 'Johnathan Gold & Guilded Hearts', album: 'Heartfelt Rebellion', genre: 'Country Rock', duration: '3:48', price: 0.99, featured: false, hasLink: true },
    { slug: 'screens', title: 'Screens', artist: 'Johnathan Gold & Guilded Hearts', album: 'Heartfelt Rebellion', genre: 'Country Rock', duration: '3:22', price: 0.99, featured: false, hasLink: true },
    { slug: 'forgotten-sons', title: 'Forgotten Sons', artist: 'Johnathan Gold & Guilded Hearts', album: 'Heartfelt Rebellion', genre: 'Country Rock', duration: '4:18', price: 0.99, featured: false, hasLink: true },
    { slug: 'chaos-country', title: 'Chaos Country', artist: 'Johnathan Gold & Guilded Hearts', album: 'Heartfelt Rebellion', genre: 'Country Rock', duration: '3:55', price: 0.99, featured: true, hasLink: true, description: 'A gritty, defiant anthem wrapped in dust and distortion.' },

    // === JOHNATHAN GOLD - Golden Heartbreak Vol 1 ===
    { slug: 'back-when-we-fell', title: 'Back When We Fell', artist: 'Johnathan Gold & Guilded Hearts', album: 'Golden Heartbreak', genre: 'Country', duration: '3:42', price: 0.99, featured: true, hasLink: true, description: 'A nostalgic journey through memories of first love.' },
    { slug: 'city-girl', title: 'City Girl', artist: 'Johnathan Gold & Guilded Hearts', album: 'Golden Heartbreak', genre: 'Country', duration: '3:28', price: 0.99, featured: false, hasLink: true },
    { slug: 'country-looks', title: 'Country Looks', artist: 'Johnathan Gold & Guilded Hearts', album: 'Golden Heartbreak', genre: 'Country', duration: '3:35', price: 0.99, featured: false, hasLink: true },
    { slug: 'tractor-heart', title: 'Tractor Heart', artist: 'Johnathan Gold & Guilded Hearts', album: 'Golden Heartbreak', genre: 'Country', duration: '3:45', price: 0.99, featured: false, hasLink: true },
    { slug: 'country-lovin', title: "Country Lovin'", artist: 'Johnathan Gold & Guilded Hearts', album: 'Golden Heartbreak', genre: 'Country', duration: '3:52', price: 0.99, featured: false, hasLink: true },

    // === KAIRA HEARTFELT - Barefoot Supernova ===
    { slug: 'small-town-supernova', title: 'Small Town Supernova', artist: 'Kaira Heartfelt', album: 'Barefoot Supernova', genre: 'Country-Pop', duration: '3:18', price: 0.99, featured: true, hasLink: true, description: 'Small-town dreams with cosmic ambitions.' },
    { slug: 'country-girl', title: 'Country Girl', artist: 'Kaira Heartfelt', album: 'Barefoot Supernova', genre: 'Country-Pop', duration: '3:25', price: 0.99, featured: false, hasLink: true },
    { slug: 'barefoot-change', title: 'Barefoot Change', artist: 'Kaira Heartfelt', album: 'Barefoot Supernova', genre: 'Country-Pop', duration: '3:42', price: 0.99, featured: false, hasLink: true },
    { slug: 'lovestruck', title: 'Lovestruck', artist: 'Kaira Heartfelt', album: 'Barefoot Supernova', genre: 'Country-Pop', duration: '3:15', price: 0.99, featured: false, hasLink: true },
    { slug: 'evil-love', title: 'Evil Love', artist: 'Kaira Heartfelt', album: 'Barefoot Supernova', genre: 'Country-Pop', duration: '3:38', price: 0.99, featured: true, hasLink: true, description: 'Haunting vocals diving into the toxic side of passion.' },

    // === KAIRA HEARTFELT - Stellar Love ===
    { slug: 'lustful-love', title: 'Lustful Love', artist: 'Kaira Heartfelt', album: 'Stellar Love', genre: 'Country-Pop', duration: '3:28', price: 0.99, featured: true, hasLink: true, description: 'An intoxicating blend of desire and country soul.' },
    { slug: 'love-killer', title: 'Love Killer', artist: 'Kaira Heartfelt', album: 'Stellar Love', genre: 'Country-Pop', duration: '3:45', price: 0.99, featured: false, hasLink: true },
    { slug: 'the-stars-above', title: 'The Stars Above', artist: 'Kaira Heartfelt', album: 'Stellar Love', genre: 'Country-Pop', duration: '3:52', price: 0.99, featured: false, hasLink: true },
    { slug: 'take-my-love', title: 'Take My Love', artist: 'Kaira Heartfelt', album: 'Stellar Love', genre: 'Country-Pop', duration: '3:18', price: 0.99, featured: false, hasLink: true },

    // === MATHEW CAGE - Shattered Peaces ===
    { slug: 'world-of-gold', title: 'World of Gold', artist: 'Mathew Cage', album: 'Shattered Peaces', genre: 'Alt Rock', duration: '3:06', price: 0.99, featured: true, hasLink: true, description: 'Cinematic emotion and haunting realism about the corruptive grip of wealth.' },
    { slug: 'fractured-signal', title: 'Fractured Signal', artist: 'Mathew Cage', album: 'Shattered Peaces', genre: 'Alt Rock', duration: '4:02', price: 0.99, featured: false, hasLink: true },
    { slug: 'the-line-was-crossed', title: 'The Line Was Crossed', artist: 'Mathew Cage', album: 'Shattered Peaces', genre: 'Alt Rock', duration: '3:58', price: 0.99, featured: false, hasLink: true },
    { slug: 'echoes-of-the-cage', title: 'Echoes of the Cage', artist: 'Mathew Cage', album: 'Shattered Peaces', genre: 'Alt Rock', duration: '4:28', price: 0.99, featured: false, hasLink: true },
    { slug: 'fallen-flag', title: 'Fallen Flag', artist: 'Mathew Cage', album: 'Shattered Peaces', genre: 'Alt Rock', duration: '5:05', price: 2.00, featured: true, hasLink: true, description: 'A cinematic alt-rock ballad that grieves what we lost and faces what remains.' },

    // === MATHEW CAGE - High Hit ===
    { slug: 'scraps', title: 'Scraps', artist: 'Mathew Cage', album: 'High Hit', genre: 'Alt Rock', duration: '4:12', price: 0.99, featured: true, hasLink: true, description: 'Raw and unfiltered emotion from the streets.' },
    { slug: 'one-drink', title: 'One Drink', artist: 'Mathew Cage', album: 'High Hit', genre: 'Alt Rock', duration: '3:45', price: 0.99, featured: false, hasLink: true },
    { slug: 'fallen-dust', title: 'Fallen Dust', artist: 'Mathew Cage', album: 'High Hit', genre: 'Alt Rock', duration: '4:28', price: 0.99, featured: false, hasLink: true },
    { slug: 'drown-it-out', title: 'Drown it Out', artist: 'Mathew Cage', album: 'High Hit', genre: 'Alt Rock', duration: '3:52', price: 0.99, featured: false, hasLink: true },
    { slug: 'chronicles', title: 'Chronicles', artist: 'Mathew Cage', album: 'High Hit', genre: 'Alt Rock', duration: '4:05', price: 0.99, featured: false, hasLink: true },

    // === CHRONIX - Descend ===
    { slug: 'starting-line', title: 'Starting Line', artist: 'Chronix', album: 'Descend', genre: 'Electronic', duration: '4:12', price: 0.99, featured: true, hasLink: true, description: 'The beginning of a dark electronic journey.' },
    { slug: 'power-of-the-few', title: 'Power of the Few', artist: 'Chronix', album: 'Descend', genre: 'Electronic', duration: '4:38', price: 0.99, featured: false, hasLink: true },
    { slug: 'rags-no-more', title: 'Rags No More', artist: 'Chronix', album: 'Descend', genre: 'Electronic', duration: '4:05', price: 0.99, featured: false, hasLink: true },
    { slug: 'hate-no-more', title: 'Hate No More', artist: 'Chronix', album: 'Descend', genre: 'Electronic', duration: '4:22', price: 0.99, featured: false, hasLink: true },
    { slug: 'mark-me-down', title: 'Mark Me Down', artist: 'Chronix', album: 'Descend', genre: 'Electronic', duration: '4:48', price: 0.99, featured: false, hasLink: true },
  ];

  const featuredSingles = singles.filter(s => s.featured);
  const moreSingles = singles.filter(s => !s.featured);

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
      <Section background="solid">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Play className="w-6 h-6 md:w-8 md:h-8 text-purple-400" aria-hidden="true" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Featured Singles</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Handpicked tracks from our catalog</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
          {featuredSingles.map((single) => (
            <Link
              key={single.slug}
              href={`/store/singles/${single.slug}`}
              className="group bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Play Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border-2 border-purple-400/30 group-hover:border-purple-400 group-hover:scale-110 transition-all duration-300">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 group-hover:text-purple-300" aria-hidden="true" />
              </div>

              <h3 className="text-base sm:text-lg font-bold mb-1 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all break-words">
                {single.title}
              </h3>
              
              <p className="text-sm text-gray-400 text-center mb-2">{single.artist}</p>
              
              <p className="text-xs text-gray-500 text-center mb-3">
                {single.album} • {single.duration}
              </p>

              {single.description && (
                <p className="text-sm text-gray-300 text-center mb-4 leading-relaxed">
                  {single.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                <span className="text-2xl font-bold text-purple-400">${single.price.toFixed(2)}</span>
                <div className="flex items-center gap-2 text-sm text-cyan-400 group-hover:text-cyan-300">
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* More Singles */}
      <Section background="gradient">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">More Singles</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Explore the full catalog</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-4">
          {moreSingles.map((single) => (
            <Link
              key={single.slug}
              href={`/store/singles/${single.slug}`}
              className="group bg-black/40 border border-cyan-500/30 rounded-lg flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-cyan-500/5 hover:border-cyan-400 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-400/30 group-hover:border-cyan-400 transition-all">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" aria-hidden="true" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {single.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">{single.artist}</p>
                <p className="text-xs text-gray-500">{single.album} • {single.duration}</p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-cyan-400">${single.price.toFixed(2)}</p>
                <ArrowRight className="w-4 h-4 text-cyan-400 ml-auto group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <ShoppingCart className="w-12 h-12 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Love multiple tracks? Save with albums!
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Get the complete experience with full albums starting at just $8.99.
          </p>
          <Link href="/store/albums" className="btn-neon-purple">
            Browse Albums
          </Link>
        </div>
      </Section>
    </main>
  );
}
