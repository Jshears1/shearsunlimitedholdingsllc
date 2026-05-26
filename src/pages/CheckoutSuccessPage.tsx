import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Package, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const API_BASE = 'https://shearsunlimitedholdingsllc.jessenshears.workers.dev';

interface OrderItem { id: number; title: string; price: number; quantity: number; category: string }

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const piId = params.get('payment_intent');
    const status = params.get('redirect_status');

    if (!piId) { navigate('/shop'); return; }
    if (status && status !== 'succeeded') { navigate('/checkout/cancel'); return; }

    const savedItems: OrderItem[] = JSON.parse(sessionStorage.getItem('checkout_items') || '[]');
    const savedShipping = JSON.parse(sessionStorage.getItem('checkout_shipping') || '{}');
    const savedBilling = JSON.parse(sessionStorage.getItem('checkout_billing') || '{}');

    setItems(savedItems);
    setEmail(savedShipping.email || '');

    fetch(`${API_BASE}/api/checkout/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: piId,
        items: savedItems,
        shipping: savedShipping,
        billing: savedBilling,
        email: savedShipping.email || '',
        name: savedShipping.name || '',
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.order_number) {
          setOrderNumber(data.order_number);
          clearCart();
          sessionStorage.removeItem('checkout_items');
          sessionStorage.removeItem('checkout_shipping');
          sessionStorage.removeItem('checkout_billing');
        } else {
          setError(data.error || 'Could not retrieve order details.');
        }
        setLoading(false);
      })
      .catch(() => { setError('Could not retrieve order details.'); setLoading(false); });
  }, []);

  const digitalItems = items.filter(i => i.category === 'digital');
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center px-4">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <p className="text-gray-500 text-sm mb-6">Your payment may have succeeded — please check your email for confirmation.</p>
        <Link to="/shop"><Button className="bg-white text-black hover:bg-gray-200">Continue Shopping</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-lg w-full mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-400">Thank you for your purchase.</p>
        </div>

        {orderNumber && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-2xl font-bold font-mono text-white">{orderNumber}</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-gray-400">{i.title} <span className="text-gray-600">×{i.quantity}</span></span>
                  <span className="text-white">${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {digitalItems.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Digital Downloads</span>
            </div>
            <p className="text-sm text-gray-300">Your download links have been sent to <strong>{email}</strong>. Check your inbox.</p>
          </div>
        )}

        {email && (
          <p className="text-sm text-gray-500 text-center mb-8">
            Confirmation sent to <span className="text-gray-300">{email}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="w-full sm:w-auto">
            <Button className="bg-white text-black hover:bg-gray-200 w-full px-8">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
