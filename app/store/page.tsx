import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Music, Disc, Sparkles, Play } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Store | Buy Albums, Singles & Physical Music',
  description: 'Shop original AI-powered music from Reality Radio Network. Digital downloads, physical CDs, vinyl, and exclusive merchandise. Support independent artists.',
  openGraph: {
    title: 'Store | Reality Radio Network',
    description: 'Shop original music. Digital downloads, physical CDs, and exclusive merch.',
  },
};

export default function StorePage() {
  const featuredAlbums = [
    {
      title: "America's Changed",
      artist: 'Johnathan Gold & Guilded Hearts',
      price: '$8.99',
      cdPrice: '$9.99',
      tracks: 10,
      genre: 'Country / Americana',
      href: '/store/albums/americas-changed',
      image: '/America\'s Changed.png',
    },
    {
      title: 'Shattered Peaces',
      artist: 'Mathew Cage',
      price: '$8.99',
      cdPrice: '$9.99',
      tracks: 10,
      genre: 'Alt Rock',
      href: '/store/albums/shattered-peaces',
      image: '/Shattered Peaces.png',
    },
    {
      title: 'Barefoot Supernova',
      artist: 'Kaira Heartfelt',
      price: '$8.99',
      cdPrice: '$9.99',
      tracks: 13,
      genre: 'Country-Pop',
      href: '/store/albums/barefoot-supernova',
      image: '/Barefoot Supernova.png',
    },
    {
      title: 'Heartfelt Rebellion',
      artist: 'Johnathan Gold & Guilded Hearts',
      price: '$8.99',
      cdPrice: '$9.99',
      tracks: 13,
      genre: 'Country Rock',
      href: '/store/albums/heartfelt-rebellion',
      image: '/Heartfelt Rebellion.png',
    },
  ];

  const featuredSingles = [
    { title: "America's Changed", artist: 'Johnathan Gold', price: '$0.99', href: '/store/singles/americas-changed' },
    { title: 'Chaos Country', artist: 'Johnathan Gold', price: '$0.99', href: '/store/singles/chaos-country' },
    { title: 'World of Gold', artist: 'Mathew Cage', price: '$0.99', href: '/store/singles/world-of-gold' },
    { title: 'Evil Love', artist: 'Kaira Heartfelt', price: '$0.99', href: '/store/singles/evil-love' },
    { title: 'Heartfelt Rebellion', artist: 'Johnathan Gold', price: '$0.99', href: '/store/singles/heartfelt-rebellion' },
    { title: 'Fallen Flag', artist: 'Mathew Cage', price: '$2.00', href: '/store/singles/fallen-flag' },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="text-center max-w-3xl mx-auto px-4">
          <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Own the Music</span>
            <br />
            <span className="text-white">Support the Artists</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8 px-4">
            Every purchase directly supports Reality Radio Network and our mission to elevate real talent. 
            From digital downloads to handmade physical products.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center px-4">
            <Link href="#albums" className="btn-neon-purple">
              Browse Albums
            </Link>
            <Link href="#singles" className="btn-neon">
              Shop Singles
            </Link>
          </div>
        </div>
      </Section>

      {/* Important Notice */}
      <Section background="gradient" className="py-12">
        <div className="max-w-4xl mx-auto bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400/40 transition-colors">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">We're Proudly Indie 💙</h3>
          <div className="space-y-2 text-gray-300 text-sm md:text-base">
            <p>
              <strong>Handmade with care:</strong> Every physical product is created by hand. 
              Please allow up to <span className="text-purple-400">2 weeks</span> for fulfillment.
            </p>
            <p>
              <strong>AI transparency:</strong> Our current roster is AI-generated as a starting point. 
              We're actively seeking real people to adopt these personas and make them their own.
            </p>
            <p>
              <strong>Your support matters:</strong> Every purchase helps us grow, hire real artists, 
              and build the future we envision.
            </p>
          </div>
        </div>
      </Section>

      {/* Albums Section */}
      <Section background="solid" id="albums">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Disc className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Albums</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Full-length releases, complete stories</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4">
          {featuredAlbums.map((album) => (
            <Link
              key={album.title}
              href={album.href}
              className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Album Cover */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <Image
                  src={album.image}
                  alt={`${album.title} album cover`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <Play className="w-12 h-12 text-purple-400" />
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-base md:text-lg font-bold mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all truncate">
                  {album.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 mb-2 truncate">{album.artist}</p>
                <p className="text-xs text-gray-500 mb-2 md:mb-3">{album.genre} • {album.tracks} tracks</p>

                <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
                  <div>
                    <p className="text-xs text-gray-400">Digital</p>
                    <p className="text-purple-400 font-bold">{album.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">CD</p>
                    <p className="text-cyan-400 font-bold">{album.cdPrice}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/store/albums" className="btn-neon-purple">
            View All Albums
          </Link>
        </div>
      </Section>

      {/* Singles Section */}
      <Section background="gradient" id="singles">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Music className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Singles</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Individual tracks, instant impact</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-4">
          {featuredSingles.map((single, index) => (
            <Link
              key={index}
              href={single.href}
              className="group bg-black/40 border border-cyan-500/30 rounded-lg flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-cyan-500/5 hover:border-cyan-400 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all truncate">
                  {single.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">{single.artist}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-cyan-400 font-bold">{single.price}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/store/singles" className="btn-neon">
            View All Singles
          </Link>
        </div>
      </Section>

      {/* Licensing & Partnerships */}
      <Section>
        <div className="max-w-4xl mx-auto text-center px-4">
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Business & Licensing</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-4 md:mb-6">
            Need music for your brand, film, or commercial project? Looking to partner 
            with Reality Radio Network? We offer flexible licensing and collaboration opportunities.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/licensing" className="btn-neon-purple">
              Licensing Info
            </Link>
            <Link href="/contact" className="btn-neon">
              Contact Us
            </Link>
          </div>
        </div>
      </Section>

      {/* Quote */}
      <Section background="solid" className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg italic text-gray-400 mb-4">
            "Sometimes you have to look at a grander picture to see the whole."
          </blockquote>
          <p className="text-purple-400">Alissa M.R. Eldridge, Founder</p>
        </div>
      </Section>
    </main>
  );
}
