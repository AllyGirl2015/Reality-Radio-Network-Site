import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Music, Radio, Users, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Donate | Reality Radio Network',
  description: 'Support the Reality Radio Network and help us continue bringing original music, authentic artists, and real stories to the world. Every donation makes a difference.',
};

export default function DonatePage() {
  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-0">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>
      </Section>

      {/* Hero Section */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-pink-400/30 mb-6">
              <Heart className="w-10 h-10 text-pink-400" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Support RRN
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Help us continue bringing original music, authentic artists, and real stories to the world.
            </p>
          </div>

          {/* Donation CTA */}
          <div className="bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-cyan-600/20 border border-pink-400/30 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Every Donation Makes a Difference
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Your generous support helps us create more music, support our artists, and keep the Reality Radio Network running strong.
            </p>
            <a 
              href="https://square.link/u/cwC2oQTV"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-lg rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Heart className="w-6 h-6" aria-hidden="true" />
              Donate Now
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Secure payment powered by Square
            </p>
          </div>
        </div>
      </Section>

      {/* What Your Donation Supports */}
      <Section background="solid">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              What Your Donation Supports
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-400/30 mb-4">
                <Music className="w-7 h-7 text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Music Production</h3>
              <p className="text-gray-400 text-sm">
                Fund the creation of new albums, singles, and original compositions.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-400/30 mb-4">
                <Radio className="w-7 h-7 text-cyan-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Radio Operations</h3>
              <p className="text-gray-400 text-sm">
                Keep our radio stations broadcasting 24/7 with quality programming.
              </p>
            </div>

            <div className="bg-black/40 border border-pink-500/30 rounded-lg p-6 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-pink-400/30 mb-4">
                <Users className="w-7 h-7 text-pink-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Artist Development</h3>
              <p className="text-gray-400 text-sm">
                Support our Persona Adoption Program and emerging talent.
              </p>
            </div>

            <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-yellow-400/30 mb-4">
                <Sparkles className="w-7 h-7 text-yellow-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Platform Growth</h3>
              <p className="text-gray-400 text-sm">
                Expand our reach and bring RRN to more listeners worldwide.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Why Donate */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Why Support RRN?
              </span>
            </h2>
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-8">
            <div className="space-y-6 text-gray-300">
              <p className="text-lg leading-relaxed">
                The Reality Radio Network isn't just another music platform—we're a <strong className="text-purple-400">movement</strong>. 
                We believe in authentic storytelling, real emotions, and giving a voice to artists who deserve to be heard.
              </p>
              <p className="text-lg leading-relaxed">
                Unlike major labels, we operate independently. Your donations directly fund our operations, 
                allowing us to continue creating <strong className="text-cyan-400">original music</strong> and 
                supporting <strong className="text-pink-400">emerging artists</strong> through our unique programs.
              </p>
              <p className="text-lg leading-relaxed">
                Every contribution, no matter the size, helps us stay true to our mission: 
                <em className="text-purple-400"> "Where Reality Meets Music."</em>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <blockquote className="text-gray-400 italic text-lg max-w-2xl mx-auto">
              "If nothing is ever said, nothing will ever be done, and if nothing is ever done, nothing will ever change... 
              Be it for better, or for worse."
              <cite className="block mt-2 text-purple-400 not-italic">— Alissa M.R. Eldridge, Founder</cite>
            </blockquote>
          </div>
        </div>
      </Section>

      {/* Other Ways to Support */}
      <Section>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Other Ways to Support
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              href="/store"
              className="group bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Shop Our Store
              </h3>
              <p className="text-gray-400 text-sm">
                Purchase albums, singles, and merchandise from our artists.
              </p>
            </Link>

            <Link 
              href="/radio"
              className="group bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Listen to Our Radio
              </h3>
              <p className="text-gray-400 text-sm">
                Tune in and help us grow our listener base.
              </p>
            </Link>

            <Link 
              href="/personas"
              className="group bg-black/40 border border-pink-500/30 rounded-lg p-6 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                Join as an Artist
              </h3>
              <p className="text-gray-400 text-sm">
                Apply for our Persona Adoption Program.
              </p>
            </Link>
          </div>

          <div className="mt-12">
            <a 
              href="https://square.link/u/cwC2oQTV"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-purple inline-flex items-center gap-2 text-lg"
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              Make a Donation
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
