import { Metadata } from 'next';
import Link from 'next/link';
import { Music, Users, Sparkles } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Artists | 22 Unique AI-Powered Personas',
  description: 'Discover 22 unique AI-powered artists at Reality Radio Network. From country to rock, pop to experimental—each with their own sound, story, and style.',
  openGraph: {
    title: 'Artists | Reality Radio Network',
    description: 'Meet 22 unique AI-powered personas, each with distinct sound and story.',
  },
};

const artists = [
  {
    id: 'johnathan-gold',
    name: 'Johnathan Gold & Guilded Hearts',
    pronunciation: 'JON-uh-thin Gold',
    genre: '90s & Modern Country / Americana',
    description: 'Heartfelt, patriotic, and deeply observant. Voice of the everyday American, telling stories of unity, loss, and resilience.',
    albums: 2,
    singles: 4,
    category: 'original',
  },
  {
    id: 'kaira-heartfelt',
    name: 'Kaira Heartfelt',
    pronunciation: 'KAI-rah Heart-felt',
    genre: '2000s Country-Pop',
    description: 'Romantic fire with strength, blending emotional vulnerability with empowering country anthems.',
    albums: 1,
    singles: 2,
    category: 'original',
  },
  {
    id: 'mathew-cage',
    name: 'Mathew Cage',
    pronunciation: 'MATH-yoo Cage',
    genre: 'Alt Rock / Emotional Rock',
    description: 'Gritty and raw, tackling mental health struggles, survival, and personal redemption.',
    albums: 1,
    singles: 3,
    category: 'original',
  },
  {
    id: 'eryk-saint',
    name: 'Eryk Saint',
    pronunciation: 'AIR-ick Saint',
    genre: 'Screamo-Dark Pop / Rap Rock Fusion',
    description: 'Emotional chaos and rebellion, mixing sharp lyrics with heavy, cathartic energy.',
    albums: 0,
    singles: 0,
    category: 'original',
  },
  {
    id: 'daina-vein',
    name: 'Daina Vein',
    pronunciation: 'DAY-nuh Vayn',
    genre: 'Pop Rock / Girl Rock',
    description: 'Angsty breakup anthems and aggressive romance tracks with a glam edge.',
    albums: 0,
    singles: 0,
    category: 'original',
  },
  {
    id: 'lance-eldon',
    name: 'Lance Eldon',
    pronunciation: 'Lance EL-dun',
    genre: '90s–2000s Country / Coastal Americana',
    description: 'Warm, seasoned, and fun-loving. Balances beachside ease with honky-tonk grit.',
    albums: 0,
    singles: 0,
    category: 'family',
  },
  {
    id: 'heather-brown',
    name: 'Heather Brown',
    pronunciation: 'Heather Brown',
    genre: 'Contemporary Female Country-Pop',
    description: 'A "country Katy Perry" with Carrie, Taylor, and Reba\'s depth. Fierce, nurturing, faith-filled, and passionate.',
    albums: 0,
    singles: 0,
    category: 'family',
  },
  {
    id: 'bryan-tannon',
    name: 'Bryan Tannon',
    pronunciation: 'BRY-en TAN-nun',
    genre: 'Punk Rock / Alt Rock / Cinematic Rock',
    description: 'Starset-meets-Skillet energy—rebellious, high-energy, and intense.',
    albums: 0,
    singles: 0,
    category: 'family',
  },
  {
    id: 'tellerman',
    name: 'Tellerman',
    pronunciation: 'TELL-er-man',
    genre: 'Hard Rock / Action Rock',
    description: 'Top Gun-inspired adrenaline and patriotism. Guitars like jet engines, lyrics about freedom and danger.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'vinny-tame',
    name: 'Vinny Tame',
    pronunciation: 'VIN-ee Taym',
    genre: 'Country-Pop / Summer Country',
    description: 'Laid-back charm, warm "windows-down" anthems with heart.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'xenia-hex',
    name: 'Xenia Hex',
    pronunciation: 'ZEE-nee-uh Hex',
    genre: 'Dark Electro-Pop / Alt-Pop',
    description: 'Neon heartbreak, emotional power, and mysterious allure.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'jonny-faint',
    name: 'Jonny Faint',
    pronunciation: 'JAH-nee Faynt',
    genre: 'Classic Rock / Punk Rock / Dark Pop',
    description: 'Rebellious yet clever, high-energy with deep emotional undertones.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'sangie-main',
    name: 'Sangie Main',
    pronunciation: 'SAN-gee Main',
    genre: 'Rock-Pop Hybrid',
    description: 'Soulful, bold, and dynamic with both tender and explosive moments.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'mitch-stang',
    name: 'Mitch Stang',
    pronunciation: 'Mitch Stang',
    genre: 'Southern Rock / Barroom Country',
    description: 'Whiskey-soaked grit and storytelling, rowdy but grounded.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'fitch-onaman',
    name: 'Fitch Onaman',
    pronunciation: 'Fitch ON-uh-man',
    genre: 'Stadium Rock / Anthemic Power',
    description: 'Big, cinematic choruses built to fill arenas.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'luke-todder',
    name: 'Luke Todder',
    pronunciation: 'Luke TOD-er',
    genre: 'Modern Country / Radio-Tailgate Country',
    description: 'High-energy party country with a touch of sentimentality.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'braina-taylor',
    name: 'Braiña Taylor',
    pronunciation: 'BRAYN-yah Taylor',
    genre: 'Indie Pop-Country Fusion',
    description: 'Quirky, catchy, and clever—heartfelt songs with a playful twist.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'taylor-hellen',
    name: 'Taylor Hellen',
    pronunciation: 'Taylor HEL-en',
    genre: 'Alt Pop / Heartland Rock',
    description: 'Emotional, "cry in the car" ballads with a powerful undercurrent.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'chat-figner',
    name: 'Chat Figner',
    pronunciation: 'Chat FIG-ner',
    genre: 'Satirical Rap-Pop / Meme-Core',
    description: 'Humor, irony, and catchy hooks—viral fun with just enough bite.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'jethro-gaurd',
    name: 'Jethro Gaurd',
    pronunciation: 'JETH-roh Gard',
    genre: 'Gothic Country / Outlaw Americana',
    description: 'Dark, haunting, and mysterious—ballads about life, death, and the spaces in between.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'chronix',
    name: 'Chronix',
    pronunciation: 'KRON-ix',
    genre: 'K-Pop / K-Rock Girl Band',
    description: 'Edgy synergy with heavy Huntrix inspiration. Features Tonia Sonic, Sonia Maine, and Hannah Shawns.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
  {
    id: 'max-reaper',
    name: 'Max Reaper',
    pronunciation: 'Max REE-per',
    genre: 'Electro-Pop / Dark Pop',
    description: 'Heavy instrumentals with Daft Punk inspiration and dark electronic vibes.',
    albums: 0,
    singles: 0,
    category: 'new',
  },
];

export default function ArtistsPage() {
  const original5 = artists.filter(a => a.category === 'original');
  const familyInspired = artists.filter(a => a.category === 'family');
  const newRoster = artists.filter(a => a.category === 'new');

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Users className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">22 Artists</span>
            <br />
            <span className="text-white">22 Unique Stories</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
            Each persona crafted with unique sound, style, and soul. From country roots to punk rebellion, 
            dark pop to stadium rock the Reality Radio Network roster covers it all.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/personas" className="btn-neon-purple">
              Join as an Artist
            </Link>
            <Link href="/store" className="btn-neon">
              Shop Music
            </Link>
          </div>
        </div>
      </Section>

      {/* Original 5 */}
      <Section background="gradient">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Original 5</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">The founding personas of Reality Radio Network</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
          {original5.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 mb-3 md:mb-4 rounded-lg flex items-center justify-center">
                <Music className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all break-words">
                {artist.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{artist.pronunciation}</p>
              <p className="text-sm text-cyan-400 mb-2">{artist.genre}</p>
              <p className="text-sm text-gray-400 line-clamp-2">{artist.description}</p>
              {(artist.albums > 0 || artist.singles > 0) && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-purple-500/20 text-xs text-gray-500">
                  {artist.albums > 0 && <span>{artist.albums} Album{artist.albums > 1 ? 's' : ''}</span>}
                  {artist.singles > 0 && <span>{artist.singles} Single{artist.singles > 1 ? 's' : ''}</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </Section>

      {/* Family-Inspired */}
      <Section background="solid">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Family-Inspired Artists</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Personas inspired by personal connections and stories</p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
          {familyInspired.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-black/40 border border-cyan-500/30 rounded-lg overflow-hidden p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 mb-4 rounded-lg flex items-center justify-center">
                <Music className="w-24 h-24 text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all">
                {artist.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{artist.pronunciation}</p>
              <p className="text-sm text-purple-400 mb-2">{artist.genre}</p>
              <p className="text-sm text-gray-400 line-clamp-2">{artist.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* New Roster */}
      <Section background="gradient">
        <div className="mb-8 md:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">New Artist Roster</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">Expanding the sound, pushing the boundaries</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4">
          {newRoster.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 mb-2 md:mb-3 rounded-lg flex items-center justify-center">
                <Music className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all line-clamp-1">
                {artist.name}
              </h3>
              <p className="text-xs text-cyan-400 mb-2">{artist.genre}</p>
              <p className="text-xs text-gray-400 line-clamp-2">{artist.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Want to Be One of Them?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 md:mb-8">
            Our Persona Adoption Program lets you step into a fully-crafted artist identity. 
            Audition, perform, create, and eventually own the persona completely.
          </p>
          <Link href="/personas" className="btn-neon-purple inline-flex items-center gap-2">
            <Users className="w-5 h-5" />
            Learn About Persona Adoption
          </Link>
        </div>
      </Section>
    </main>
  );
}
