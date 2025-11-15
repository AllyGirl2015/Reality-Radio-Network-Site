import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Sparkles, TrendingUp, Award, FileText, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Persona Adoption Program | Become an AI Artist',
  description: 'Step into a fully-crafted artist identity. Audition, perform, and eventually own the persona completely. Equal partnership, creative freedom, and full rights transfer.',
  keywords: ['persona adoption', 'AI artist', 'music career', 'artist program', 'music licensing'],
  openGraph: {
    title: 'Persona Adoption Program | Reality Radio Network',
    description: 'Audition to adopt an AI persona, perform, create, and eventually own it completely.',
  },
};

export default function PersonasPage() {
  const howItWorks = [
    {
      step: 1,
      title: 'We Design the Persona',
      description: 'The RRN team develops the style, themes, personality, and initial music catalog.',
      icon: Sparkles,
    },
    {
      step: 2,
      title: 'Auditions Open',
      description: 'You submit vocals, instrumentals, and a short video intro showcasing your talent.',
      icon: Mic,
    },
    {
      step: 3,
      title: 'Callbacks & Testing',
      description: 'Shortlisted talent works with us on guided material to test fit and chemistry.',
      icon: Users,
    },
    {
      step: 4,
      title: 'Contract & Launch',
      description: 'You sign the Persona Adoption Contract and begin your journey as the artist.',
      icon: FileText,
    },
    {
      step: 5,
      title: 'Ownership Transfer',
      description: 'Complete the term in good standing, and you gain full rights to the name and persona.',
      icon: Award,
    },
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Shared Revenue', description: '50/50 split initially, growing to 90/10 in your favor over time' },
    { icon: Users, title: 'Equal Creative Input', description: 'Full control over music, visuals, and performances alongside RRN' },
    { icon: Sparkles, title: 'Distribution & Promotion', description: 'Professional distribution through RRN and partner channels' },
    { icon: Mic, title: 'Event Opportunities', description: 'Access to live performances, media appearances, and collaborations' },
    { icon: Award, title: 'Full Rights Transfer', description: 'Own the persona completely after successfully completing your contract' },
    { icon: CheckCircle2, title: 'Professional Support', description: 'Production, marketing, and business guidance throughout' },
  ];

  const royaltyPhases = [
    { phase: 'Years 1-2', split: '50% RRN / 50% You', color: 'text-yellow-400' },
    { phase: 'Years 3+', split: '10% RRN / 90% You', color: 'text-[#00f3ff]' },
    { phase: 'Post-Contract', split: '10% RRN* / 90% You', color: 'text-[#0ff]', note: '*Only on works created during contract' },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Persona Adoption</span>
            <br />
            <span className="text-white">Program</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
            Step into a carefully crafted artist identity complete with sound, story, and visual branding.
            Perform, create, and eventually <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-semibold">make it fully yours</span>.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="#how-it-works" className="btn-neon-purple">
              How It Works
            </Link>
            <Link href="#audition" className="btn-neon">
              Start Audition
            </Link>
          </div>
        </div>
      </Section>

      {/* What Is It */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">What Is Persona Adoption?</span>
          </h2>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/40 transition-colors mb-8">
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              At RRN, some artists begin as <strong className="text-purple-400">carefully crafted personas</strong>
              complete with a sound, story, and visual identity. These personas are built to inspire, challenge, 
              and connect with audiences.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Once ready, we open auditions for real performers to <strong className="text-[#0ff]">adopt these personas</strong>. 
              If selected, you'll step into the role, shape its future, and eventually make it fully yours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-neon text-center">
              <div className="text-3xl font-bold neon-text mb-2">22</div>
              <p className="text-sm text-gray-400">Personas Available</p>
            </div>
            <div className="card-neon text-center">
              <div className="text-3xl font-bold neon-text mb-2">100%</div>
              <p className="text-sm text-gray-400">Ownership Possible</p>
            </div>
            <div className="card-neon text-center">
              <div className="text-3xl font-bold neon-text mb-2">Equal</div>
              <p className="text-sm text-gray-400">Creative Control</p>
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section background="gradient" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center">
            <span className="neon-text">How It Works</span>
          </h2>

          <div className="space-y-4 md:space-y-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="card-neon flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#00f3ff] text-black flex items-center justify-center font-bold text-xl sm:text-2xl">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 justify-center sm:justify-start">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f3ff]" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold neon-text">{item.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Benefits */}
      <Section background="solid">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">What You Get as a Persona Adopter</span>
          </h2>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                <benefit.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Royalty Structure */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Royalty Structure</span>
          </h2>
          <p className="text-center text-gray-300 mb-12 text-lg">
            Fair, transparent, and designed to reward your growth
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {royaltyPhases.map((phase, index) => (
              <div key={index} className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">{phase.phase}</h3>
                <div className={`text-3xl font-bold mb-2 ${phase.color}`}>{phase.split}</div>
                {phase.note && <p className="text-xs text-gray-500 mt-2">{phase.note}</p>}
              </div>
            ))}
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/40 transition-colors">
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Upon Full Completion:</h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              When you successfully complete your contract term on good terms, <strong>RBEW releases all rights
              to the Persona to you</strong> except for a small 10% royalty share on works created during
              the contract period (if commercially exploited after the contract).
            </p>
            <p className="text-purple-400 font-semibold">
              Everything you create after that? 100% yours.
            </p>
          </div>
        </div>
      </Section>

      {/* Contract Overview */}
      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Contract Overview</span>
          </h2>

          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/40 transition-colors mb-8">
            <FileText className="w-10 h-10 text-cyan-400 mb-4" />
            <p className="text-gray-300 leading-relaxed mb-4">
              Our Persona Adoption Contract is designed to be <strong className="text-cyan-400">fair, 
              transparent, and artist-friendly</strong>. It covers:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Copyright & ownership policies (C.O.P.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>AI exception and transparency policies (A.E.P.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Mental health support and leave policies (M.H.P.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Non-discrimination policies (N.D.P.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Termination rights and dispute resolution</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Link 
              href="/personas/contract" 
              className="btn-neon inline-flex items-center gap-2"
            >
              Read Full Contract Template
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Audition CTA */}
      <Section id="audition">
        <div className="max-w-3xl mx-auto text-center">
          <Mic className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Ready to Audition?</span>
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Auditions are opening soon! We'll be setting up the submission system for vocals, 
            instrumentals, and video intros. Contact us to express your interest and we'll 
            notify you when auditions open.
          </p>

          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/40 transition-colors mb-8">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">What to Prepare:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Vocal Sample</h4>
                <p className="text-sm text-gray-400">2-3 min performance showcasing range</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Instrumental (Optional)</h4>
                <p className="text-sm text-gray-400">If you play instruments, show us!</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Video Intro</h4>
                <p className="text-sm text-gray-400">Tell us about yourself and your goals</p>
              </div>
            </div>
          </div>

          <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
            Contact Us About Auditions
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-colors">
              <h3 className="font-bold mb-2 text-cyan-400">Do I need professional experience?</h3>
              <p className="text-sm text-gray-400">
                No! We're looking for talent, passion, and fit—not résumés. This program is designed 
                to elevate artists from unknown to fame.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-colors">
              <h3 className="font-bold mb-2 text-cyan-400">Can I create music outside the persona?</h3>
              <p className="text-sm text-gray-400">
                Yes! You retain the right to create original music outside the persona without restriction.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-colors">
              <h3 className="font-bold mb-2 text-cyan-400">What if I need to take a break?</h3>
              <p className="text-sm text-gray-400">
                We have a Mental Health Policy (M.H.P.) that allows voluntary leave at any time with no penalty, 
                as long as it doesn't jeopardize the persona's viability.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-colors">
              <h3 className="font-bold mb-2 text-cyan-400">How long is the contract?</h3>
              <p className="text-sm text-gray-400">
                Contract length varies, but typically ranges from 2-5 years depending on the persona and agreement.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
              Have more questions? Contact us →
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
