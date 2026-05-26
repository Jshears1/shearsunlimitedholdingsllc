import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>Shears Unlimited Holdings LLC ("we," "us," or "our") is committed to protecting your personal information. This Privacy Policy describes how we collect, use, and safeguard information you provide when using our website and making purchases.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Contact information:</strong> name and email address when you contact us or place an order.</li>
              <li><strong className="text-white">Shipping information:</strong> mailing address for physical product orders.</li>
              <li><strong className="text-white">Payment information:</strong> we do not store card numbers. All payment data is processed and secured by Stripe, Inc. We receive only a transaction confirmation and the last four digits of your card.</li>
              <li><strong className="text-white">Order history:</strong> details of products purchased, order amounts, and order status.</li>
              <li><strong className="text-white">Communications:</strong> messages you send via our contact form.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill your orders, including sending order confirmations and digital product delivery.</li>
              <li>Communicate with you regarding your orders and customer support requests.</li>
              <li>Improve our products, services, and website.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal information with third parties for their marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Stripe:</strong> We use Stripe to process payments. Your payment information is transmitted directly to Stripe and is subject to Stripe's Privacy Policy (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-gray-300">stripe.com/privacy</a>).</li>
              <li><strong className="text-white">Cloudflare:</strong> Our website is hosted on Cloudflare's infrastructure. Cloudflare may collect certain data as described in their Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies &amp; Local Storage</h2>
            <p>We use browser local storage to maintain your shopping cart between visits. We do not use tracking cookies or third-party advertising cookies. Our website may use essential session cookies required for secure functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Retention</h2>
            <p>We retain order records for a minimum of seven years to comply with tax and accounting requirements. Contact form submissions are retained for up to two years. You may request deletion of your personal data (excluding records required for legal compliance) by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at the email below. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <p>We implement industry-standard security measures including HTTPS encryption, secure payment processing via Stripe, and access controls on our systems. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>For privacy-related questions or requests, contact us at: <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/returns" className="hover:text-white transition-colors">Returns Policy</Link>
          <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
