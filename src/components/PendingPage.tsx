import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/format';
import { Package, DollarSign, Users } from 'lucide-react';

export function PendingPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const rows = useLiveQuery(async () => {
    const txns = await db.transactions.where('userId').equals(userId).toArray();
    const map = new Map<string, { name: string; traysGiven: number; traysReturned: number; traysPending: number; amountPending: number }>();
    for (const t of txns) {
      const entry = map.get(t.customerId) ?? { name: t.customerName, traysGiven: 0, traysReturned: 0, traysPending: 0, amountPending: 0 };
      entry.traysGiven += t.traysGiven;
      entry.traysReturned += t.traysReturned;
      entry.traysPending += t.netPendingTrays;
      entry.amountPending += t.netAmountPending;
      map.set(t.customerId, entry);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [userId]);

  const totals = useLiveQuery(async () => {
    const txns = await db.transactions.where('userId').equals(userId).toArray();
    return {
      trays: txns.reduce((s, t) => s + t.netPendingTrays, 0),
      amount: txns.reduce((s, t) => s + t.netAmountPending, 0),
    };
  }, [userId]);

  const loading = rows === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Pending with Dealers &amp; Shops</h2>
        <p className="text-stone-500 text-sm mt-0.5">See who owes you trays and money.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-200 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-white/80">Total Trays to Come Back</p>
              <p className="text-2xl font-bold">{totals?.trays.toLocaleString() ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg shadow-emerald-200 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-white/80">Total Money to Collect</p>
              <p className="text-2xl font-bold">{totals ? formatCurrency(totals.amount) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
          <Users className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-stone-800">Breakdown by Customer</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : rows && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-left">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Given</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Returned</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Pending</th>
                  <th className="px-5 py-3 font-medium text-right">Amount Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-stone-800">{r.name}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{r.traysGiven}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{r.traysReturned}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">{r.traysPending}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatCurrency(r.amountPending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-stone-500 text-sm">
            No pending records. Everything is settled!
          </div>
        )}
      </div>
    </div>
  );
}
