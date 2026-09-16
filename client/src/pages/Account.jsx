import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('sajilomarts_session');
    fetch(`${API_URL}/api/india-order/my-orders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
        <p className="text-xs text-neutral-400">You need to log in to view your orders and profile.</p>
        <Link to="/login" className="inline-block px-6 py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">{user.fullName}</h1>
          <p className="text-xs text-neutral-400">{user.email} • {user.phone}</p>
        </div>
        <div className="flex gap-2">
          {user.role === 'admin' && (
            <Link to="/admin" className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-xl text-xs">
              ⚡ Admin Panel
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">My Sourcing Orders</h2>
        {loading ? (
          <div className="text-xs text-neutral-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <p className="text-xs text-neutral-400">You haven't placed any sourcing orders yet.</p>
            <Link to="/request-product" className="inline-block px-5 py-2.5 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs">
              🇮🇳 Source First Product Link
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.orderId} className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-400">{o.orderId}</div>
                  <div className="text-sm font-extrabold text-white">{o.productName}</div>
                  <div className="text-xs text-neutral-400">{o.deliveryAddress}</div>
                </div>
                <div className="sm:text-right space-y-1">
                  <div className="text-xs font-black text-white">NPR Rs. {o.finalAmountNPR}</div>
                  <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold">
                    {o.orderStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
