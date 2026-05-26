import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, LayoutDashboard, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

const navItems = [
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default function AdminLayout() {
  const { token, logout } = useAdmin();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!token) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Admin Panel</p>
        <p className="font-semibold text-white">Shears Unlimited</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <Link
          to="/admin"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === '/admin' ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname.startsWith(path) ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" /> View Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0f0f0f] border-r border-white/10 fixed inset-y-0 left-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-[#0f0f0f] border-r border-white/10 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0f0f0f]">
          <p className="font-semibold text-sm">Admin Panel</p>
          <button onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
