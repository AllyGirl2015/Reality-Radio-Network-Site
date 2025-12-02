import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, Package, AlertTriangle, Shield, ExternalLink, Server } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Disclaimer | Reality Radio Network',
  description: 'Important disclaimers regarding digital delivery, product accuracy, warranties, and limitation of liability for Reality Radio Network products and services.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen pt-24">
      <Section className="pb-12">
        <Link 
          href="/store" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Store
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Disclaimer
            </span>
          </h1>
          <p className="text-gray-400 text-sm mb-4">Last Updated: Sunday, November 30, 2025</p>
          <p className="text-gray-300">
            The following terms apply to all products, services, and content offered by Reality Builders Entertainment Works (RBEW) and its divisions, including Reality Radio Network (RRN).
          </p>
        </div>
      </Section>

      <Section background="solid">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Digital Delivery */}
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">Digital Delivery</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Digital products (music files, audio downloads, documents) are delivered electronically.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Customers are responsible for maintaining access to their email and download devices.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                RBEW is not liable for issues caused by third-party software, device compatibility, or user-side technical limitations.
              </li>
            </ul>
          </div>

          {/* Product Accuracy */}
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-purple-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">Product Accuracy</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                RBEW makes every reasonable effort to ensure product descriptions and media samples accurately represent the final product.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                Minor variations in audio mixing, mastering, formatting, or packaging may occur.
              </li>
            </ul>
          </div>

          {/* No Warranty */}
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">No Warranty</h2>
            </div>
            <p className="text-gray-300 mb-4">
              All products, digital or physical, are provided <span className="text-yellow-400 font-semibold">"as is"</span> without warranties of any kind, express or implied, except where prohibited by law.
            </p>
            <p className="text-gray-400 mb-3">This includes:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                No guarantee of uninterrupted access
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                No guarantee of compatibility with specific devices or software
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                No guarantee that digital files will function on outdated or unsupported systems
              </li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            </div>
            <p className="text-gray-400 mb-4">To the maximum extent permitted by law:</p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                RBEW is not liable for incidental, indirect, or consequential damages arising from the purchase, download, or use of any product.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                RBEW's total liability is limited to the purchase price of the item in question.
              </li>
            </ul>
          </div>

          {/* Third-Party Services */}
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">Third-Party Services</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Some services (payments, hosting, streaming) are managed by external providers (e.g., Square, Stripe, Live365).
            </p>
            <p className="text-gray-400">
              RBEW is not responsible for outages, delays, or errors originating from third-party platforms.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">Have questions about these terms?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-neon-purple">
              Contact Us
            </Link>
            <Link href="/returns" className="btn-neon">
              Returns Policy
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
