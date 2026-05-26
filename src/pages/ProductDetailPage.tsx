import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Zap, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const API_BASE = 'https://shearsunlimitedholdingsllc.jessenshears.workers.dev';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  tag: string;
  badge: string;
  stripe_link: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setAdded(false);
    setQty(1);

    Promise.all([
      fetch(`${API_BASE}/api/products/${id}`).then(r => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      }),
      fetch(`${API_BASE}/api/products`).then(r => r.json()).catch(() => [])
    ])
      .then(([prod, all]) => {
        setProduct(prod);
        setAllProducts(Array.isArray(all) ? all : []);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({ id: product.id, title: product.title, price: product.price, image_url: product.image_url, category: product.category }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const cartQty = items.find(i => i.id === product?.id)?.quantity ?? 0;
  const related = allProducts.filter(p => p.id !== product?.id && p.category === product?.category).slice(0, 4);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="h-96 bg-white/10 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-white/10 rounded w-3/4" />
              <div className="h-6 bg-white/10 rounded w-1/4" />
              <div className="h-24 bg-white/10 rounded" />
              <div className="h-12 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-4">{error || 'Product not found'}</p>
        <Button onClick={() => navigate('/shop')} className="bg-white text-black hover:bg-gray-200">
          Back to Shop
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-300 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-square">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {product.category === 'digital' ? '💾' : product.category === 'pod' ? '👕' : '📦'}
                </div>
              )}
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 bg-white text-black text-sm font-semibold px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider capitalize">
                {product.category === 'pod' ? 'Print-on-Demand' : product.category}
              </span>
              {product.tag && <span className="ml-3 text-xs text-gray-600">{product.tag}</span>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.title}</h1>

            <div className="text-3xl font-bold text-white mb-6">${product.price.toFixed(2)}</div>

            {product.description && (
              <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Delivery info */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
              {product.category === 'digital' ? (
                <><Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Instant download after purchase</span></>
              ) : (
                <><Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Ships in 1–3 business days</span></>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-l-lg"
                >−</button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-r-lg"
                >+</button>
              </div>

              <Button
                onClick={handleAddToCart}
                className={`flex-1 py-6 text-base font-medium transition-all duration-200 ${added ? 'bg-green-600 hover:bg-green-600' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                {added ? '✓ Added to Cart' : <><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart</>}
              </Button>
            </div>

            {cartQty > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{cartQty} already in cart</span>
                <Link to="/cart" className="text-white underline hover:text-gray-300 transition-colors">View Cart →</Link>
              </div>
            )}

            {product.stripe_link && (
              <a
                href={product.stripe_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-center block w-full py-3 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                Buy directly with Stripe
              </a>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300">
                  <div className="h-36 bg-white/5">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {p.category === 'digital' ? '💾' : p.category === 'pod' ? '👕' : '📦'}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white line-clamp-2 mb-1">{p.title}</p>
                    <p className="text-sm text-gray-400">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
