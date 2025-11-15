import { Metadata } from 'next';
import Image from 'next/image';
import { Radio, Clock, Users } from 'lucide-react';
import Section from '@/components/Section';
import Live365Player from '@/components/Live365Player';

export const metadata: Metadata = {
  title: 'Radio Stations | 9 Channels of Pure Sound',
  description: 'Stream 9 unique radio stations from Reality Radio Network. From country to rock, rap to experimental—all genres, all AI-powered, all live.',
  openGraph: {
    title: 'Radio Stations | Reality Radio Network',
    description: 'Stream 9 unique radio stations. From country to rock, rap to experimental.',
  },
};

const stations = [
  {
    id: 'reality-central',
    number: '201.5',
    name: 'Reality Central Radio',
    tagline: 'The Realest Mix Around',
    theme: 'Mixed music from every genre',
    genres: ['Punk rock', 'rap', 'dark pop', 'rock', 'country', 'experimental', 'indie'],
    dj: 'DJ Ally One',
    status: 'live',
    description: 'Flagship station of the RBEW network. Diverse, unfiltered, raw, and powerful. Think of it as the soul of the movement.',
    streamUrl: 'https://live365.com/station/Reality-Central-Radio-a57374',
  },
  {
    id: 'real-talk',
    number: '207.1',
    name: 'Real Talk',
    tagline: 'Talk the talk... but be sure to walk the walk',
    theme: 'Talk radio and commentary',
    genres: ['Community spotlights', 'DJ rants', 'philosophical musings', 'political discussions', 'live interviews'],
    dj: 'Various',
    status: 'planned',
    description: 'A platform for expression, connection, and authenticity. The voice of RBEW.',
    streamUrl: '',
  },
  {
    id: 'real-country',
    number: '33.9',
    name: 'Real Country',
    tagline: 'Everything country, from the golden days to now',
    theme: 'Full-time country music',
    genres: ['90s country', 'modern country', 'outlaw', 'ballads', 'acoustic'],
    dj: 'TBA',
    status: 'curating',
    description: 'Honor the roots, speak to the heartland, and reflect changing values.',
    streamUrl: '',
  },
  {
    id: 'smash-radio',
    number: '81.7',
    name: 'Smash Radio',
    tagline: 'Old and new, loud and true',
    theme: 'Rock & Roll, both classic and current',
    genres: ['Classic rock', 'hard rock', 'soft rock', 'grunge', 'alt-rock', 'girl rock'],
    dj: 'TBA',
    status: 'curating',
    description: 'Energy. Vibe. Passion. Raw musical legacy meets modern roar.',
    streamUrl: '',
  },
  {
    id: 'rap-track',
    number: '44.3',
    name: 'Rap Track',
    tagline: 'Rap Central',
    theme: 'All-rap station',
    genres: ['Classic rap', 'modern rap', 'conscious rap', 'underground', 'experimental hip-hop'],
    dj: 'TBA',
    status: 'curating',
    description: 'Showcase the full spectrum of rap—storytelling, fire beats, and lyrical depth.',
    streamUrl: '',
  },
  {
    id: 'game-central',
    number: '96.1',
    name: 'Game Central',
    tagline: 'Play the hits—literally',
    theme: 'Video game music & vibes',
    genres: ['Game OSTs', 'remixes', '8-bit', 'synth', 'lo-fi', 'nerdcore'],
    dj: 'TBA',
    status: 'curating',
    description: 'A haven for gamers, streamers, devs, and RP radio mods.',
    streamUrl: '',
  },
  {
    id: 'animanial-radial',
    number: '195.2',
    name: 'Animanial Radial',
    tagline: 'From screen to sound—film, animation, and beyond',
    theme: 'Themed music from pop culture',
    genres: ['Anime openings/endings', 'cartoon themes', 'film soundtracks', 'musical theatre'],
    dj: 'TBA',
    status: 'curating',
    description: 'Emotional, cinematic, nostalgic. Perfect for late-night listening or story-driven broadcasts.',
    streamUrl: '',
  },
  {
    id: 'chaos-stop',
    number: '202.5',
    name: 'Chaos Stop',
    tagline: 'The station for everything outside the norm',
    theme: 'Experimental & disruptive audio',
    genres: ['Satirical music', 'political parodies', 'protest songs', 'meme bangers', 'genre-fusions'],
    dj: 'TBA',
    status: 'curating',
    description: 'Challenge the system, mock the absurd, create musical anarchy.',
    streamUrl: '',
  },
  {
    id: 'pop-shop',
    number: '134.2',
    name: 'The Pop Shop',
    tagline: 'Pop and shop—the best spot for Pop',
    theme: 'Pure, high-energy pop',
    genres: ['Pop', 'dark pop', 'bubblegum', 'alt-pop', 'hyperpop'],
    dj: 'TBA',
    status: 'curating',
    description: 'Keep it catchy, polished, and powerful—RBEW\'s mainstream edge.',
    streamUrl: '',
  },
];

export default function RadioPage() {
  const liveStations = stations.filter(s => s.status === 'live');
  const upcomingStations = stations.filter(s => s.status !== 'live');

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="text-center max-w-3xl mx-auto px-4">
          <Radio className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">9 Stations</span>
            <br />
            <span className="text-white">Infinite Vibes</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
            From country roads to punk rebellion, game soundtracks to talk radio—
            Reality Radio Network covers every corner of sound.
          </p>
        </div>
      </Section>

      {/* Live Stations */}
      <Section background="gradient">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full animate-pulse" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Live Now</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Streaming 24/7</p>
        </div>

        <div className="grid sm:grid-cols-1 gap-6 md:gap-8 px-4 max-w-5xl mx-auto">
          {liveStations.map((station) => (
            <div key={station.id} className="bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              {/* Header com imagem e info */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 p-4 sm:p-6 border-b border-purple-500/20">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/201dot5RealityCentralRadio.png"
                    alt={station.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs md:text-sm text-purple-400 font-mono mb-1">{station.number} FM</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1 break-words">{station.name}</h3>
                      <p className="text-xs md:text-sm text-gray-400 italic">{station.tagline}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 animate-pulse">
                      LIVE
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4">{station.description}</p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {station.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-black/50 border border-purple-500/30 rounded text-xs text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>DJ: {station.dj}</span>
                  </div>
                </div>
              </div>

              {/* Player */}
              <div className="p-4 sm:p-6">
                <Live365Player
                  stationId="a47993"
                  stationName={station.name}
                  compact={false}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Upcoming Stations */}
      <Section background="solid">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Coming Soon</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Currently curating content and preparing launch</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
          {upcomingStations.map((station) => (
            <div key={station.id} className="bg-black/40 border border-cyan-500/30 rounded-lg overflow-hidden p-4 sm:p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="text-xs md:text-sm text-cyan-400 font-mono">{station.number} FM</div>
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                  {station.status === 'planned' ? 'PLANNED' : 'CURATING'}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1 text-cyan-400">{station.name}</h3>
              <p className="text-sm text-gray-400 italic mb-3">{station.tagline}</p>

              <p className="text-sm text-gray-300 mb-3">{station.description}</p>

              <div className="flex flex-wrap gap-1">
                {station.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-black/50 border border-cyan-500/20 rounded text-xs text-gray-400"
                  >
                    {genre}
                  </span>
                ))}
                {station.genres.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{station.genres.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
