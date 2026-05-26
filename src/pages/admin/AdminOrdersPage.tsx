import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Truck, Package } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { API_BASE } from '@/lib/api';

interface OrderItem { id: number; title: string; price: number; quantity: number; category: string }
interface Order {
  id: number; order_number: string; customer_email: string; customer_name: string;
  items: string; subtotal: number; tax: number; shipping_cost: number; total: number;
  status: string; payment_intent_id: string; shipping_address: string;
  billing_address: string; created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  processing: 'bg-yellow-500/20 text-yellow-400',
  shipped: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUSES = ['all', 'processing', 'shipped', 'completed', 'cancelled'];

function formatDate(s: string) {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return s; }
}

export default function AdminOrdersPage() {
  const { token } = useAdmin();
  const headers = { Authorization: `Bearer ${token}` };

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/orders`, { headers })
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleMarkShipped(orderNumber: string) {
    setUpdating(orderNumber);
    await fetch(`${API_BASE}/api/admin/orders/${orderNumber}/status`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped' }),
    });
    setOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, status: 'shipped' } : o));
    setUpdating(null);
  }

  async function handleSetStatus(orderNumber: string, status: string) {
    setUpdating(orderNumber);
    await fetch(`${API_BASE}/api/admin/orders/${orderNumber}/status`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, status } : o));
    setUpdating(null);
  }

  const filtered = orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .filter(o => !search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_email.toLowerCase().includes(search.toLowerCase()));

  const counts: Record<string, number> = { all: orders.length };
  STATUSES.slice(1).forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order # or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors text-sm"
          />
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {s} {counts[s] ? <span className="opacity-60">({counts[s]})</span> : null}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders found.</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(o => {
                  let items: OrderItem[] = [];
                  let shippingAddr: Record<string, string> = {};
                  try { items = JSON.parse(o.items || '[]'); } catch {}
                  try { shippingAddr = JSON.parse(o.shipping_address || '{}'); } catch {}
                  const isExpanded = expanded === o.order_number;
                  const hasPhysical = items.some(i => i.category === 'physical' || i.category === 'pod');

                  return (
                    <>
                      <tr
                        key={o.order_number}
                        className="hover:bg-white/3 transition-colors cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : o.order_number)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
                            <span className="font-mono text-white font-medium text-xs">{o.order_number}</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white truncate max-w-[160px]">{o.customer_email}</p>
                          {o.customer_name && <p className="text-xs text-gray-500">{o.customer_name}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{formatDate(o.created_at)}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">${(o.total || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[o.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          {o.status === 'processing' && hasPhysical && (
                            <button
                              onClick={() => handleMarkShipped(o.order_number)}
                              disabled={updating === o.order_number}
                              className="flex items-center gap-1.5 ml-auto text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Truck className="w-3 h-3" />
                              {updating === o.order_number ? '...' : 'Mark Shipped'}
                            </button>
                          )}
                          {o.status === 'shipped' && (
                            <button
                              onClick={() => handleSetStatus(o.order_number, 'completed')}
                              disabled={updating === o.order_number}
                              className="flex items-center gap-1.5 ml-auto text-xs px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Package className="w-3 h-3" />
                              {updating === o.order_number ? '...' : 'Mark Complete'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${o.order_number}-detail`} className="bg-white/2">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              {/* Items */}
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items</p>
                                <div className="space-y-1">
                                  {items.map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                      <span className="text-gray-300">{item.title} <span className="text-gray-600">×{item.quantity}</span></span>
                                      <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-white/10 mt-2 pt-2 space-y-1 text-xs text-gray-500">
                                  <div className="flex justify-between"><span>Subtotal</span><span>${(o.subtotal || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span>Shipping</span><span>${(o.shipping_cost || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span>Tax</span><span>${(o.tax || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between font-semibold text-white"><span>Total</span><span>${(o.total || 0).toFixed(2)}</span></div>
                                </div>
                              </div>

                              {/* Shipping / Status */}
                              <div>
                                {shippingAddr.street && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ship To</p>
                                    <p className="text-gray-300">{shippingAddr.name}</p>
                                    <p className="text-gray-400 text-xs">{shippingAddr.street}</p>
                                    <p className="text-gray-400 text-xs">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zip}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {['processing', 'shipped', 'completed', 'cancelled'].map(s => (
                                      <button
                                        key={s}
                                        onClick={() => handleSetStatus(o.order_number, s)}
                                        disabled={o.status === s || updating === o.order_number}
                                        className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${o.status === s ? (STATUS_STYLES[s] || '') : 'bg-white/10 text-gray-400 hover:bg-white/20'} disabled:opacity-50`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {o.payment_intent_id && (
                                  <p className="text-xs text-gray-600 mt-3 font-mono truncate">PI: {o.payment_intent_id}</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
