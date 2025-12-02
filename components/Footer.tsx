import Link from 'next/link';
import Image from 'next/image';
import { Radio, Facebook, Instagram, Youtube, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: 'Our Story', href: '/story' },
      { label: 'Talents', href: '/talent' },
      { label: 'Persona Program', href: '/personas' },
      { label: 'Blog', href: '/blog' },
      { label: 'Our Promise', href: '/promise' },
    ],
    Store: [
      { label: 'Albums', href: '/store/albums' },
      { label: 'Singles', href: '/store/singles' },
      { label: 'Licensing', href: '/licensing' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
    Radio: [
      { label: 'All Stations', href: '/radio' },
      { label: 'Schedule', href: '/radio#schedule' },
      { label: 'Listen Live', href: '/#listen' },
      { label: 'Advertising', href: '/advertising' },
    ],
    Support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Donate', href: '/donate' },
      { label: 'Privacy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-black/70 backdrop-blur-md border-t border-purple-500/30 mt-20" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4 group" aria-label="Reality Radio Network Home">
              <Radio className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" aria-hidden="true" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">RRN</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto sm:mx-0">
              The future of music. Original artists, real emotions, authentic sound.
            </p>
            <nav aria-label="Social media links">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <a href="https://www.facebook.com/share/19uwsoszER/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg" aria-label="Facebook">
                  <Facebook className="w-5 h-5" aria-hidden="true" />
                </a>
                <a href="https://www.instagram.com/rbentertainmemtworks" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg" aria-label="Instagram">
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </a>
                <a href="https://www.tiktok.com/@rbentertainmentworks" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg" aria-label="TikTok">
                  <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@r.b.e.w." target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg" aria-label="YouTube - RBEW">
                  <Youtube className="w-5 h-5" aria-hidden="true" />
                </a>
                <a href="https://youtube.com/@rbewrrn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-500/10 rounded-lg" aria-label="YouTube - RRN">
                  <Radio className="w-5 h-5" aria-hidden="true" />
                </a>
                <a href="https://www.linkedin.com/company/reality-builders-entertainment-works-llc/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
            </nav>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={`${title} links`} className="text-center sm:text-left">
              <h3 className="text-purple-400 font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm inline-block hover:translate-x-1 transition-transform"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-500/20 pt-8">
          {/* Logos */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-8">
            <div className="relative w-24 sm:w-32 h-12 sm:h-16 opacity-60 hover:opacity-100 transition-opacity">
              <Image
                src="/RRN_logo.jpg"
                alt="Reality Radio Network"
                fill
                className="object-contain"
              />
            </div>
            <a 
              href="https://www.rbentertainment-works.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-24 sm:w-32 h-12 sm:h-16 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/RBEW_logo.jpg"
                alt="Reality Builders Entertainment Works"
                fill
                className="object-contain"
              />
            </a>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="text-center md:text-left">
              <p className="mb-1">© {currentYear} Reality Radio Network. All rights reserved.</p>
              <p className="text-xs text-gray-600">A Reality Builders Entertainment Works Property</p>
              <p className="text-xs text-gray-600 mt-1">Developed by <span className="text-purple-400">Emerson Rodrigues</span></p>
            </div>
            <nav aria-label="Legal links">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-purple-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="mt-8 text-center px-4">
          <blockquote className="text-gray-500 italic text-sm max-w-2xl mx-auto">
            "If nothing is ever said, nothing will ever be done, and if nothing is ever done, nothing will ever change... Be it for better, or for worse."
            <cite className="block mt-2 text-purple-400 not-italic text-xs">— Alissa M.R. Eldridge, Founder</cite>
          </blockquote>
        </div>
      </div>
    </footer>
  );
}
