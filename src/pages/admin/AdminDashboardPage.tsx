import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { API_BASE } from '@/lib/api';

interface Product { id: number; title: string; active: number; category: string; price: number }
interface Order { id: number; order_number: string; customer_email: string; total: number; status: string; created_at: string; items: string }

export default function AdminDashboardPage() {
  const { token } = useAdmin();
  const headers = { Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/products`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/orders`, { headers }).then(r => r.json()),
    ]).then(([p, o]) => {
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeProducts = products.filter(p => p.active);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const processingOrders = orders.filter(o => o.status === 'processing');
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: 'Active Products', value: activeProducts.length, icon: Package, sub: `${products.length} total`, link: '/admin/products' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, sub: `${processingOrders.length} processing`, link: '/admin/orders' },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, sub: 'All time', link: '/admin/orders' },
    { label: 'Avg Order Value', value: orders.length ? `$${(totalRevenue / orders.length).toFixed(2)}` : '$0', icon: TrendingUp, sub: 'Per order', link: '/admin/orders' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back</p>
        </div>
        <Link to="/admin/products/new" className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, sub, link }) => (
          <Link key={label} to={link} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map(o => {
              let itemCount = 0;
              try { itemCount = JSON.parse(o.items || '[]').reduce((s: number, i: { quantity: number }) => s + i.quantity, 0); } catch {}
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white font-mono">{o.order_number}</p>
                    <p className="text-xs text-gray-500">{o.customer_email} · {itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${(o.total || 0).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' : o.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/admin/products/new" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors text-center">
          <Package className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">Add Product</p>
          <p className="text-xs text-gray-500 mt-0.5">Create a new listing</p>
        </Link>
        <Link to="/admin/orders" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors text-center">
          <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">View Orders</p>
          <p className="text-xs text-gray-500 mt-0.5">Manage & fulfill</p>
        </Link>
      </div>
    </div>
  );
}
