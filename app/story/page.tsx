import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Target, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Our Story | The Vision Behind Reality Radio Network',
  description: 'Learn about Reality Radio Network\'s mission to use AI as a foundation for elevating real talent. From music to film, gaming to publishing—we\'re building an ecosystem that raises everyone up.',
  openGraph: {
    title: 'Our Story | Reality Radio Network',
    description: 'Using AI as a foundation to elevate real talent and build the future of entertainment.',
  },
};

export default function StoryPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Our Story</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
            A humble beginning with an extraordinary vision
          </p>
        </div>
      </Section>

      {/* Main Story */}
      <Section background="solid">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">We're Different by Design</h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-3 md:mb-4">
              For starters, we aren't like everyone else. While many are transitioning <strong>towards</strong> AI 
              replacing people, our model is the <strong>inverse</strong> of that.
            </p>
            <p className="text-gray-300 leading-relaxed">
              We want to use AI as our <strong className="text-purple-400">foundation</strong>, and later grow beyond its depths. 
              Our goal? Hire real people and make real music. AI is the starting point—not the destination.
            </p>
          </div>

          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 mb-12">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">The Founder's Vision</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our founder, <strong className="text-purple-400">Alissa M.R. Eldridge</strong>, wants nothing more than to remove AI 
              from the immediate production line and bring talented people from the bottom of the unknown to the 
              highest parts of fame.
            </p>
            <p className="text-gray-300 leading-relaxed">
              But the journey doesn't stop at music.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-8 md:my-12">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-bold mb-2 text-purple-400">Our Mission</h3>
              <p className="text-xs sm:text-sm text-gray-300">
                Use AI as a stepping stone to discover, elevate, and empower real human talent across 
                music, film, publishing, gaming, and beyond.
              </p>
            </div>
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold mb-2 text-cyan-400">Our Growth</h3>
              <p className="text-sm text-gray-300">
                Every penny that can be will be invested back into the business and infrastructure 
                to grow it even further.
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 mb-12">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Beyond Music</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Music is only the start. From music and CDs to our <strong>Persona Adoption Program</strong>. 
              From there to book publishing, philosophy, and theoretical frameworks. Then to film and animation, 
              video games, and cutting-edge technologies.
            </p>
            <p className="text-gray-300 leading-relaxed font-semibold text-purple-400">
              We seek to do it all for the sake of raising everyone up.
            </p>
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 mb-12">
            <Sparkles className="w-10 h-10 text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">RRN is Only the Start</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Reality Radio Network was never meant to be the end goal. It's a <strong>doorway</strong> into 
              a vast array of positive change and growth.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              A foundation for an entertainment ecosystem that values <strong>people</strong>, rewards 
              <strong> creativity</strong>, and builds <strong>community</strong>.
            </p>
            <div className="text-center py-6">
              <p className="text-2xl font-bold text-white mb-2">The Question Is:</p>
              <p className="text-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
                Are you going to be a pillar for its growth, or a phantom passing through?
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section background="gradient">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Our Values</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-purple-400">People First</h3>
              <p className="text-gray-300 text-sm">
                AI is a tool, not a replacement. We're committed to elevating human creators and giving 
                them the platform they deserve.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 text-center hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <Heart className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-cyan-400">Transparency</h3>
              <p className="text-gray-300 text-sm">
                We're open about our use of AI, our processes, and our goals. No hidden agendas, 
                just honest growth.
              </p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-purple-400">Innovation</h3>
              <p className="text-gray-300 text-sm">
                We're pioneering a new model for entertainment—one that combines cutting-edge 
                technology with timeless human creativity.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Join the Movement</span>
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Whether you're an artist, a fan, or a partner—there's a place for you in our story.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/personas" className="btn-neon-purple">
              Become an Artist
            </Link>
            <Link href="/store" className="btn-neon">
              Support Our Work
            </Link>
            <Link href="/contact" className="btn-neon-purple">
              Get in Touch
            </Link>
          </div>
        </div>
      </Section>

      {/* Founder Quote */}
      <Section background="solid" className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-xl italic text-gray-400 mb-4">
            "Sometimes you have to look at a grander picture to see the whole."
          </blockquote>
          <p className="text-purple-400 font-semibold">— Alissa M.R. Eldridge</p>
          <p className="text-sm text-gray-500 mt-1">Founder, Reality Radio Network</p>
        </div>
      </Section>
    </main>
  );
}
