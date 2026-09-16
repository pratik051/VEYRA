import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 py-8 px-4 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Catalog & Marketplace Products</h1>
        <p className="text-xs text-neutral-400">Explore items sourced directly from top Indian stores.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading catalog items...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 space-y-4">
          <p>No catalog products listed yet.</p>
          <Link to="/request-product" className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs">
            🇮🇳 Request Any Custom Product Link
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id || p.slug} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <img src={p.image || 'https://via.placeholder.com/300'} alt={p.name} className="w-full h-48 object-cover rounded-xl" />
              <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
              <div className="text-amber-400 font-extrabold text-sm">NPR Rs. {p.price}</div>
              <Link to={`/product/${p.slug}`} className="block text-center py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
