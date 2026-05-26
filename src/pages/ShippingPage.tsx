import { Link } from 'react-router-dom';
import { Truck, Zap, Clock, Globe } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Shipping Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          {/* Quick info cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <Clock className="w-5 h-5 text-gray-400 mb-2" />
              <p className="font-semibold text-white mb-1">1–2 Business Days</p>
              <p className="text-xs text-gray-500">Order processing time</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <Truck className="w-5 h-5 text-gray-400 mb-2" />
              <p className="font-semibold text-white mb-1">5–7 Business Days</p>
              <p className="text-xs text-gray-500">Standard US delivery</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <Zap className="w-5 h-5 text-gray-400 mb-2" />
              <p className="font-semibold text-white mb-1">Instant</p>
              <p className="text-xs text-gray-500">Digital product delivery</p>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Digital Products</h2>
            <p>Digital products are delivered instantly upon payment confirmation. Download instructions and links are sent to the email address provided at checkout. If you do not receive your download within 30 minutes of purchase, please check your spam folder and contact us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Processing Time</h2>
            <p>Physical orders are processed within <strong className="text-white">1–2 business days</strong> of payment confirmation (Monday–Friday, excluding US federal holidays). Orders placed on weekends or holidays will begin processing the next business day.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Shipping Methods &amp; Rates</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Method</th>
                    <th className="text-left px-4 py-3 font-medium">Delivery Time</th>
                    <th className="text-right px-4 py-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/3">
                    <td className="px-4 py-3 text-white">Standard Shipping</td>
                    <td className="px-4 py-3 text-gray-400">5–7 business days</td>
                    <td className="px-4 py-3 text-right text-white">$7.99</td>
                  </tr>
                  <tr className="hover:bg-white/3">
                    <td className="px-4 py-3 text-white">Digital Products</td>
                    <td className="px-4 py-3 text-gray-400">Instant download</td>
                    <td className="px-4 py-3 text-right text-green-400">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">Rates are calculated at checkout and may vary based on product weight and destination.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Delivery Estimates</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Region</th>
                    <th className="text-left px-4 py-3 font-medium">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { region: 'Continental US', time: '5–7 business days' },
                    { region: 'Alaska & Hawaii', time: '7–10 business days' },
                    { region: 'US Territories', time: '10–14 business days' },
                  ].map(r => (
                    <tr key={r.region} className="hover:bg-white/3">
                      <td className="px-4 py-3 text-white">{r.region}</td>
                      <td className="px-4 py-3 text-gray-400">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">Delivery estimates begin after order processing. Actual delivery may vary.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" /> International Shipping
            </h2>
            <p>We currently ship to select international destinations. International shipping rates and delivery times are calculated at checkout. International customers are responsible for any customs duties, taxes, or import fees imposed by their country. We are not responsible for delays caused by customs processing.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Order Tracking</h2>
            <p>Once your order ships, you will receive a shipping confirmation email with tracking information. You can use this to monitor your delivery. Allow up to 24 hours for tracking information to become active after you receive your shipping confirmation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Lost or Delayed Packages</h2>
            <p>If your package has not arrived within the estimated delivery window, please first check the tracking information. If your package appears lost or is significantly delayed, contact us at <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a> with your order number and we will work with the carrier to resolve the issue.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>Shipping questions? Email us at: <a href="mailto:info@shearsunlimitedholdings.com" className="text-white underline hover:text-gray-300">info@shearsunlimitedholdings.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/returns" className="hover:text-white transition-colors">Returns Policy</Link>
        </div>
      </div>
    </div>
  );
}
