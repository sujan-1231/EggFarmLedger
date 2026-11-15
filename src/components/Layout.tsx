import { useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { exportBackup, importBackup } from '@/utils/backup';
import { Download, Upload, LogOut, Egg, Check, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'entry', label: 'Data Entry' },
  { id: 'pending', label: 'Pending' },
  { id: 'customers', label: 'Customers' },
  { id: 'history', label: 'History' },
];

export function Layout({ children, activeTab, onTabChange }: Props) {
  const { user, signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleExport() {
    try {
      await exportBackup();
      showToast('success', 'Backup downloaded successfully');
    } catch {
      showToast('error', 'Could not export backup');
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importBackup(file);
      showToast('success', `Imported ${result.transactions} transactions, ${result.customers} customers`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Import failed');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Egg className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-bold text-stone-800 text-base sm:text-lg leading-none">Egg Farm Ledger</h1>
                <p className="text-xs text-stone-400 mt-0.5">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleExport}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                title="Export backup">
                <Download className="w-4 h-4" /> Backup
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                title="Import backup">
                <Upload className="w-4 h-4" /> Restore
              </button>
              <input ref={fileRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
              <button onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                title="Sign out">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop nav */}
      <nav className="hidden sm:block sticky top-16 z-20 bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'text-green-600' : 'text-stone-500 hover:text-stone-700'
                }`}>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-100 shadow-lg">
        <div className="flex">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'text-green-600' : 'text-stone-400'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex border-t border-stone-50">
          <button onClick={handleExport} className="flex-1 py-2 text-xs text-stone-500 flex items-center justify-center gap-1">
            <Download className="w-3.5 h-3.5" /> Backup
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 text-xs text-stone-500 flex items-center justify-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Restore
          </button>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
