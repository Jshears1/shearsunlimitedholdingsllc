import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';

const API_BASE = 'https://shearsunlimitedholdingsllc.jessenshears.workers.dev';

type Address = { name: string; email: string; street: string; city: string; state: string; zip: string; country: string };
const blank: Address = { name: '', email: '', street: '', city: '', state: 'AL', zip: '', country: 'US' };
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

// ── Order Summary ──────────────────────────────────────────────────────────────
function OrderSummary({ subtotal, shipping, tax, total, items }: { subtotal: number; shipping: number; tax: number; total: number; items: CartItem[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
      <h3 className="font-semibold text-white mb-4">Order Summary</h3>
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {items.map(i => (
          <div key={i.id} className="flex justify-between text-sm">
            <span className="text-gray-400 truncate flex-1 mr-2">{i.title} <span className="text-gray-600">×{i.quantity}</span></span>
            <span className="text-white flex-shrink-0">${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 space-y-2">
        <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Shipping</span>
          <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

// ── Address Form ───────────────────────────────────────────────────────────────
function AddressForm({ value, onChange, showEmail = true, title }: { value: Address; onChange: (v: Address) => void; showEmail?: boolean; title: string }) {
  const f = (k: keyof Address, v: string) => onChange({ ...value, [k]: v });
  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors";
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
          <input type="text" value={value.name} onChange={e => f('name', e.target.value)} className={cls} placeholder="John Doe" required maxLength={100} />
        </div>
        {showEmail && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email *</label>
            <input type="email" value={value.email} onChange={e => f('email', e.target.value)} className={cls} placeholder="john@example.com" required maxLength={254} />
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
          <input type="text" value={value.street} onChange={e => f('street', e.target.value)} className={cls} placeholder="123 Main St" required maxLength={200} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">City *</label>
            <input type="text" value={value.city} onChange={e => f('city', e.target.value)} className={cls} placeholder="New York" required maxLength={100} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">State *</label>
            <select value={value.state} onChange={e => f('state', e.target.value)} className={cls + " appearance-none cursor-pointer"} required>
              {US_STATES.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">ZIP Code *</label>
            <input type="text" value={value.zip} onChange={e => f('zip', e.target.value.replace(/\D/g, '').slice(0, 5))} className={cls} placeholder="10001" required pattern="\d{5}" maxLength={5} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Country</label>
            <input type="text" value="United States" disabled className={cls + " opacity-50 cursor-not-allowed"} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment Form (inside Elements) ────────────────────────────────────────────
function PaymentForm({ onBack, onSuccess, total }: { onBack: () => void; onSuccess: (piId: string) => void; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setPaying(false);
    } else if (paymentIntent) {
      onSuccess(paymentIntent.id);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={paying} className="border-white/20 text-white hover:bg-white/10 flex-1">
          ← Back
        </Button>
        <Button type="submit" disabled={!stripe || paying} className="bg-white text-black hover:bg-gray-200 flex-1 py-4">
          {paying
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</span>
            : <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Pay ${total.toFixed(2)}</span>}
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Secured by Stripe. Your card details are never stored.
      </p>
    </form>
  );
}

// ── Main Checkout Page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<Address>({ ...blank });
  const [billing, setBilling] = useState<Address>({ ...blank });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const hasPhysical = items.some(i => i.category === 'physical' || i.category === 'pod');
  const stepLabels = hasPhysical ? ['Shipping', 'Billing', 'Payment'] : ['Contact', 'Payment'];
  const maxStep = stepLabels.length;

  useEffect(() => {
    if (items.length === 0) { navigate('/cart'); return; }
    fetch(`${API_BASE}/api/stripe/config`)
      .then(r => r.json())
      .then(d => { if (d.publishableKey) setStripePromise(loadStripe(d.publishableKey)); })
      .catch(() => {});
    const sub = totalPrice;
    const sh = hasPhysical ? 7.99 : 0;
    const tx = +(sub * 0.08).toFixed(2);
    setTotals({ subtotal: sub, tax: tx, shipping: sh, total: +(sub + sh + tx).toFixed(2) });
  }, []);

  async function createSession() {
    setSessionLoading(true);
    setSessionError('');
    const billAddr = sameAsShipping ? { ...shipping } : billing;
    try {
      const res = await fetch(`${API_BASE}/api/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, category: i.category })),
          email: shipping.email,
          name: shipping.name,
          shipping: hasPhysical ? shipping : null,
          billing: billAddr,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to create payment session');
      setClientSecret(data.clientSecret);
      setTotals({ subtotal: data.subtotal, tax: data.tax, shipping: data.shippingCost, total: data.total });
      sessionStorage.setItem('checkout_shipping', JSON.stringify(shipping));
      sessionStorage.setItem('checkout_billing', JSON.stringify(billAddr));
      sessionStorage.setItem('checkout_items', JSON.stringify(items));
      setStep(maxStep);
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSessionLoading(false);
    }
  }

  function handlePaymentSuccess(piId: string) {
    clearCart();
    sessionStorage.removeItem('checkout_items');
    sessionStorage.removeItem('checkout_shipping');
    sessionStorage.removeItem('checkout_billing');
    navigate(`/checkout/success?payment_intent=${piId}&redirect_status=succeeded`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/cart" className="text-gray-400 hover:text-white transition-colors text-sm">← Back to Cart</Link>
          <h1 className="text-4xl font-bold mt-3">Checkout</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {stepLabels.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-green-400' : 'text-gray-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${active ? 'bg-white text-black border-white' : done ? 'bg-green-500/20 border-green-400 text-green-400' : 'border-white/20'}`}>
                    {done ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
                {i < stepLabels.length - 1 && <ChevronRight className="w-4 h-4 text-gray-600 mx-2" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">

            {/* Step 1: Contact / Shipping */}
            {step === 1 && (
              <form onSubmit={e => { e.preventDefault(); hasPhysical ? setStep(2) : createSession(); }}>
                <AddressForm value={shipping} onChange={setShipping} showEmail title={hasPhysical ? 'Shipping Address' : 'Contact Information'} />
                {sessionError && <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{sessionError}</p>}
                <Button type="submit" disabled={sessionLoading} className="w-full bg-white text-black hover:bg-gray-200 mt-6 py-4">
                  {sessionLoading ? 'Loading...' : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
            )}

            {/* Step 2: Billing (physical only) */}
            {step === 2 && hasPhysical && (
              <div>
                <div
                  className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer select-none"
                  onClick={() => setSameAsShipping(s => !s)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sameAsShipping ? 'bg-white border-white' : 'border-white/30'}`}>
                    {sameAsShipping && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <span className="text-white font-medium">Billing address same as shipping</span>
                </div>
                {!sameAsShipping && <AddressForm value={billing} onChange={setBilling} showEmail={false} title="Billing Address" />}
                {sessionError && <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{sessionError}</p>}
                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-white/20 text-white hover:bg-white/10 flex-1">← Back</Button>
                  <Button type="button" onClick={createSession} disabled={sessionLoading} className="bg-white text-black hover:bg-gray-200 flex-1 py-4">
                    {sessionLoading ? 'Loading...' : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Payment */}
            {step === maxStep && (
              !clientSecret || !stripePromise ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#ffffff', colorBackground: '#1a1a1a', borderRadius: '8px' } } }}>
                  <PaymentForm
                    onBack={() => setStep(hasPhysical ? 2 : 1)}
                    onSuccess={handlePaymentSuccess}
                    total={totals.total}
                  />
                </Elements>
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary {...totals} items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}
