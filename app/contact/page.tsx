import { Metadata } from 'next';
import { Mail, MessageSquare, Clock, Send } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch with Reality Radio Network',
  description: 'Have questions or want to collaborate? Contact Reality Radio Network. Support, partnerships, licensing, and artist inquiries welcome.',
  openGraph: {
    title: 'Contact Us | Reality Radio Network',
    description: 'Get in touch for support, partnerships, or artist inquiries.',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 px-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Get in Touch</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed px-4">
            Questions, feedback, or collaboration ideas? We'd love to hear from you.
          </p>
        </div>
      </Section>

      {/* Contact Options */}
      <Section background="solid">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Email Contact */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-purple-400 mb-3 md:mb-4" aria-hidden="true" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Email Us</h2>
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                For support, inquiries, or general questions, send us an email directly:
              </p>
              <a
                href="mailto:support@realityradionetwork.com"
                className="text-purple-400 text-sm md:text-lg font-semibold hover:text-purple-300 transition-colors inline-flex items-center gap-2 break-all"
                aria-label="Send email to support@realityradionetwork.com"
              >
                support@realityradionetwork.com
                <Send className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            {/* Discord Community */}
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 sm:p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 mb-3 md:mb-4" aria-hidden="true" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Join Our Discord</h2>
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                Connect with the community, get updates, and chat with other fans and artists.
              </p>
              <a
                href="https://discord.realityradionetwork.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon inline-flex items-center justify-center gap-2 px-6 py-3"
                aria-label="Join Reality Radio Network Discord server"
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                Join Discord Server
              </a>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 sm:p-6 hover:border-purple-400/40 transition-colors mb-8 md:mb-12">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mb-2 md:mb-3" aria-hidden="true" />
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Please Note</h3>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              <strong>Reality Radio Network is currently operated by just one person</strong> — 
              Alissa M.R. Eldridge. While the plan is to grow and expand into a full team over time, 
              all operations (from production to support) are handled personally for now.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Your <strong className="text-purple-400">patience, kindness, and support</strong> mean the world. 
              Replies will come as quickly as possible. ❤️
            </p>
          </div>
        </div>
      </Section>

      {/* Contact Form */}
      <Section background="gradient">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Send a Message</h2>
            <p className="text-sm md:text-base text-gray-400">Fill out the form below and we'll get back to you</p>
          </div>

          <form 
            action="https://formspree.io/f/mgvrkjeo" 
            method="POST"
            className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/40 transition-colors" 
            aria-label="Contact form"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  aria-required="true"
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  aria-required="true"
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                aria-required="true"
                className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                placeholder="How can we help?"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Inquiry Type *
              </label>
              <select
                id="category"
                name="category"
                required
                aria-required="true"
                className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                <option value="">Select a category</option>
                <option value="support">General Support</option>
                <option value="artist">Artist / Persona Inquiry</option>
                <option value="licensing">Licensing / Business</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="technical">Technical Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                aria-required="true"
                rows={6}
                className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button type="submit" className="btn-neon-purple w-full flex items-center justify-center gap-2" aria-label="Submit contact form">
              <Send className="w-5 h-5" aria-hidden="true" />
              Send Message
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </form>
        </div>
      </Section>

      {/* FAQ Quick Links */}
      <Section background="solid">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Before You Reach Out</h2>
          <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6">
            Check out our FAQ for quick answers to common questions:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/faq#shipping" className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-sm text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-colors">
              Shipping Times
            </a>
            <a href="/faq#licensing" className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-sm text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-colors">
              Music Licensing
            </a>
            <a href="/faq#personas" className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-sm text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-colors">
              Persona Program
            </a>
            <a href="/faq#ai" className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-sm text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-colors">
              AI Transparency
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
