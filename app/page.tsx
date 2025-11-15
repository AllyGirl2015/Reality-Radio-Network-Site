import Link from 'next/link';
import Image from 'next/image';
import { Play, ShoppingBag, Users, Zap, Music2, Sparkles, ArrowRight, Calendar, BookOpen, Radio } from 'lucide-react';
import Live365Player from '@/components/Live365Player';
import Section from '@/components/Section';
import { getAllPosts } from '@/lib/blog';

export default function Home() {
  const blogPosts = getAllPosts().slice(0, 3); // Get latest 3 posts
  
  const featuredArtists = [
    {
      name: 'Johnathan Gold & Guilded Hearts',
      genre: 'Modern Country / Americana',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop',
      href: '/artists/johnathan-gold',
    },
    {
      name: 'Kaira Heartfelt',
      genre: 'Country-Pop',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
      href: '/artists/kaira-heartfelt',
    },
    {
      name: 'Mathew Cage',
      genre: 'Alt Rock / Emotional Rock',
      image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=600&fit=crop',
      href: '/artists/mathew-cage',
    },
  ];

  const featuredReleases = [
    {
      title: "America's Changed",
      artist: 'Johnathan Gold',
      type: 'Album',
      image: "/America's Changed.png",
      href: '/store/albums/americas-changed',
    },
    {
      title: 'Shattered Peaces',
      artist: 'Mathew Cage',
      type: 'Album',
      image: '/Shattered Peaces.png',
      href: '/store/albums/shattered-peaces',
    },
    {
      title: 'Barefoot Supernova',
      artist: 'Kaira Heartfelt',
      type: 'Album',
      image: '/Barefoot Supernova.png',
      href: '/store/albums/barefoot-supernova',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center px-4">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">The Future</span>
              <br />
              <span className="text-white">of Music</span>
              <br />
              <span className="text-gray-400">Starts Here</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Original artists with real emotion. Discover authentic sound, unique personas, 
              and the next generation of music at <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">Reality Radio Network</span>.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
              <Link href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="btn-neon flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Listen Live
              </Link>
              <Link href="/store" className="btn-neon-purple flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Shop Music
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-8 md:mt-12 pt-8 md:pt-12 border-t border-purple-500/20">
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">22+</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Artists</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">9</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Radio Stations</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">100%</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Original</div>
              </div>
            </div>
          </div>

          {/* Radio Player */}
          <div id="listen" className="lg:pl-8 px-4 lg:px-0">
            <Live365Player
              stationId="a47993"
              stationName="Reality Central Radio"
              compact={true}
            />
            <div className="mt-6 p-4 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-lg">
              <p className="text-sm text-gray-400">
                🎧 <span className="text-[#00f3ff] font-semibold">Now Streaming:</span> Mixed genres from punk rock to country, 
                featuring our exclusive artists.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* What is RRN */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">What is RRN?</span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto">
              Powered by RBEW — Built from Passion, Driven by Purpose
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 md:p-8 hover:border-purple-400 transition-all">
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-3 md:mb-4">
                The Reality Radio Network is <strong className="text-purple-400">more than a group of radio stations</strong> — 
                it's a <strong className="text-cyan-400">movement</strong>. A heartbeat. A voice for the real.
              </p>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                Whether it's country, rock, rap, pop, or something wildly experimental… 
                RRN gives sound to the stories that need to be heard. 
                From heartfelt anthems to rebellious truths — <strong className="text-purple-400">we curate what matters</strong>.
              </p>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 sm:p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <Radio className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  <h3 className="text-lg md:text-xl font-bold text-cyan-400">201.5 – Reality Central Radio</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2 italic">"The Realest Mix Around."</p>
                <p className="text-gray-300 mb-3">
                  All-genre rotation. All truth. All heart. Featuring original artists like Johnathan Gold, Mathew Cage, and Kaira Heartfelt.
                </p>
                <p className="text-sm text-purple-400 font-semibold">
                  Now Broadcasting — Curated by DJ Ally One herself
                </p>
              </div>

              <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-400">Coming Soon</h3>
                </div>
                <p className="text-gray-300 mb-3">
                  We're working hard behind the scenes to build more stations as we grow. One step at a time.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    <strong>33.9 – Real Country</strong> | "Everything country, from the golden days to now."
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    <strong>207.1 – Real Talk</strong> | "Talk the talk… but be sure to walk the walk."
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Why RRN?
              </h3>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-4 md:mb-6">
                Because mainstream doesn't speak for all of us. RRN exists to give <strong className="text-purple-400">real creators</strong>, 
                <strong className="text-cyan-400"> real voices</strong>, and <strong className="text-purple-400">real communities</strong> a 
                place to be heard — raw and unfiltered.
              </p>
              <p className="text-xl font-semibold text-purple-400">
                You deserve a network that gets it. Welcome to the Reality Radio Network. 🎧
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Artists */}
      <Section background="solid">
        <div className="text-center mb-8 md:mb-12 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Meet Our <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Artists</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Each persona crafted with unique sound, story, and soul
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
          {featuredArtists.map((artist) => (
            <Link
              key={artist.name}
              href={artist.href}
              className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="aspect-square mb-4 rounded-lg overflow-hidden relative">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                {artist.name}
              </h3>
              <p className="text-gray-400 text-sm">{artist.genre}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/artists" className="btn-neon-purple inline-flex items-center gap-2">
            View All 22 Artists
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Section>

      {/* Featured Releases */}
      <Section background="gradient">
        <div className="text-center mb-8 md:mb-12 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Latest</span> Releases
          </h2>
          <p className="text-lg md:text-xl text-gray-400">Stream now, own forever</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12 px-4">
          {featuredReleases.map((release) => (
            <Link
              key={release.title}
              href={release.href}
              className="group bg-black/40 border border-cyan-500/30 rounded-lg overflow-hidden p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="aspect-square mb-4 rounded-lg overflow-hidden relative">
                <Image
                  src={release.image}
                  alt={release.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors flex items-center justify-center">
                  <Play className="w-16 h-16 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all">
                  {release.title}
                </h3>
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/30">
                  {release.type}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{release.artist}</p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/store" className="btn-neon inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Explore Full Store
          </Link>
        </div>
      </Section>

      {/* Persona Adoption CTA */}
      <Section>
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-6 md:mb-8">
            <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-3 md:mb-4" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Become an <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Artist</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
            Our Persona Adoption Program lets you step into a fully-crafted artist identity with professional support. 
            Audition, perform, create—and eventually own the persona completely.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/personas" className="btn-neon-purple flex items-center gap-2">
              <Users className="w-5 h-5" />
              Learn More
            </Link>
            <Link href="/personas#audition" className="btn-neon flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Audition
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg hover:border-purple-400/40 transition-colors">
              <h3 className="font-bold mb-2 text-purple-400">Equal Partnership</h3>
              <p className="text-sm text-gray-400">
                50/50 revenue split with growing ownership over time
              </p>
            </div>
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg hover:border-purple-400/40 transition-colors">
              <h3 className="font-bold mb-2 text-purple-400">Creative Freedom</h3>
              <p className="text-sm text-gray-400">
                Equal input in music, branding, and artistic direction
              </p>
            </div>
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg hover:border-purple-400/40 transition-colors">
              <h3 className="font-bold mb-2 text-purple-400">Full Ownership</h3>
              <p className="text-sm text-gray-400">
                Complete persona rights transfer upon contract completion
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Vision */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Vision</span>
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            We're building a platform that elevates real talent. Our goal is to discover and develop 
            artists from the ground up, providing them with the tools, support, and opportunities to 
            reach their full potential and achieve success.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            Music is just the beginning. From albums and live performances to book publishing, film, animation, 
            video games, and technology—we're building an ecosystem that raises everyone up.
          </p>
          <Link href="/story" className="btn-neon inline-flex items-center gap-2">
            Read Our Full Story
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Section>

      {/* Blog Posts */}
      {blogPosts.length > 0 && (
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Latest from <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Our Blog</span>
            </h2>
            <p className="text-xl text-gray-400">News, updates, and insights</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-purple-400 font-semibold text-sm">
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="btn-neon-purple inline-flex items-center gap-2">
              View All Posts
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Section>
      )}
    </main>
  );
}
