import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/components/HomePage';
import { DataEntryPage } from '@/components/DataEntryPage';
import { PendingPage } from '@/components/PendingPage';
import { CustomersPage } from '@/components/CustomersPage';
import { HistoryPage } from '@/components/HistoryPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'home' && <HomePage />}
      {tab === 'entry' && <DataEntryPage />}
      {tab === 'pending' && <PendingPage />}
      {tab === 'customers' && <CustomersPage />}
      {tab === 'history' && <HistoryPage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
