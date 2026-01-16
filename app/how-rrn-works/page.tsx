import Link from 'next/link';
import { ArrowLeft, Radio, Users, Clock, DollarSign, Globe, Heart } from 'lucide-react';
import Section from '@/components/Section';

export default function HowRRNWorks() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Section className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              How <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">RRN Works</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Behind the scenes of Reality Radio Network - our philosophy, operations, and commitment to authentic broadcasting.
            </p>
          </div>
        </div>
      </Section>

      {/* Main Content */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 md:p-8 mb-8">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6">
              Reality Radio Network operates as a live and scheduled broadcast system combining automated programming with hosted shows and special events.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6">
              Content is curated and managed internally to ensure consistency, quality, and respect for listeners. Advertising and sponsorships are kept transparent and affordable, with no long-term contracts or hidden fees.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              RRN supports both local and international listeners while remaining rooted in its independent, creator-first philosophy.
            </p>
          </div>

          {/* Key Principles */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-8 h-8 text-cyan-400" />
                <h3 className="text-xl font-bold text-cyan-400">Live & Scheduled Broadcasting</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                We combine automated programming with live-hosted shows and special events to create an engaging, dynamic listening experience that feels authentic and alive.
              </p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-bold text-purple-400">Internal Curation</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                All content is carefully curated and managed by our team to maintain consistency, quality, and respect for our listeners' experience.
              </p>
            </div>

            <div className="bg-black/40 border border-pink-500/30 rounded-lg p-6 hover:border-pink-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-pink-400" />
                <h3 className="text-xl font-bold text-pink-400">Transparent Advertising</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Advertising and sponsorships are handled with complete transparency. No long-term contracts, no hidden fees - just affordable, honest partnerships.
              </p>
            </div>

            <div className="bg-black/40 border border-green-500/30 rounded-lg p-6 hover:border-green-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">Global Reach, Local Roots</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                We serve listeners worldwide while staying true to our independent, creator-first philosophy and San Antonio roots.
              </p>
            </div>
          </div>

          {/* Programming Philosophy */}
          <div className="bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 border border-purple-400/30 rounded-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Our Programming Philosophy</h3>
              <p className="text-gray-300">What sets RRN apart from algorithm-driven platforms</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-cyan-400">Intentional Programming:</strong> Every song, every segment is chosen with purpose, creating meaningful listening experiences rather than endless algorithmic suggestions.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-purple-400">Real Hosts:</strong> Live personalities bring energy and authenticity to our broadcasts, making RRN feel like a community rather than a sterile streaming service.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-pink-400">Structured Broadcasts:</strong> Our programming follows intentional schedules and themes, creating anticipation and discovery for our listeners.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-green-400">Creator-First Approach:</strong> We prioritize the artists and creators who make our network special, ensuring they receive fair compensation and recognition.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 md:p-8">
              <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold mb-4">Join the RRN Community</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Experience the difference that intentional, human-curated broadcasting makes. Listen live, discover new artists, and be part of something real.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" target="_blank" rel="noopener noreferrer" className="btn-neon">
                  Listen Live
                </Link>
                <Link href="/story" className="btn-neon-purple">
                  Learn Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}