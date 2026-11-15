import { db, type UserRecord, type CustomerRecord, type TransactionRecord } from '@/db/database';

export interface BackupData {
  app: 'EggFarmLedger';
  version: number;
  exportedAt: string;
  users: UserRecord[];
  customers: CustomerRecord[];
  transactions: TransactionRecord[];
}

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    app: 'EggFarmLedger',
    version: 1,
    exportedAt: new Date().toISOString(),
    users: await db.users.toArray(),
    customers: await db.customers.toArray(),
    transactions: await db.transactions.toArray(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `egg-farm-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<{ users: number; customers: number; transactions: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupData;

  if (data.app !== 'EggFarmLedger') {
    throw new Error('This file is not an Egg Farm Ledger backup');
  }

  if (!Array.isArray(data.users) || !Array.isArray(data.customers) || !Array.isArray(data.transactions)) {
    throw new Error('Backup file is corrupted or incomplete');
  }

  await db.transaction('rw', db.users, db.customers, db.transactions, async () => {
    for (const u of data.users) {
      const existing = await db.users.get(u.id);
      if (!existing) await db.users.put(u);
    }
    for (const c of data.customers) {
      const existing = await db.customers.get(c.id);
      if (!existing) await db.customers.put(c);
    }
    for (const t of data.transactions) {
      const existing = await db.transactions.get(t.id);
      if (!existing) await db.transactions.put(t);
    }
  });

  return {
    users: data.users.length,
    customers: data.customers.length,
    transactions: data.transactions.length,
  };
}
