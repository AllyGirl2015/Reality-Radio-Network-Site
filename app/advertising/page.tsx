import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Radio, Mic, Volume2, TrendingUp, Store, Share2, Mail, Phone, Globe, Check, Zap } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Advertising & Sponsorship | Reality Radio Network',
  description: 'Promote your business on Reality Radio Network. Affordable advertising packages for local and international reach. Starting at $50/week.',
};

export default function AdvertisingPage() {
  const weeklyPackages = [
    {
      name: 'Bring-Your-Own Ad',
      price: 50,
      description: 'Perfect for businesses who already have a radio-ready audio ad.',
      features: [
        'Broadcast 4 times per day',
        'Aired across the RRN station network',
        'No contracts or long-term commitment',
        'Fast scheduling and reliable placement',
      ],
      highlight: false,
    },
    {
      name: 'Full-Production Ad',
      price: 100,
      description: 'Our most popular package.',
      features: [
        'Custom script written by RRN',
        'Professional voiceover and audio production',
        'You approve the final ad before it airs',
        'Broadcast 4 times per day',
        'Aired across the entire Reality Radio Network',
      ],
      highlight: true,
      badge: 'MOST POPULAR',
    },
  ];

  const upgradeTiers = [
    { name: 'Starter', frequency: 'Included', price: 0, description: '4 times per day' },
    { name: 'Boost', frequency: '8 times per day', price: 20, description: 'Every ~3 hours' },
    { name: 'Premium', frequency: '12 times per day', price: 40, description: 'Every ~2 hours' },
    { name: 'Max Exposure', frequency: '24 times per day', price: 75, description: 'Every hour' },
    { name: 'Dominance', frequency: '48 times per day', price: 150, description: 'Every 30 minutes' },
    { name: 'Blitz Mode', frequency: '96 times per day', price: 300, description: 'Every 15 minutes' },
  ];

  const benefits = [
    { icon: Globe, title: 'Local + International Reach', description: 'Listeners from San Antonio AND across the world tune in.' },
    { icon: Check, title: 'Affordable, Transparent Pricing', description: 'No hidden fees. No long-term contracts.' },
    { icon: Mic, title: 'Professional Audio Quality', description: 'All ads produced by RRN meet professional broadcast standards.' },
    { icon: TrendingUp, title: 'Flexible Options', description: 'Choose your level of exposure. Scale up as needed.' },
    { icon: Radio, title: 'Support Independent Creators', description: 'Your advertising directly supports the growth of a San Antonio–built entertainment network.' },
  ];

  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto text-center">
          <Radio className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Advertising & Sponsorship
            </span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-4">
            Promote Your Business Across the Entire RRN Station Network
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto">
            The Reality Radio Network (RRN) offers affordable, high-quality advertising for small businesses, creators, entrepreneurs, and organizations looking to reach both local audiences in San Antonio and international listeners across our global online radio platform.
          </p>
        </div>
      </Section>

      {/* Weekly Packages */}
      <Section background="solid">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Weekly Advertising Packages</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {weeklyPackages.map((pkg, index) => (
              <div 
                key={index}
                className={`relative bg-black/40 border rounded-lg p-6 ${
                  pkg.highlight 
                    ? 'border-purple-400 shadow-lg shadow-purple-500/20' 
                    : 'border-gray-700/50'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {pkg.badge}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-purple-400">${pkg.price}</span>
                  <span className="text-gray-400">/ Week</span>
                </div>
                <p className="text-gray-400 mb-6">{pkg.description}</p>
                <p className="text-sm text-cyan-400 font-semibold mb-3">Includes:</p>
                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Full-production is the best option for businesses that want a fully polished commercial without the hassle of producing it themselves.
          </p>
        </div>
      </Section>

      {/* Upgrade Tiers */}
      <Section background="gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-white mb-4">Air Time Upgrade Options</h2>
            <p className="text-gray-400">Add these upgrades to any weekly package to increase daily exposure across the network:</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgradeTiers.map((tier, index) => (
              <div 
                key={index}
                className={`bg-black/40 border rounded-lg p-4 text-center ${
                  index === 0 ? 'border-green-500/30' : 'border-purple-500/30'
                }`}
              >
                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{tier.frequency}</p>
                <p className="text-xs text-gray-500 mb-3">({tier.description})</p>
                {tier.price === 0 ? (
                  <span className="text-green-400 font-semibold">Included</span>
                ) : (
                  <span className="text-purple-400 font-bold">+${tier.price}</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Your ad will be rotated across all participating RRN stations, current and future, giving you broad, repeated exposure throughout the day.
          </p>
        </div>
      </Section>

      {/* In-Store Partner Discount */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 border border-green-400/30 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-4">
              <Store className="w-10 h-10 text-green-400" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-bold text-white">In-Store Partner Discount</h2>
                <span className="text-3xl font-bold text-green-400">20% Off</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Businesses that choose to play any RRN station inside their store qualify for a 20% discount on all weekly ad packages.
            </p>
            <p className="text-sm text-gray-400 mb-3">Benefits include:</p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {[
                'Enhanced atmosphere with curated music',
                'Customers hear your ad while shopping',
                'Increased brand familiarity',
                'Additional network support and visibility',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Optional Add-Ons */}
      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Optional Add-Ons</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Share2 className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-white">Social Media Shoutout</h3>
                </div>
                <span className="text-cyan-400 font-bold">$15</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your business is promoted on RRN social platforms with a dedicated post.
              </p>
            </div>

            <div className="bg-black/40 border border-gray-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-gray-400" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-white">Extended Network Placement</h3>
                </div>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>
              <p className="text-gray-400 text-sm">
                Placement across additional Reality Builders Entertainment Works (RBEW) media channels.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Why Advertise */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Advertise on the Reality Radio Network?</h2>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-black/40 border border-purple-500/30 rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Contact CTA */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">To book an ad slot or request more information:</p>
          
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:contact@realityradio.net" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Mail className="w-5 h-5" aria-hidden="true" />
                contact@realityradio.net
              </a>
              <a href="https://realityradio.net" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                <Globe className="w-5 h-5" aria-hidden="true" />
                realityradio.net
              </a>
            </div>
          </div>

          <p className="text-xl text-gray-300 mb-8">
            Let RRN help your business reach more listeners—<span className="text-purple-400">locally</span>, <span className="text-cyan-400">nationally</span>, and <span className="text-pink-400">across the globe</span>.
          </p>

          <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
            <Mail className="w-5 h-5" aria-hidden="true" />
            Contact Us Today
          </Link>
        </div>
      </Section>
    </main>
  );
}
