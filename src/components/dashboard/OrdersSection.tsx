import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface OrderItem {
  id: string;
  cardName: string;
  amount: number;
  currency: string;
  email: string;
  cryptoCurrency: string;
  cryptoAmount: string;
  status: string;
  createdAt: string;
  txHash?: string;
}

export const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        const sample: OrderItem[] = [
          {
            id: 'ORD-849201',
            cardName: 'Amazon eGift Card',
            amount: 100,
            currency: 'USD',
            email: 'daisy4tucker@gmail.com',
            cryptoCurrency: 'BTC',
            cryptoAmount: '0.00112',
            status: 'Pending',
            createdAt: new Date().toISOString(),
          }
        ];
        setOrders(sample);
        localStorage.setItem('user_orders', JSON.stringify(sample));
      }
    } catch {
      setOrders([]);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>My Gift Card Orders</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track your cryptocurrency payment status, dispatch schedules, and pending order deliveries.
            </p>
          </div>
          <Link to="/gift-cards">
            <Button variant="primary" size="sm">
              Buy New Gift Card
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you purchase eGift cards with cryptocurrency, your orders and dispatch statuses will appear here.
            </p>
            <div className="pt-2">
              <Link to="/gift-cards">
                <Button variant="primary" size="sm">Explore Gift Cards</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={order.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">{order.id}</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>{order.status}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {order.cardName} — ${order.amount} {order.currency}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dispatched to: <strong className="text-slate-700 dark:text-slate-300">{order.email}</strong> • Paid via {order.cryptoAmount} {order.cryptoCurrency} ({formattedDate})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">Estimated Arrival</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">3–5 mins upon receipt</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/60">
                      Pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
