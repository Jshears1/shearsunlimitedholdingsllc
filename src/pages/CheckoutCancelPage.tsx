import { Link } from 'react-router-dom';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8">
          Your payment was cancelled and no charges were made. Your cart items are still saved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/cart" className="w-full sm:w-auto">
            <Button className="bg-white text-black hover:bg-gray-200 w-full px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Cart
            </Button>
          </Link>
          <Link to="/shop" className="w-full sm:w-auto">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full px-8">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
