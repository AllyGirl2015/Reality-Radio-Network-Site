import { Metadata } from 'next';
import { FileText, Mail } from 'lucide-react';
import Section from '@/components/Section';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Reality Radio Network',
  description: 'Terms and conditions for using Reality Radio Network services, purchasing music, and licensing content.',
  openGraph: {
    title: 'Terms of Service | Reality Radio Network',
    description: 'Legal terms governing your use of our services.',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Terms of Service</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Legal terms governing your use of Reality Radio Network
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: November 11, 2025
          </p>
        </div>
      </Section>

      {/* Content */}
      <Section background="solid">
        <div className="max-w-4xl mx-auto prose prose-invert prose-cyan">
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-8 hover:border-purple-400/40 transition-colors">
            
            {/* Agreement */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Agreement to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using Reality Radio Network's website and services ("Services"), you agree 
                to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                please do not use our Services.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                We reserve the right to update these Terms at any time. Your continued use of our Services 
                after changes constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Use of Services */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Use of Services</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Eligibility</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                You must be at least 13 years old to use our Services. If you are under 18, you must have 
                parental or guardian consent to make purchases.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Account Responsibility</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you create an account, you are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Prohibited Activities</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malware or harmful code</li>
                <li>Harass, abuse, or harm others</li>
                <li>Scrape, data mine, or use automated tools without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Share or resell our music without proper licensing</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Our Content</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                All content on Reality Radio Network, including music, lyrics, artwork, logos, text, and 
                software, is owned by us or our licensors and protected by copyright, trademark, and other 
                intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Your License</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you purchase music from us, you receive:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Personal Use:</strong> The right to listen, download, and enjoy the music for personal, non-commercial purposes</li>
                <li><strong className="text-white">Limited Sharing:</strong> You may share purchased music with immediate family members in your household</li>
                <li><strong className="text-white">No Redistribution:</strong> You may NOT resell, publicly distribute, or share with others outside your household</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Commercial Use</h3>
              <p className="text-gray-300 leading-relaxed">
                Commercial use (streaming, podcasts, videos, business use) requires a separate license. 
                See our <Link href="/licensing" className="text-purple-400 hover:text-purple-300">Licensing page</Link> for details.
              </p>
            </div>

            {/* Purchases & Payments */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Purchases & Payments</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Pricing</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                All prices are in US Dollars (USD) and subject to change without notice. We strive to 
                display accurate pricing but errors may occur.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Payment Processing</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Payments are processed by secure third-party processors. We do not store credit card information.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Digital Products</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Digital music purchases are <strong className="text-white">final and non-refundable</strong> due 
                to the nature of instant access. Physical products may be returned within 30 days if unopened 
                and in original condition.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Taxes</h3>
              <p className="text-gray-300 leading-relaxed">
                You are responsible for any applicable taxes based on your location. Taxes may be added at checkout.
              </p>
            </div>

            {/* Shipping & Returns */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Shipping & Returns</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Shipping</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We ship physical products within 3-5 business days. Delivery times vary by location. 
                International orders may be subject to customs fees.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Returns & Refunds</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Physical Products:</strong> 30-day return period if unopened</li>
                <li><strong className="text-white">Damaged Items:</strong> Contact us within 7 days with photos for replacement or refund</li>
                <li><strong className="text-white">Digital Products:</strong> No refunds due to instant access</li>
              </ul>
            </div>

            {/* Persona Adoption Program */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Persona Adoption Program</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The Persona Adoption Program has separate, detailed contractual terms that will be provided 
                during the application process. Key points:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Royalty splits: 50/50 for 2 years, then 90% artist / 10% RRN</li>
                <li>Artists retain ownership of music they create</li>
                <li>Original AI catalog remains with RRN</li>
                <li>Brand guidelines must be followed</li>
                <li>Buyout options available after 2 years</li>
              </ul>
            </div>

            {/* Disclaimers */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Disclaimers & Limitations</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">As-Is Basis</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our Services are provided "as is" without warranties of any kind, either express or implied. 
                We do not guarantee uninterrupted, error-free service.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
              <p className="text-gray-300 leading-relaxed">
                To the fullest extent permitted by law, Reality Radio Network shall not be liable for any 
                indirect, incidental, consequential, or punitive damages arising from your use of our Services.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to suspend or terminate your access to our Services at any time, 
                without notice, for violation of these Terms or any other reason. Upon termination, 
                your right to use our Services ceases immediately.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms are governed by the laws of the United States and the state where Reality 
                Radio Network is registered, without regard to conflict of law principles.
              </p>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Dispute Resolution</h2>
              <p className="text-gray-300 leading-relaxed">
                In the event of any dispute, you agree to first contact us to attempt an informal resolution. 
                If unresolved, disputes may be subject to binding arbitration in accordance with applicable laws.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 mt-8 hover:border-purple-400/40 transition-colors">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-purple-400 shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Questions About These Terms?</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    If you have questions about these Terms of Service:
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:legal@realityradionetwork.com" className="text-purple-400 hover:text-purple-300">
                      legal@realityradionetwork.com
                    </a>
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong className="text-white">Website:</strong>{' '}
                    <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                      Contact Form
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Section>
    </main>
  );
}
