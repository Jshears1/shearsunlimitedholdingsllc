import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { API_BASE } from '@/lib/api';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  tag: string;
  badge: string;
  active: number;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';
type CategoryFilter = 'all' | 'physical' | 'digital' | 'pod';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [added, setAdded] = useState<number | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('Failed to load products.'); setLoading(false); });
  }, []);

  const filtered = products
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return b.id - a.id;
    });

  function handleAddToCart(p: Product) {
    addItem({ id: p.id, title: p.title, price: p.price, image_url: p.image_url, category: p.category });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-sm text-gray-500 uppercase tracking-wider">Store</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Our <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-gray-400 text-lg">Browse our selection of physical and digital products.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={e => setCategory(e.target.value as CategoryFilter)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#1a1a1a]">All Categories</option>
              <option value="physical" className="bg-[#1a1a1a]">Physical</option>
              <option value="digital" className="bg-[#1a1a1a]">Digital</option>
              <option value="pod" className="bg-[#1a1a1a]">Print-on-Demand</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="newest" className="bg-[#1a1a1a]">Newest</option>
            <option value="price-asc" className="bg-[#1a1a1a]">Price: Low → High</option>
            <option value="price-desc" className="bg-[#1a1a1a]">Price: High → Low</option>
          </select>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-8 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No products found.</p>
            {search && <button onClick={() => setSearch('')} className="text-white underline mt-2 text-sm">Clear search</button>}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300 flex flex-col">
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="relative h-56 bg-white/5 overflow-hidden">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {p.category === 'digital' ? '💾' : p.category === 'pod' ? '👕' : '📦'}
                        </div>
                      )}
                      {p.badge && (
                        <span className="absolute top-3 left-3 bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
                          {p.badge}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded-full capitalize">
                        {p.category === 'pod' ? 'Print-on-Demand' : p.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <Link to={`/product/${p.id}`} className="block flex-1">
                      <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-gray-200 transition-colors">
                        {p.title}
                      </h3>
                      {p.tag && <p className="text-xs text-gray-500 mb-2">{p.tag}</p>}
                    </Link>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xl font-bold text-white">${p.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(p)}
                        className={`transition-all duration-200 ${added === p.id ? 'bg-green-600 hover:bg-green-600' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                        {added === p.id ? '✓ Added' : (
                          <><ShoppingCart className="w-4 h-4 mr-1" />Add</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
