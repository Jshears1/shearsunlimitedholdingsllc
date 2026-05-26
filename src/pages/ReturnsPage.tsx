import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Returns &amp; Refunds</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          {/* Quick summary cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-2xl font-bold text-white mb-1">30 Days</p>
              <p className="text-sm text-gray-400">Return window for physical products</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-2xl font-bold text-white mb-1">No Returns</p>
              <p className="text-sm text-gray-400">Digital products after download access</p>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Physical Products</h2>
            <p className="mb-3">We accept returns on physical products within <strong className="text-white">30 days</strong> of delivery. To be eligible for a return, items must be:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Unused and in their original condition</li>
              <li>In the original packaging with all included accessories</li>
              <li>Accompanied by proof of purchase (order number or receipt)</li>
            </ul>
            <p>Items that are damaged due to misuse, show signs of wear, or are missing parts are not eligible for return.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Digital Products</h2>
            <p>Due to the nature of digital goods, <strong className="text-white">all digital product sales are final</strong> once the download link has been accessed. Please review product descriptions carefully before purchasing.</p>
            <p className="mt-3">If you experience a technical issue with a digital product that prevents access or download, please contact us within 7 days of purchase and we will work to resolve it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-white">Contact us first</strong> — email <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a> with your order number and reason for return. Do not ship items back without authorization.
              </li>
              <li>
                <strong className="text-white">Receive return authorization</strong> — we'll confirm eligibility and provide a return shipping address within 2 business days.
              </li>
              <li>
                <strong className="text-white">Ship the item back</strong> — package the item securely and ship using a trackable shipping method. Return shipping costs are the responsibility of the customer unless the item was defective or incorrectly sent.
              </li>
              <li>
                <strong className="text-white">Receive your refund</strong> — once we receive and inspect the item, we'll process your refund within 5–10 business days.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Refund Processing</h2>
            <p className="mb-3">Approved refunds will be issued to the original payment method:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit/debit card refunds: 5–10 business days after approval</li>
              <li>Processing times may vary by bank or card issuer</li>
              <li>Original shipping charges are non-refundable unless the return is due to our error</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us within <strong className="text-white">7 days of delivery</strong> with your order number and photos of the damage. We will arrange a replacement or full refund at no additional cost to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Exchanges</h2>
            <p>We do not offer direct exchanges at this time. If you'd like a different item, please return the original (if eligible) and place a new order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>Questions about your return? Email us at: <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
