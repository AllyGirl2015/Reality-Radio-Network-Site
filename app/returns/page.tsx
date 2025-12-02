import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Package, Download, AlertCircle, CheckCircle, Clock, Camera, Mail } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy | Reality Radio Network',
  description: 'Our returns and refunds policy for physical and digital products. Learn about eligibility, return windows, and the refund process.',
};

export default function ReturnsPage() {
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
              Returns & Refunds Policy
            </span>
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last Updated: Sunday, November 30, 2025</p>
        </div>
      </Section>

      {/* Physical Products */}
      <Section background="solid">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8 text-purple-400" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-white">Physical Products</h2>
          </div>
          <p className="text-gray-400 mb-8">CDs, Print Items, Merchandise</p>

          <div className="space-y-8">
            {/* Eligibility */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                Eligibility
              </h3>
              <p className="text-gray-300 mb-4">A return or refund may be requested if:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The item arrived damaged, defective, or incorrect.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The item does not match the product description.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The item is returned in its original condition.
                </li>
              </ul>
            </div>

            {/* Return Window */}
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" aria-hidden="true" />
                Return Window
              </h3>
              <p className="text-gray-300">
                Requests must be submitted within <span className="text-cyan-400 font-semibold">30 days</span> of the delivery date.
              </p>
            </div>

            {/* Verification */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" aria-hidden="true" />
                Verification
              </h3>
              <p className="text-gray-300 mb-4">To process a return or refund, the customer must provide:</p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The order number
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  Photographic or video evidence of the issue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  A brief description of the problem
                </li>
              </ul>

              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                <p className="text-gray-300 text-sm">
                  <span className="text-red-400 font-semibold">RBEW reserves the right to deny a refund if:</span>
                </p>
                <ul className="space-y-1 text-gray-400 text-sm mt-2">
                  <li>• The item shows signs of misuse, neglect, or intentional damage</li>
                  <li>• The item returned does not match the item shipped</li>
                  <li>• The claim cannot be verified</li>
                </ul>
              </div>
            </div>

            {/* Return Process */}
            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Return Process</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  Once approved, the customer may be asked to return the product.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  Refunds are issued after the returned item is received and inspected, unless otherwise authorized.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  Refunds are issued to the original payment method.
                </li>
              </ul>
            </div>

            {/* Incorrect Item */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Incorrect Item Received</h3>
              <p className="text-gray-300 mb-3">In cases where RBEW accidentally ships the wrong product:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The correct item will be shipped at no additional cost.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  The customer may keep the incorrect item as a courtesy, unless RBEW requests return shipping at company expense.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Digital Products */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-8 h-8 text-cyan-400" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-white">Digital Products</h2>
          </div>
          <p className="text-gray-400 mb-8">Singles, Albums, Downloads</p>

          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
              <p className="text-yellow-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
                Digital items are non-refundable once the file or download link has been delivered.
              </p>
            </div>

            <div>
              <p className="text-gray-300 mb-3">Refunds for digital items may only be granted if:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  The item delivered does not match the product purchased
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  The download link does not function, and a corrected link cannot be provided
                </li>
              </ul>
            </div>

            <p className="text-gray-400 italic">
              Once the correct item has been delivered, the sale is considered final.
            </p>
          </div>
        </div>
      </Section>

      {/* Discretionary Exceptions */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Discretionary Exceptions</h2>
            <p className="text-gray-300 mb-4">
              RBEW may issue refunds or replacements beyond the conditions listed above at its sole discretion.
            </p>
            <p className="text-gray-400 text-sm">
              This policy does not limit any rights required by applicable law.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Need to request a return or have questions?</p>
            <Link href="/contact" className="btn-neon-purple inline-flex items-center gap-2">
              <Mail className="w-5 h-5" aria-hidden="true" />
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
