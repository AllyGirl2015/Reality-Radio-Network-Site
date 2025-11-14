import { Metadata } from 'next';
import { Cookie, Mail } from 'lucide-react';
import Section from '@/components/Section';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | Reality Radio Network',
  description: 'Learn about how Reality Radio Network uses cookies and similar tracking technologies.',
  openGraph: {
    title: 'Cookie Policy | Reality Radio Network',
    description: 'Information about our use of cookies and tracking.',
  },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <Section className="pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Cookie className="w-16 h-16 text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Cookie Policy</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            How we use cookies and similar technologies
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
            
            {/* What Are Cookies */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">What Are Cookies?</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files stored on your device (computer, tablet, or phone) when you 
                visit a website. They help websites remember your preferences, analyze traffic, and provide 
                a better user experience.
              </p>
            </div>

            {/* How We Use Cookies */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">How We Use Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Reality Radio Network uses cookies for the following purposes:
              </p>
              
              <div className="space-y-6">
                <div className="bg-black/40 border border-purple-500/30 rounded-lg p-5 hover:border-purple-400/40 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies (Required)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable core 
                    features like security, navigation, and access to secure areas.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Examples: Session management, shopping cart, authentication</p>
                </div>

                <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-5 hover:border-cyan-400/40 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies (Optional)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These help us understand how visitors interact with our website by collecting anonymous 
                    information about pages visited, time spent, and navigation patterns.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Examples: Google Analytics, page view tracking</p>
                </div>

                <div className="bg-black/40 border border-purple-500/30 rounded-lg p-5 hover:border-purple-400/40 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-2">Functional Cookies (Optional)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These cookies remember your preferences and settings to provide a personalized experience.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Examples: Language preference, volume settings for radio player</p>
                </div>

                <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-5 hover:border-cyan-400/40 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Cookies (Optional)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Used to track visitors across websites to display relevant ads and measure campaign effectiveness.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Examples: Social media pixels, advertising networks</p>
                </div>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Third-Party Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Some cookies on our site are set by third-party services we use:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Live365:</strong> Embedded radio player (streaming functionality)</li>
                <li><strong className="text-white">Google Analytics:</strong> Website traffic analysis</li>
                <li><strong className="text-white">Payment Processors:</strong> Secure checkout and fraud prevention</li>
                <li><strong className="text-white">Social Media:</strong> Share buttons and embedded content</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </div>

            {/* Managing Cookies */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Managing Cookies</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Browser Settings</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                You can control and delete cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Block all cookies</li>
                <li>Block third-party cookies only</li>
                <li>Delete cookies when you close the browser</li>
                <li>Make exceptions for specific websites</li>
              </ul>

              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">How to manage cookies in popular browsers:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong className="text-white">Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong className="text-white">Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Impact of Disabling Cookies</h3>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-purple-400">Note:</strong> Disabling cookies may affect your experience on our website. 
                Essential cookies are required for core functionality like shopping cart and secure login.
              </p>
            </div>

            {/* Do Not Track */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Do Not Track (DNT)</h2>
              <p className="text-gray-300 leading-relaxed">
                Some browsers offer a "Do Not Track" (DNT) signal. Currently, there is no industry standard 
                for responding to DNT signals. We do not track users across third-party websites for 
                advertising purposes.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Cookie Retention</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Cookies have different lifespans:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong className="text-white">Persistent Cookies:</strong> Remain for a set period (typically 1-12 months) or until manually deleted</li>
              </ul>
            </div>

            {/* Changes to This Policy */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or 
                for legal reasons. The "Last Updated" date at the top indicates the latest revision.
              </p>
            </div>

            {/* Your Consent */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Your Consent</h2>
              <p className="text-gray-300 leading-relaxed">
                By using our website, you consent to our use of cookies as described in this policy. 
                Essential cookies are used automatically for core functionality. Optional cookies require 
                your consent through our cookie banner (if applicable).
              </p>
            </div>

            {/* More Information */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">Learn More</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For more information about online privacy and cookies:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    AllAboutCookies.org
                  </a> - Comprehensive cookie information
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    YourOnlineChoices.com
                  </a> - Opt out of behavioral advertising
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 mt-8 hover:border-purple-400/40 transition-colors">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-purple-400 shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Questions About Cookies?</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    If you have questions about our use of cookies:
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:privacy@realityradionetwork.com" className="text-purple-400 hover:text-purple-300">
                      privacy@realityradionetwork.com
                    </a>
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong className="text-white">Privacy Policy:</strong>{' '}
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                      View Full Policy
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
