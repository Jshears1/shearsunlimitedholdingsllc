import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/context/AdminContext';
import { API_BASE, imgUrl } from '@/lib/api';

interface ProductForm {
  title: string; description: string; price: string; category: string;
  emoji: string; color: string; tag: string; badge: string;
  stripe_link: string; paypal_link: string; image_url: string; active: boolean;
}

interface ProductRecord {
  id: number; title: string; description: string; price: number; category: string;
  emoji: string; color: string; tag: string; badge: string;
  stripe_link: string; paypal_link: string; image_url: string; active: number;
}

const defaults: ProductForm = {
  title: '', description: '', price: '', category: 'physical',
  emoji: '📦', color: '#F5F5F5', tag: '', badge: '',
  stripe_link: '', paypal_link: '', image_url: '', active: true,
};

const EMOJI_DEFAULTS: Record<string, string> = { physical: '📦', digital: '💾', pod: '👕' };

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { token } = useAdmin();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>({ ...defaults });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    fetch(`${API_BASE}/api/admin/products`, { headers })
      .then(r => r.json())
      .then((products: ProductRecord[]) => {
        const p = products.find(x => x.id === parseInt(id!));
        if (p) setForm({
          title: p.title || '', description: p.description || '',
          price: String(p.price || ''), category: p.category || 'physical',
          emoji: p.emoji || '📦', color: p.color || '#F5F5F5',
          tag: p.tag || '', badge: p.badge || '',
          stripe_link: p.stripe_link || '', paypal_link: p.paypal_link || '',
          image_url: p.image_url || '', active: !!p.active,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function set(k: keyof ProductForm, v: string | boolean) {
    setForm(f => ({
      ...f,
      [k]: v,
      ...(k === 'category' ? { emoji: EMOJI_DEFAULTS[v as string] || '📦' } : {}),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Only JPG, PNG, WebP, or GIF images allowed.'); return;
    }
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload-image`, { method: 'POST', headers, body: fd });
      const data = await res.json();
      if (data.url) set('image_url', `${API_BASE}${data.url}`);
      else setError('Upload failed.');
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.price || parseFloat(form.price) < 0) { setError('Enter a valid price.'); return; }
    setSaving(true);
    setError('');

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      emoji: form.emoji || EMOJI_DEFAULTS[form.category] || '📦',
      color: form.color,
      tag: form.tag.trim(),
      badge: form.badge.trim(),
      stripe_link: form.stripe_link.trim(),
      paypal_link: form.paypal_link.trim(),
      image_url: form.image_url.trim(),
      active: form.active ? 1 : 0,
    };

    try {
      const url = isEdit ? `${API_BASE}/api/admin/products/${id}` : `${API_BASE}/api/admin/products`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success || data.id) {
        navigate('/admin/products');
      } else {
        setError(data.error || 'Failed to save product.');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors text-sm";

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={cls} placeholder="Product name" required maxLength={200} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className={cls + " resize-none"} rows={4} placeholder="Product description..." maxLength={2000} />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Price ($) *</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={cls} placeholder="0.00" min="0" step="0.01" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={cls + " appearance-none cursor-pointer"}>
              <option value="physical" className="bg-[#1a1a1a]">Physical</option>
              <option value="digital" className="bg-[#1a1a1a]">Digital</option>
              <option value="pod" className="bg-[#1a1a1a]">Print-on-Demand</option>
            </select>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Product Image</label>
          {imgUrl(form.image_url) && (
            <div className="relative w-24 h-24 mb-3 rounded-lg overflow-hidden bg-white/10">
              <img src={imgUrl(form.image_url)} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => set('image_url', '')} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-red-500 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={form.image_url} onChange={e => set('image_url', e.target.value)} className={cls + " flex-1"} placeholder="https://... or upload below" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Tag + Badge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tag <span className="text-gray-600">(shown under title)</span></label>
            <input type="text" value={form.tag} onChange={e => set('tag', e.target.value)} className={cls} placeholder="e.g. Print-on-Demand" maxLength={100} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Badge <span className="text-gray-600">(overlay label)</span></label>
            <input type="text" value={form.badge} onChange={e => set('badge', e.target.value)} className={cls} placeholder="e.g. New, Sale" maxLength={30} />
          </div>
        </div>

        {/* Emoji + Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Emoji <span className="text-gray-600">(fallback icon)</span></label>
            <input type="text" value={form.emoji} onChange={e => set('emoji', e.target.value)} className={cls} placeholder="📦" maxLength={4} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="h-10 w-14 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
              <input type="text" value={form.color} onChange={e => set('color', e.target.value)} className={cls + " flex-1"} placeholder="#F5F5F5" />
            </div>
          </div>
        </div>

        {/* Stripe + PayPal links */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Stripe Direct Link <span className="text-gray-600">(optional)</span></label>
            <input type="url" value={form.stripe_link} onChange={e => set('stripe_link', e.target.value)} className={cls} placeholder="https://buy.stripe.com/..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">PayPal Link <span className="text-gray-600">(optional)</span></label>
            <input type="url" value={form.paypal_link} onChange={e => set('paypal_link', e.target.value)} className={cls} placeholder="https://paypal.me/..." />
          </div>
        </div>

        {/* Active */}
        <div
          className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer select-none"
          onClick={() => set('active', !form.active)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.active ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
            {form.active && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <div>
            <p className="text-white font-medium text-sm">Active</p>
            <p className="text-gray-500 text-xs">Visible on the shop page</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="border-white/20 text-white hover:bg-white/10 flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-white text-black hover:bg-gray-200 flex-1">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
