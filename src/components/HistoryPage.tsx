import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type TransactionRecord } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { History, Trash2, Search, Filter } from 'lucide-react';

export function HistoryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const allTxns = useLiveQuery(
    () => db.transactions.where('userId').equals(userId).reverse().sortBy('date'),
    [userId]
  );

  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const filtered = useMemo(() => {
    if (!allTxns) return [];
    return allTxns.filter((t) => {
      const matchesSearch =
        !search ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(search.toLowerCase()));
      const matchesMonth = !filterMonth || t.date.slice(0, 7) === filterMonth;
      return matchesSearch && matchesMonth;
    });
  }, [allTxns, search, filterMonth]);

  async function handleDelete(id: string) {
    await db.transactions.delete(id);
  }

  const loading = allTxns === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">History</h2>
        <p className="text-stone-500 text-sm mt-0.5">Full audit log of every transaction recorded.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or note…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-stone-800">All Transactions</h3>
          </div>
          <span className="text-xs text-stone-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-left">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Given</th>
                  <th className="px-5 py-3 font-medium text-right">Rate</th>
                  <th className="px-5 py-3 font-medium text-right">Bill Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Trays Ret.</th>
                  <th className="px-5 py-3 font-medium text-right">Amount Paid</th>
                  <th className="px-5 py-3 font-medium text-right">Pending Trays</th>
                  <th className="px-5 py-3 font-medium text-right">Pending Amt.</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((t: TransactionRecord) => (
                  <tr key={t.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-5 py-3 font-medium text-stone-800">
                      {t.customerName}
                      {t.note && <p className="text-xs text-stone-400 mt-0.5">{t.note}</p>}
                    </td>
                    <td className="px-5 py-3 text-right text-stone-600">{t.traysGiven}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{formatCurrency(t.currentRate)}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{formatCurrency(t.billAmount)}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{t.traysReturned}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{formatCurrency(t.amountPaid)}</td>
                    <td className="px-5 py-3 text-right font-medium text-green-600">{t.netPendingTrays}</td>
                    <td className="px-5 py-3 text-right font-medium text-emerald-600">{formatCurrency(t.netAmountPending)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(t.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-stone-500 text-sm">
            No transactions found{search || filterMonth ? ' for your filters' : ' yet'}.
          </div>
        )}
      </div>
    </div>
  );
}
