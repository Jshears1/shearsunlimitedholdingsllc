import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const TAX_RATE = 0.08;
const SHIPPING_FLAT = 7.99;

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const hasPhysical = items.some(i => i.category === 'physical' || i.category === 'pod');
  const shipping = hasPhysical ? SHIPPING_FLAT : 0;
  const tax = totalPrice * TAX_RATE;
  const total = totalPrice + shipping + tax;

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag className="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
        <Button onClick={() => navigate('/shop')} className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-base">
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-gray-500 mb-10">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4 group">
                {/* Image */}
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {item.category === 'digital' ? '💾' : item.category === 'pod' ? '👕' : '📦'}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`} className="font-medium text-white hover:text-gray-300 transition-colors line-clamp-2 block mb-1">
                    {item.title}
                  </Link>
                  <span className="text-xs text-gray-500 capitalize">
                    {item.category === 'pod' ? 'Print-on-Demand' : item.category}
                  </span>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-l-lg text-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-r-lg text-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/shop" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mt-4">
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (est. 8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {!hasPhysical && (
                  <p className="text-xs text-green-400">Digital products ship free!</p>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-white text-black hover:bg-gray-200 py-6 text-base font-medium"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
