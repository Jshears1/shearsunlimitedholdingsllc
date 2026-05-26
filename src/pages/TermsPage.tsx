import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Acceptance of Terms</h2>
            <p>By accessing or using the Shears Unlimited Holdings LLC website and purchasing our products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Products and Pricing</h2>
            <p className="mb-3">We reserve the right to modify prices at any time without prior notice. All prices are listed in US dollars. We make reasonable efforts to display accurate product information; however, we do not warrant that product descriptions, pricing, or other content is error-free.</p>
            <p>We reserve the right to refuse or cancel any order at our sole discretion, including orders that appear to be fraudulent or placed in bad faith. If your order is cancelled after payment, you will receive a full refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Payment</h2>
            <p>All payments are processed securely through Stripe. By providing payment information, you represent that you are authorized to use the payment method. You agree to pay all charges incurred at the prices in effect when the charges were incurred.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Digital Products</h2>
            <p>Upon successful payment, digital products are made available for immediate download. Due to the nature of digital goods, all sales of digital products are final. Please review your order carefully before purchasing. Refunds for digital products will not be issued after the download link has been accessed, except as required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Physical Products</h2>
            <p>Physical products are subject to our <Link to="/returns" className="text-white underline hover:text-gray-300">Returns Policy</Link> and <Link to="/shipping" className="text-white underline hover:text-gray-300">Shipping Policy</Link>. Title and risk of loss for physical products pass to you upon delivery to the carrier.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Refund Policy</h2>
            <p>Physical products may be returned within 30 days of delivery for a refund, subject to the conditions in our Returns Policy. Digital products are non-refundable after the download link is accessed. For full details, please review our <Link to="/returns" className="text-white underline hover:text-gray-300">Returns Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when placing orders.</li>
              <li>You are responsible for maintaining the confidentiality of any account credentials.</li>
              <li>You agree not to use our website for any unlawful purpose or in violation of these Terms.</li>
              <li>You agree not to attempt to gain unauthorized access to any portion of our website or systems.</li>
              <li>Digital products purchased are for personal use only. Resale, redistribution, or commercial use without written permission is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Intellectual Property</h2>
            <p>All content on this website, including but not limited to text, graphics, logos, and digital products, is the property of Shears Unlimited Holdings LLC and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Disclaimer of Warranties</h2>
            <p>Our website and products are provided "as is" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that our website will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Shears Unlimited Holdings LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of our website or products. Our total liability to you for any claim shall not exceed the amount paid by you for the product giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which Shears Unlimited Holdings LLC is registered, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Continued use of our website after changes constitutes acceptance of the updated Terms. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>For questions about these Terms, contact us at: <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/returns" className="hover:text-white transition-colors">Returns Policy</Link>
          <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
