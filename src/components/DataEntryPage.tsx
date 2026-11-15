import { useState, useMemo, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, todayISO, uid } from '@/utils/format';
import { ClipboardList, Check, Plus, UserCircle } from 'lucide-react';

export function DataEntryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const customers = useLiveQuery(
    () => db.customers.where('userId').equals(userId).toArray(),
    [userId]
  );

  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [traysGiven, setTraysGiven] = useState('');
  const [eggsPerTray, setEggsPerTray] = useState('30');
  const [currentRate, setCurrentRate] = useState('');
  const [traysReturned, setTraysReturned] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const calc = useMemo(() => {
    const tg = parseFloat(traysGiven) || 0;
    const ept = parseFloat(eggsPerTray) || 0;
    const rate = parseFloat(currentRate) || 0;
    const tr = parseFloat(traysReturned) || 0;
    const paid = parseFloat(amountPaid) || 0;

    const totalEggs = tg * ept;
    const billAmount = totalEggs * rate;
    const netPendingTrays = tg - tr;
    const netAmountPending = billAmount - paid;
    return { billAmount, netPendingTrays, netAmountPending, totalEggs };
  }, [traysGiven, eggsPerTray, currentRate, traysReturned, amountPaid]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    const customer = customers?.find((c) => c.id === customerId);
    if (!customer) {
      setError('Customer not found');
      return;
    }

    await db.transactions.add({
      id: uid(),
      userId,
      customerId,
      customerName: customer.name,
      date,
      traysGiven: parseFloat(traysGiven) || 0,
      eggsPerTray: parseFloat(eggsPerTray) || 0,
      currentRate: parseFloat(currentRate) || 0,
      traysReturned: parseFloat(traysReturned) || 0,
      amountPaid: parseFloat(amountPaid) || 0,
      billAmount: calc.billAmount,
      netPendingTrays: calc.netPendingTrays,
      netAmountPending: calc.netAmountPending,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });

    setSuccess(true);
    setTraysGiven('');
    setTraysReturned('');
    setAmountPaid('');
    setNote('');
    setCustomerId('');
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Data Entry</h2>
        <p className="text-stone-500 text-sm mt-0.5">Record a daily transaction. Totals auto-calculate as you type.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all"
            >
              <option value="">Select a customer…</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.type}</option>
              ))}
            </select>
            {customers && customers.length === 0 && (
              <p className="text-xs text-stone-400 mt-1.5 flex items-center gap-1">
                <UserCircle className="w-3.5 h-3.5" /> No customers yet — add one in the Customers tab.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Trays Given</label>
            <input type="number" step="any" value={traysGiven} onChange={(e) => setTraysGiven(e.target.value)} placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Eggs Per Tray</label>
            <input type="number" step="any" value={eggsPerTray} onChange={(e) => setEggsPerTray(e.target.value)} placeholder="30"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Current Rate (per egg)</label>
            <input type="number" step="any" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Trays Returned</label>
            <input type="number" step="any" value={traysReturned} onChange={(e) => setTraysReturned(e.target.value)} placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Amount Paid Today</label>
            <input type="number" step="any" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any extra details…"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <CalcCard label="Bill Amount" value={formatCurrency(calc.billAmount)} tone="green" />
          <CalcCard label="Net Pending Trays" value={calc.netPendingTrays.toLocaleString()} tone="blue" />
          <CalcCard label="Net Amount Pending" value={formatCurrency(calc.netAmountPending)} tone="emerald" />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4" /> Transaction saved successfully.
          </div>
        )}

        <button type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-200 hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Save Transaction
        </button>
      </form>
    </div>
  );
}

function CalcCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'blue' | 'emerald' }) {
  const tones = {
    green: 'bg-green-50 border-green-100 text-green-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
        <ClipboardList className="w-3.5 h-3.5" /> {label}
      </div>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}
