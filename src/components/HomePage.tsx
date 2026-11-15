import { useLiveQuery } from 'dexie-react-hooks';
import { db, type TransactionRecord } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { Receipt, ArrowRight, Package, DollarSign, Undo2, Wallet } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const transactions = useLiveQuery(
    () =>
      db.transactions
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('date')
        .then((rows) => rows.slice(0, 12)),
    [userId]
  );

  const summary = useLiveQuery(async () => {
    const all = await db.transactions.where('userId').equals(userId).toArray();
    const totalTraysPending = all.reduce((sum, t) => sum + t.netPendingTrays, 0);
    const totalAmountPending = all.reduce((sum, t) => sum + t.netAmountPending, 0);
    return { totalTraysPending, totalAmountPending };
  }, [userId]);

  const loading = transactions === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Dashboard</h2>
        <p className="text-stone-500 text-sm mt-0.5">Overview of your farm activity at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Trays Pending Return</p>
              <p className="text-2xl font-bold text-stone-800">
                {summary?.totalTraysPending.toLocaleString() ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Amount Pending</p>
              <p className="text-2xl font-bold text-stone-800">
                {summary ? formatCurrency(summary.totalAmountPending) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
          <Receipt className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-stone-800">Recent Entries</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-left">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Given</th>
                  <th className="px-5 py-3 font-medium text-right">Bill Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Returned</th>
                  <th className="px-5 py-3 font-medium text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {transactions.map((t: TransactionRecord) => (
                  <tr key={t.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-5 py-3 font-medium text-stone-800">{t.customerName}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{t.traysGiven}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{formatCurrency(t.billAmount)}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{t.traysReturned}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{formatCurrency(t.amountPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 mb-3">
              <ArrowRight className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-stone-500 text-sm">No entries yet. Go to the Data Entry tab to add your first transaction.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard icon={<Package className="w-4 h-4" />} label="Trays Given" value={transactions ? transactions.reduce((s, t) => s + t.traysGiven, 0).toString() : '—'} />
        <InfoCard icon={<Undo2 className="w-4 h-4" />} label="Trays Returned" value={transactions ? transactions.reduce((s, t) => s + t.traysReturned, 0).toString() : '—'} />
        <InfoCard icon={<Wallet className="w-4 h-4" />} label="Amount Collected" value={transactions ? formatCurrency(transactions.reduce((s, t) => s + t.amountPaid, 0)) : '—'} />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="font-semibold text-stone-800 text-sm">{value}</p>
      </div>
    </div>
  );
}
