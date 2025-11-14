import { Metadata } from 'next';
import { Scale, Video, Radio, Music, Briefcase, Check, Mail, ArrowRight } from 'lucide-react';
import Section from '@/components/Section';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Music Licensing | Reality Radio Network',
  description: 'License music from Reality Radio Network for your videos, podcasts, films, commercials, and projects. Flexible pricing and creator-friendly terms.',
  openGraph: {
    title: 'Music Licensing | Reality Radio Network',
    description: 'Professional music licensing for content creators and businesses.',
  },
};

export default function LicensingPage() {
  const licenseTypes = [
    {
      icon: Video,
      title: 'Content Creator License',
      price: '$49',
      period: 'per track',
      description: 'Perfect for YouTubers, streamers, and podcasters',
      features: [
        'Use in videos, podcasts, and streams',
        'Monetization allowed',
        'Social media distribution',
        'Attribution required',
        'Up to 1M views/listeners',
        'Perpetual license',
      ],
      popular: true,
    },
    {
      icon: Briefcase,
      title: 'Commercial License',
      price: '$299',
      period: 'per track',
      description: 'For businesses, ads, and commercial projects',
      features: [
        'All Creator License features',
        'Commercial advertising',
        'Corporate videos',
        'Product demos',
        'Unlimited views/impressions',
        'No attribution required',
      ],
      popular: false,
    },
    {
      icon: Music,
      title: 'Film & TV Sync',
      price: 'Custom',
      period: 'quote',
      description: 'For films, TV shows, and broadcast',
      features: [
        'Film and television rights',
        'Broadcast (cable, streaming, OTT)',
        'Festival and theatrical release',
        'Worldwide or territory-specific',
        'Flexible term lengths',
        'Exclusive options available',
      ],
      popular: false,
    },
  ];

  const useCases = [
    {
      title: 'YouTube Videos',
      description: 'Enhance your content with professional music. Perfect for vlogs, tutorials, and storytelling.',
      icon: Video,
    },
    {
      title: 'Podcasts & Audio',
      description: 'Create the perfect atmosphere for your podcast intro, outro, or background music.',
      icon: Radio,
    },
    {
      title: 'Social Media',
      description: 'Stand out on Instagram, TikTok, and Facebook with unique, licensed tracks.',
      icon: Music,
    },
    {
      title: 'Business & Corporate',
      description: 'Elevate presentations, explainer videos, and marketing campaigns.',
      icon: Briefcase,
    },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Scale className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Music Licensing</span>
            <br />
            <span className="text-white">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            License authentic AI-powered music for your projects. 
            Creator-friendly pricing, clear terms, and instant delivery.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="#licenses" className="btn-neon inline-flex items-center gap-2">
              View License Options
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
              <Mail className="w-5 h-5" aria-hidden="true" />
              Custom Quote
            </Link>
          </div>
        </div>
      </Section>

      {/* Why License From Us */}
      <Section background="solid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why License From <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">RRN</span>?
            </h2>
            <p className="text-xl text-gray-400">Transparent, fair, and creator-friendly</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 border border-purple-400 flex items-center justify-center">
                <Check className="w-8 h-8 text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Perpetual Licenses</h3>
              <p className="text-gray-300">
                Pay once, use forever. No recurring fees or surprise charges. Your license never expires.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 text-center hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center">
                <Check className="w-8 h-8 text-cyan-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Clear Terms</h3>
              <p className="text-gray-300">
                No confusing legalese. Simple, straightforward licensing with exactly what you can (and can't) do.
              </p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 border border-purple-400 flex items-center justify-center">
                <Check className="w-8 h-8 text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Instant Delivery</h3>
              <p className="text-gray-300">
                Download your license and high-quality audio files immediately after purchase. Start creating now.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* License Types */}
      <Section background="gradient" id="licenses">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Choose Your <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">License</span>
            </h2>
            <p className="text-xl text-gray-400">Flexible options for every budget and project</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {licenseTypes.map((license) => (
              <div
                key={license.title}
                className={`bg-black/40 border rounded-lg p-6 relative hover:shadow-lg transition-all duration-300 ${
                  license.popular ? 'border-purple-400 shadow-purple-500/20' : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20'
                }`}
              >
                {license.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <license.icon className="w-12 h-12 text-purple-400 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">{license.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{license.description}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-white">{license.price}</span>
                    <span className="text-gray-500 text-sm">/ {license.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {license.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                    license.popular
                      ? 'btn-neon-purple'
                      : 'btn-neon'
                  }`}
                >
                  {license.price === 'Custom' ? 'Request Quote' : 'Get License'}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Need multiple tracks or a custom package?{' '}
              <Link href="/contact" className="text-purple-400 hover:text-purple-300 font-semibold">
                Contact us for volume discounts
              </Link>
            </p>
          </div>
        </div>
      </Section>

      {/* Use Cases */}
      <Section background="solid">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Perfect For <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Any Project</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 text-center hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                <useCase.icon className="w-10 h-10 text-cyan-400 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-400">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              How <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">It Works</span>
            </h2>
            <p className="text-xl text-gray-400">Get licensed in minutes</p>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 flex items-start gap-4 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500 text-white font-bold text-xl flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Browse Our Catalog</h3>
                <p className="text-gray-300">
                  Explore our <Link href="/store" className="text-purple-400 hover:text-purple-300">music store</Link> and 
                  find the perfect track for your project. Listen to full previews.
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 flex items-start gap-4 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-12 h-12 shrink-0 rounded-full bg-cyan-500 text-white font-bold text-xl flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Choose Your License</h3>
                <p className="text-gray-300">
                  Select the license type that fits your needs. Unsure? <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">Contact us</Link> for help.
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 flex items-start gap-4 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500 text-white font-bold text-xl flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Complete Purchase</h3>
                <p className="text-gray-300">
                  Secure checkout with instant email confirmation. No waiting, no hassle.
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 flex items-start gap-4 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-12 h-12 shrink-0 rounded-full bg-cyan-500 text-white font-bold text-xl flex items-center justify-center">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Download & Create</h3>
                <p className="text-gray-300">
                  Get instant access to your license document and high-quality audio files (WAV/MP3). Start creating immediately!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Licensing <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">FAQ</span>
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-2">What's the difference between personal and commercial use?</h3>
              <p className="text-gray-300">
                Personal use is for hobby projects, free content, and non-monetized channels. Commercial use involves making money 
                (ads, sponsorships, selling products) or using music in business contexts.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Can I use one license for multiple projects?</h3>
              <p className="text-gray-300">
                Each license covers one project (e.g., one video series, one podcast season). For multiple projects, you'll need 
                multiple licenses. Contact us for volume discounts.
              </p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Do I need to credit Reality Radio Network?</h3>
              <p className="text-gray-300">
                Content Creator License requires attribution (music credit in description). Commercial and Film licenses do not.
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-2">What if my channel/project grows beyond the license limits?</h3>
              <p className="text-gray-300">
                If you exceed 1M views on a Creator License, simply upgrade to a Commercial License. We'll credit your original purchase price.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">More questions?</p>
            <Link href="/faq#licensing" className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-2">
              View Full Licensing FAQ
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Ready to License?</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Whether you're a content creator, business, or filmmaker, we have the perfect licensing solution for you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/store" className="btn-neon inline-flex items-center gap-2">
              Browse Music Catalog
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
              <Mail className="w-5 h-5" aria-hidden="true" />
              Request Custom Quote
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
