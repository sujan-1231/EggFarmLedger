import { useState, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { uid } from '@/utils/format';
import { Plus, Trash2, Phone, Store, User, UserPlus, Check } from 'lucide-react';

export function CustomersPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const customers = useLiveQuery(
    () => db.customers.where('userId').equals(userId).toArray(),
    [userId]
  );

  const [name, setName] = useState('');
  const [type, setType] = useState('Dealer');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    await db.customers.add({
      id: uid(),
      userId,
      name: name.trim(),
      type: type.trim() || 'Dealer',
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    });
    setName('');
    setPhone('');
    setType('Dealer');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleDelete(id: string) {
    await db.customers.delete(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Customers</h2>
        <p className="text-stone-500 text-sm mt-0.5">Add and manage your dealer and shop profiles.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 sm:p-6">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-500" /> Add New Customer
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all">
              <option value="Dealer">Dealer</option>
              <option value="Shop">Shop</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Retailer">Retailer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all" />
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2"><Check className="w-4 h-4" /> Customer added.</div>}

        <button type="submit"
          className="mt-4 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-200 hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Saved Customers</h3>
        </div>
        {customers && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-left">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium text-stone-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        <Store className="w-3 h-3" /> {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {c.phone ? (
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-400" /> {c.phone}</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-stone-500 text-sm">
            No customers yet. Add your first one above.
          </div>
        )}
      </div>
    </div>
  );
}
