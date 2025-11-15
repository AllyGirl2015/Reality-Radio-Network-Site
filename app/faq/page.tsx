import { Metadata } from 'next';
import { HelpCircle, Package, Music, Scale, Bot, DollarSign, Shield, Mail } from 'lucide-react';
import Section from '@/components/Section';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Reality Radio Network',
  description: 'Find answers to common questions about Reality Radio Network, shipping, licensing, AI transparency, persona program, and more.',
  openGraph: {
    title: 'FAQ | Reality Radio Network',
    description: 'Common questions about music, licensing, shipping, and our AI artists.',
  },
};

export default function FAQPage() {
  const faqCategories = [
    {
      icon: Package,
      title: 'Shipping & Orders',
      id: 'shipping',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Physical products typically ship within 3-5 business days. Standard shipping within the US takes 5-7 business days. International shipping varies by location but generally takes 2-4 weeks.',
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. International orders may be subject to customs fees determined by your country.',
        },
        {
          q: 'Can I track my order?',
          a: 'Absolutely. Once your order ships, you\'ll receive a tracking number via email. You can use this to monitor your package\'s journey.',
        },
        {
          q: 'What if my order arrives damaged?',
          a: 'We take great care in packaging, but if something arrives damaged, please contact us within 7 days with photos. We\'ll send a replacement or issue a full refund.',
        },
      ],
    },
    {
      icon: Scale,
      title: 'Licensing & Rights',
      id: 'licensing',
      questions: [
        {
          q: 'Can I use your music in my project?',
          a: 'Yes! We offer licensing for commercial and personal projects. Visit our Licensing page or contact us for custom quotes. Personal streaming and enjoyment is always free.',
        },
        {
          q: 'What\'s included in a music license?',
          a: 'Our standard license includes sync rights for video, podcasts, and social media. Commercial broadcast and film requires an extended license. All licenses are perpetual once purchased.',
        },
        {
          q: 'Do I own the music if I buy an album?',
          a: 'You own the copy you purchased for personal use. Commercial rights require a separate license. Think of it like buying a movie - you can watch it, but can\'t use it in your film without permission.',
        },
        {
          q: 'Can I play your music on my stream or podcast?',
          a: 'For personal/hobby streams and podcasts with under 10k listeners, you\'re welcome to play our music with credit. Commercial ventures require licensing. Contact us for creator-friendly rates!',
        },
      ],
    },
    {
      icon: Bot,
      title: 'AI & Transparency',
      id: 'ai',
      questions: [
        {
          q: 'Are your artists real people or AI?',
          a: 'Currently, our music is AI-generated with carefully crafted personas. However, we\'re actively transitioning to real human artists through our Persona Adoption Program, where talented musicians take over AI personas.',
        },
        {
          q: 'Why use AI for music?',
          a: 'AI serves as our foundation and discovery tool. It allows us to experiment with sounds, create consistent personas, and identify what resonates. Our goal is to use AI as a stepping stone to launch real artists.',
        },
        {
          q: 'Will you always use AI?',
          a: 'No. Our vision is a hybrid future where AI helps with production, but real artists write, perform, and connect with fans. We see AI as a tool, not a replacement for human creativity.',
        },
        {
          q: 'How do you ensure quality?',
          a: 'Every track is curated by our founder, Alissa. We don\'t release everything AI generates - only what meets our standards for emotion, musicality, and authenticity. Real artists will maintain this quality control.',
        },
      ],
    },
    {
      icon: Music,
      title: 'Persona Adoption Program',
      id: 'personas',
      questions: [
        {
          q: 'What is the Persona Adoption Program?',
          a: 'It\'s a revolutionary program where real artists audition to "adopt" an existing AI persona. You inherit the brand, back catalog, and fanbase, then create new music as that character. Think of it as a music industry shortcut.',
        },
        {
          q: 'How much does it cost to adopt a persona?',
          a: 'The program is FREE for artists. You pay nothing upfront. Instead, we split royalties 50/50 for the first 2 years, then it shifts to 90% you / 10% us. You own your new music 100%.',
        },
        {
          q: 'Can I change the persona\'s style?',
          a: 'Yes, with boundaries. You can evolve the sound, add your influence, and grow the character. However, drastic changes that alienate the existing fanbase require approval. It\'s a collaboration.',
        },
        {
          q: 'What if I want to leave the program?',
          a: 'After 2 years, you can buy out the persona for fair market value, or simply walk away. Any music YOU created is yours forever. The original AI catalog remains ours.',
        },
      ],
    },
    {
      icon: DollarSign,
      title: 'Pricing & Payment',
      id: 'pricing',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, and Apple Pay. All transactions are securely processed.',
        },
        {
          q: 'Are there any subscription options?',
          a: 'Not currently, but we\'re exploring a fan club tier with exclusive releases, early access, and merch discounts. Digital music is one-time purchase only.',
        },
        {
          q: 'Do you offer refunds?',
          a: 'Digital music sales are final due to instant access. Physical products can be returned within 30 days if unopened. Damaged or defective items are always replaced free.',
        },
        {
          q: 'Are prices in USD?',
          a: 'Yes, all prices are in US Dollars. Your bank or credit card may convert to your local currency with their standard exchange rate and fees.',
        },
      ],
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      id: 'privacy',
      questions: [
        {
          q: 'How do you use my data?',
          a: 'We only collect what\'s necessary for orders and communication. We never sell your data. See our full Privacy Policy for details.',
        },
        {
          q: 'Is my payment information safe?',
          a: 'Absolutely. We never store credit card information. All payments are processed through secure, PCI-compliant payment processors.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes. Contact us and we\'ll delete your account and personal data within 30 days, except for legally required transaction records.',
        },
        {
          q: 'Do you use cookies?',
          a: 'We use minimal cookies for site functionality and analytics. No intrusive tracking. You can disable cookies in your browser settings. See our Cookie Policy for more.',
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-3xl mx-auto text-center px-4">
          <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Frequently Asked</span>
            <br />
            <span className="text-white">Questions</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
            Find answers to common questions about our music, shipping, licensing, and more.
          </p>
        </div>
      </Section>

      {/* Quick Links */}
      <Section background="solid" className="py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 mb-4 text-sm">Jump to section:</p>
          <nav aria-label="FAQ categories">
            <div className="flex flex-wrap justify-center gap-3">
              {faqCategories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-sm text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2"
                >
                  <category.icon className="w-4 h-4" aria-hidden="true" />
                  {category.title}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </Section>

      {/* FAQ Categories */}
      {faqCategories.map((category, idx) => (
        <Section 
          key={category.id} 
          background={idx % 2 === 0 ? 'solid' : 'gradient'}
          id={category.id}
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
              <category.icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" aria-hidden="true" />
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{category.title}</h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              {category.questions.map((faq, faqIdx) => (
                <div key={faqIdx} className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 sm:p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3 flex items-start gap-2 md:gap-3">
                    <span className="text-purple-400 text-xl md:text-2xl font-bold shrink-0">Q.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <div className="flex items-start gap-2 md:gap-3 pl-6 md:pl-8">
                    <span className="text-cyan-400 text-xl md:text-2xl font-bold shrink-0">A.</span>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ))}

      {/* Still Have Questions */}
      <Section background="solid">
        <div className="max-w-3xl mx-auto text-center px-4">
          <Mail className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mx-auto mb-3 md:mb-4" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Still Have Questions?</h2>
          <p className="text-sm md:text-base text-gray-300 mb-6 md:mb-8 leading-relaxed">
            Can't find what you're looking for? We're here to help! 
            Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
              <Mail className="w-5 h-5" aria-hidden="true" />
              Contact Us
            </Link>
            <a 
              href="mailto:support@realityradionetwork.com" 
              className="btn-neon inline-flex items-center gap-2"
              aria-label="Send email to support"
            >
              Email Support
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
