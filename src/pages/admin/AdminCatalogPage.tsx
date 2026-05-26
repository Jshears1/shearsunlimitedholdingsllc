import { useState, useRef } from 'react';
import { Search, Filter, Download, Plus, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { API_BASE } from '@/lib/api';

interface CatalogItem {
  sku: string;
  title: string;
  brand: string;
  upc: string;
  cost: number;
  map: number;
  sell: number;
  net: number;
  margin: number;
  weight: number;
  condition: string;
  inStock: boolean;
  image: string;
  category: string;
  hasUpc: boolean;
  isPhysical: boolean;
  hasMap: boolean;
}

interface Filters {
  keyword: string;
  brand: string;
  inStockOnly: boolean;
  hasUpcOnly: boolean;
  physicalOnly: boolean;
  mapOnly: boolean;
  minCost: string;
  maxCost: string;
  minProfit: string;
  minMargin: string;
  maxWeight: string;
}

const defaultFilters: Filters = {
  keyword: '',
  brand: '',
  inStockOnly: true,
  hasUpcOnly: false,
  physicalOnly: false,
  mapOnly: false,
  minCost: '',
  maxCost: '',
  minProfit: '',
  minMargin: '',
  maxWeight: '',
};

export default function AdminCatalogPage() {
  const { token: adminToken } = useAdmin();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(0);
  const [scrollId, setScrollId] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [scrollHistory, setScrollHistory] = useState<(string | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ ok: number; fail: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const dandhToken = useRef('DandHCatalog2026!');

  async function search(targetPage = 0, sid: string | null = null) {
    setLoading(true);
    setError('');
    setImportResults(null);
    try {
      const body: any = { ...filters };
      if (sid) body.scrollId = sid;
      const res = await fetch(`${API_BASE}/api/dandh/catalog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dandhToken.current}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setItems(data.items || []);
      setPage(targetPage);
      setScrollId(data.scrollId || null);
      setHasNext(data.hasNext || false);
      setSearched(true);
      setSelected(new Set());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    const nextPage = page + 1;
    setScrollHistory(h => { const n = [...h]; n[nextPage] = scrollId; return n; });
    search(nextPage, scrollId);
  }

  function goPrev() {
    const prevPage = page - 1;
    search(prevPage, scrollHistory[prevPage] ?? null);
  }

  function toggleSelect(sku: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.sku)));
    }
  }

  async function importSelected() {
    const toImport = items.filter(i => selected.has(i.sku));
    if (!toImport.length) return;
    setImporting(true);
    setImportResults(null);
    let ok = 0, fail = 0;
    for (const item of toImport) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            title: item.title,
            description: `Brand: ${item.brand}\nSKU: ${item.sku}${item.upc ? `\nUPC: ${item.upc}` : ''}\nCondition: ${item.condition}`,
            price: item.sell,
            category: 'physical',
            emoji: '📦',
            color: '#F5F5F5',
            tag: item.brand || '',
            badge: item.inStock ? 'In Stock' : '',
            image_url: item.image || '',
          }),
        });
        if (res.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }
    setImportResults({ ok, fail });
    setImporting(false);
    setSelected(new Set());
  }

  const f = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">D&H Catalog</h1>
          <p className="text-sm text-gray-400 mt-0.5">Search the D&H distributor catalog and import products to your store</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={importSelected}
            disabled={importing}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Import {selected.size} item{selected.size !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {importResults && (
        <div className={`rounded-lg px-4 py-3 text-sm ${importResults.fail > 0 ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300' : 'bg-green-500/10 border border-green-500/30 text-green-300'}`}>
          Imported {importResults.ok} product{importResults.ok !== 1 ? 's' : ''} successfully
          {importResults.fail > 0 && ` · ${importResults.fail} failed`}
        </div>
      )}

      {/* Search bar */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by keyword or product name…"
              value={filters.keyword}
              onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && search(0)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>
          <input
            type="text"
            placeholder="Brand"
            value={filters.brand}
            onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && search(0)}
            className="w-36 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${showFilters ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button
            onClick={() => { setScrollHistory([null]); search(0, null); }}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {showFilters && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={filters.inStockOnly} onChange={e => setFilters(f => ({ ...f, inStockOnly: e.target.checked }))} className="accent-white" />
              In stock only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={filters.hasUpcOnly} onChange={e => setFilters(f => ({ ...f, hasUpcOnly: e.target.checked }))} className="accent-white" />
              Has UPC
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={filters.physicalOnly} onChange={e => setFilters(f => ({ ...f, physicalOnly: e.target.checked }))} className="accent-white" />
              Physical items
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={filters.mapOnly} onChange={e => setFilters(f => ({ ...f, mapOnly: e.target.checked }))} className="accent-white" />
              Has MAP price
            </label>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min cost ($)</label>
              <input type="number" value={filters.minCost} onChange={e => setFilters(f => ({ ...f, minCost: e.target.value }))} placeholder="0" className="w-full bg-[#1a1a1a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max cost ($)</label>
              <input type="number" value={filters.maxCost} onChange={e => setFilters(f => ({ ...f, maxCost: e.target.value }))} placeholder="999" className="w-full bg-[#1a1a1a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min profit ($)</label>
              <input type="number" value={filters.minProfit} onChange={e => setFilters(f => ({ ...f, minProfit: e.target.value }))} placeholder="0" className="w-full bg-[#1a1a1a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min margin (%)</label>
              <input type="number" value={filters.minMargin} onChange={e => setFilters(f => ({ ...f, minMargin: e.target.value }))} placeholder="0" className="w-full bg-[#1a1a1a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{items.length} results {items.length === 200 && '(showing first 200)'}</span>
            {items.length > 0 && (
              <button onClick={toggleAll} className="text-xs text-gray-500 hover:text-white transition-colors">
                {selected.size === items.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No results found. Try a different keyword or adjust filters.</div>
          ) : (
            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 w-8"></th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">Cost</th>
                      <th className="px-4 py-3 text-right">Sell</th>
                      <th className="px-4 py-3 text-right">Profit</th>
                      <th className="px-4 py-3 text-right">Margin</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map(item => (
                      <tr
                        key={item.sku}
                        onClick={() => toggleSelect(item.sku)}
                        className={`cursor-pointer transition-colors hover:bg-white/5 ${selected.has(item.sku) ? 'bg-white/10' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.has(item.sku) ? 'bg-white border-white' : 'border-white/30'}`}>
                            {selected.has(item.sku) && <Check className="w-3 h-3 text-black" />}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt="" className="w-10 h-10 object-contain rounded bg-white/5 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate max-w-xs">{item.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.brand} · SKU {item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{f(item.cost)}</td>
                        <td className="px-4 py-3 text-right text-white tabular-nums">{f(item.sell)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={item.net >= 0 ? 'text-green-400' : 'text-red-400'}>{f(item.net)}</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${item.margin >= 20 ? 'bg-green-500/15 text-green-400' : item.margin >= 10 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>
                            {item.margin}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.inStock ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-500'}`}>
                              {item.inStock ? 'In stock' : 'Out of stock'}
                            </span>
                            {item.hasMap && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">MAP</span>}
                            {item.hasUpc && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">UPC</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {(page > 0 || hasNext) && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={goPrev}
                disabled={page === 0 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">Page {page + 1}</span>
              <button
                onClick={goNext}
                disabled={!hasNext || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-20 text-gray-600">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Enter a keyword or brand and click Search to browse the D&H catalog</p>
        </div>
      )}
    </div>
  );
}
