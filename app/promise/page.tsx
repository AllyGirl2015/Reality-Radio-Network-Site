import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Heart, DollarSign, MessageCircle, Shield, User, Sparkles } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Our Promise to You | Reality Radio Network',
  description: 'Reality Builders Entertainment Works is built on integrity, transparency, and respect. Learn about our commitments to fair pricing, honest communication, and ethical practices.',
};

export default function PromisePage() {
  const promises = [
    {
      icon: DollarSign,
      title: 'Fair Pricing',
      description: 'All music, albums, and products are priced to be accessible while supporting the creators behind them.',
      color: 'green',
    },
    {
      icon: MessageCircle,
      title: 'Honest Communication',
      description: 'If an issue occurs with your purchase, we will work with you directly to correct it as quickly as possible.',
      color: 'cyan',
    },
    {
      icon: Shield,
      title: 'Ethical Practices',
      description: 'We do not engage in manipulative sales tactics, hidden fees, or misleading product descriptions.',
      color: 'purple',
    },
    {
      icon: User,
      title: 'Human Accountability',
      description: 'RBEW is a creator-driven operation. If we make a mistake, we will address it openly and fix it.',
      color: 'pink',
    },
    {
      icon: Heart,
      title: 'Respect for Your Support',
      description: 'Every purchase, whether a single, an album, or a CD, directly helps fund future music, animation, stories, and entertainment across the RBEW universe.',
      color: 'red',
    },
  ];

  const colorClasses: Record<string, { border: string; bg: string; text: string; icon: string }> = {
    green: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400', icon: 'text-green-400' },
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'text-cyan-400' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
    pink: { border: 'border-pink-500/30', bg: 'bg-pink-500/10', text: 'text-pink-400', icon: 'text-pink-400' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', icon: 'text-red-400' },
  };

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
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Our Promise to You
            </span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Reality Builders Entertainment Works (RBEW) is built on <span className="text-purple-400">integrity</span>, <span className="text-cyan-400">transparency</span>, and <span className="text-pink-400">respect</span> for every supporter who chooses to be part of our journey.
          </p>
        </div>
      </Section>

      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">We Promise the Following:</h2>
          
          <div className="space-y-6">
            {promises.map((promise, index) => {
              const colors = colorClasses[promise.color];
              const Icon = promise.icon;
              return (
                <div 
                  key={index}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${colors.text} mb-2`}>{promise.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{promise.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section background="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-lg p-8">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-2xl text-white font-semibold mb-4">
              Your support matters, and we never take it for granted.
            </p>
            <p className="text-gray-300">
              Thank you for being part of the Reality Radio Network family.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/store" className="btn-neon-purple">
              Visit Our Store
            </Link>
            <Link href="/donate" className="btn-neon">
              Support Us
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
