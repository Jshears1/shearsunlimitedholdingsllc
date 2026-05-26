import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/context/AdminContext';
import { API_BASE, imgUrl } from '@/lib/api';

interface Product {
  id: number; title: string; description: string; price: number;
  category: string; image_url: string; tag: string; badge: string;
  stripe_link: string; paypal_link: string; emoji: string; color: string; active: number;
}

const CATEGORY_LABELS: Record<string, string> = { physical: 'Physical', digital: 'Digital', pod: 'Print-on-Demand' };

export default function AdminProductsPage() {
  const { token } = useAdmin();
  const headers = { Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  function load() {
    fetch(`${API_BASE}/api/admin/products`, { headers })
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    await fetch(`${API_BASE}/api/admin/products/${p.id}`, { method: 'DELETE', headers });
    setProducts(prev => prev.filter(x => x.id !== p.id));
    setDeleting(null);
  }

  async function handleToggleActive(p: Product) {
    setToggling(p.id);
    await fetch(`${API_BASE}/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, active: p.active ? 0 : 1 }),
    });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: x.active ? 0 : 1 } : x));
    setToggling(null);
  }

  const filtered = products.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total · {products.filter(p => p.active).length} active</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="bg-white text-black hover:bg-gray-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {search ? 'No products match your search.' : 'No products yet.'}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/3 transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          {imgUrl(p.image_url) ? (
                            <img src={imgUrl(p.image_url)} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">{p.emoji || '📦'}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-xs">{p.title}</p>
                          {p.badge && <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{p.badge}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                        {CATEGORY_LABELS[p.category] || p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right font-medium text-white">${p.price.toFixed(2)}</td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={toggling === p.id}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          p.active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                        title={p.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {toggling === p.id ? '...' : p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/shop`}
                          target="_blank"
                          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                          title="View on site"
                        >
                          {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Link>
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
