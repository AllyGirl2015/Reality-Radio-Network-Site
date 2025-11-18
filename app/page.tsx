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
      href: '/talent/johnathan-gold',
    },
    {
      name: 'Kaira Heartfelt',
      genre: 'Country-Pop',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
      href: '/talent/kaira-heartfelt',
    },
    {
      name: 'Mathew Cage',
      genre: 'Alt Rock / Emotional Rock',
      image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=600&fit=crop',
      href: '/talent/mathew-cage',
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
      <Section className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 sm:pb-12 md:pb-16 lg:pb-20 relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start px-4">
          <div className="text-center lg:text-left lg:pt-0">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-5 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">The Future</span>
              <br />
              <span className="text-white">of Music</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-pulse">Starts Here</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-5 md:mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Original artists with real emotion. Discover authentic sound, unique personas, 
              and the next generation of music at <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">Reality Radio Network</span>.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 justify-center lg:justify-start">
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
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-purple-500/20">
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">22+</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Artists</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">9</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Radio Stations</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">100%</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Original</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-purple-500/20">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 text-center lg:text-left">Join Our Community</h3>
              
              {/* Discord CTA - Destaque */}
              <a 
                href="https://discord.realityradionetwork.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Join Discord Server</span>
              </a>

              {/* Other Social Links */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <a 
                  href="https://www.instagram.com/rbentertainmemtworks?igsh=a3VvbGFqNmxzMWRx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/10 text-pink-400 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                  </svg>
                </a>

                <a 
                  href="https://www.tiktok.com/@rbentertainmentworks?_r=1&_t=ZT-91KyKneaFRn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 border border-gray-500/30 hover:border-gray-400 hover:bg-gray-500/10 text-gray-400 transition-all duration-300"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

                <a 
                  href="https://youtube.com/@r.b.e.w.?si=xq82NUDk5HaDz755" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 text-red-400 transition-all duration-300"
                  aria-label="YouTube RBEW"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a 
                  href="https://youtube.com/@rbewrrn?si=4P81JDgKlYuaZAR-" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 text-red-400 transition-all duration-300"
                  aria-label="YouTube RRN"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Radio Player */}
          <div id="listen" className="lg:pl-8 px-4 lg:px-0 lg:sticky lg:top-24 self-start">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              {/* Header com imagem e info */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 border-b border-purple-500/20">
                <div className="relative w-full sm:w-32 aspect-square rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/201dot5RealityCentralRadio.png"
                    alt="Reality Central Radio"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs md:text-sm text-purple-400 font-mono mb-1">201.5 FM</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">Reality Central Radio</h3>
                      <p className="text-xs md:text-sm text-gray-400 italic">The Realest Mix Around</p>
                    </div>
                    <span className="px-2 sm:px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 animate-pulse">
                      LIVE
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">Mixed genres from punk rock to country, featuring our exclusive original artists.</p>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>DJ: DJ Ally One</span>
                  </div>
                </div>
              </div>

              {/* Player */}
              <div className="p-4 sm:p-6">
                <Live365Player
                  stationId="a47993"
                  stationName="Reality Central Radio"
                  compact={false}
                />
              </div>
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
              Powered by RBEW. Built from Passion, Driven by Purpose
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 md:p-8 hover:border-purple-400 transition-all">
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-3 md:mb-4">
                The Reality Radio Network is <strong className="text-purple-400">more than a group of radio stations</strong>.
                it's a <strong className="text-cyan-400">movement</strong>. A heartbeat. A voice for the real.
              </p>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                Whether it's country, rock, rap, pop, or something wildly experimental… 
                RRN gives sound to the stories that need to be heard. 
                From heartfelt anthems to rebellious truths. <strong className="text-purple-400">we curate what matters</strong>.
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
                  Now Broadcasting. Curated by DJ Ally One herself
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
                place to be heard. raw and unfiltered.
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
          <Link href="/talent" className="btn-neon-purple inline-flex items-center gap-2">
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

      {/* Store Highlight */}
      <Section background="solid">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Own</span> the Music
              </h2>
              <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                Support independent artists and own their music forever. Download high-quality albums and singles, 
                or explore physical merchandise to show your support for the Reality Radio Network community.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Music2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Digital Downloads</h3>
                    <p className="text-sm text-gray-400">High-quality MP3s and FLACs from all our artists</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <ShoppingBag className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Physical Products</h3>
                    <p className="text-sm text-gray-400">CDs and exclusive merchandise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Direct Artist Support</h3>
                    <p className="text-sm text-gray-400">100% of proceeds go directly to our artists</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/store" className="btn-neon-yellow flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Shop All
                </Link>
                <Link href="/store/albums" className="btn-neon-purple flex items-center gap-2">
                  Browse Albums
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/store/singles" className="btn-neon flex items-center gap-2">
                  Browse Singles
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden relative border-2 border-purple-500/30 hover:border-purple-400 transition-all">
                    <Image
                      src="/America's Changed.png"
                      alt="America's Changed Album"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative border-2 border-cyan-500/30 hover:border-cyan-400 transition-all">
                    <Image
                      src="/Barefoot Supernova.png"
                      alt="Barefoot Supernova Album"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-lg overflow-hidden relative border-2 border-pink-500/30 hover:border-pink-400 transition-all">
                    <Image
                      src="/Shattered Peaces.png"
                      alt="Shattered Peaces Album"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative border-2 border-purple-500/30 hover:border-purple-400 transition-all">
                    <Image
                      src="/Golden Heartbreak.svg"
                      alt="Golden Heartbreak Album"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
