import { Metadata } from 'next';
import { Shield, Mail } from 'lucide-react';
import Section from '@/components/Section';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Reality Radio Network',
  description: 'Learn how Reality Radio Network collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy | Reality Radio Network',
    description: 'Our commitment to protecting your privacy and data.',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Privacy Policy</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Your privacy matters. Here's how we handle your data.
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
            
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Reality Radio Network ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website or use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide when you:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Make a purchase or place an order</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us via email or contact form</li>
                <li>Create an account (if applicable)</li>
                <li>Apply to our Persona Adoption Program</li>
              </ul>
              
              <p className="text-gray-300 leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Name and contact information (email, phone, address)</li>
                <li>Payment information (processed securely by third-party processors)</li>
                <li>Shipping address</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Automatic Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you visit our website, we automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Cookies and similar technologies (see our Cookie Policy)</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Order Fulfillment:</strong> Process and ship your purchases</li>
                <li><strong className="text-white">Communication:</strong> Respond to inquiries and provide customer support</li>
                <li><strong className="text-white">Marketing:</strong> Send newsletters and promotional emails (you can opt out anytime)</li>
                <li><strong className="text-white">Analytics:</strong> Understand how users interact with our site to improve experience</li>
                <li><strong className="text-white">Legal Compliance:</strong> Comply with legal obligations and resolve disputes</li>
                <li><strong className="text-white">Security:</strong> Protect against fraud and unauthorized access</li>
              </ul>
            </div>

            {/* How We Share Your Information */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">How We Share Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information. We may share information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Service Providers:</strong> Payment processors, shipping companies, email services (under strict confidentiality agreements)</li>
                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure. While we strive to 
                protect your data, we cannot guarantee absolute security.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">Important:</strong> We never store credit card information. 
                All payments are processed by secure, PCI-compliant third-party processors.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data</li>
                <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing emails anytime</li>
                <li><strong className="text-white">Data Portability:</strong> Receive your data in a machine-readable format</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@realityradionetwork.com" className="text-purple-400 hover:text-purple-300">
                  privacy@realityradionetwork.com
                </a>
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Cookies & Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar technologies for site functionality and analytics. 
                You can control cookies through your browser settings. For more details, see our{' '}
                <Link href="/cookies" className="text-purple-400 hover:text-purple-300">
                  Cookie Policy
                </Link>.
              </p>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Third-Party Links</h2>
              <p className="text-gray-300 leading-relaxed">
                Our website may contain links to third-party websites (e.g., Live365, social media). 
                We are not responsible for their privacy practices. Please review their policies before 
                sharing information.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not directed to children under 13. We do not knowingly collect information 
                from children. If you believe a child has provided us with personal information, please 
                contact us immediately.
              </p>
            </div>

            {/* Changes to This Policy */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. The "Last Updated" date at the top 
                indicates the latest revision. Continued use of our services after changes constitutes 
                acceptance of the updated policy.
              </p>
            </div>

            {/* Contact Us */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 mt-8 hover:border-purple-400/40 transition-colors">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-purple-400 shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Contact Us</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    If you have questions or concerns about this Privacy Policy:
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:privacy@realityradionetwork.com" className="text-purple-400 hover:text-purple-300">
                      privacy@realityradionetwork.com
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
