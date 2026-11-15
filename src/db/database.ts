import Dexie, { type Table } from 'dexie';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  userId: string;
  name: string;
  type: string;
  phone: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  date: string;
  traysGiven: number;
  eggsPerTray: number;
  currentRate: number;
  traysReturned: number;
  amountPaid: number;
  billAmount: number;
  netPendingTrays: number;
  netAmountPending: number;
  note: string;
  createdAt: string;
}

export interface MetaRecord {
  key: string;
  value: string;
}

class EggFarmDatabase extends Dexie {
  users!: Table<UserRecord, string>;
  customers!: Table<CustomerRecord, string>;
  transactions!: Table<TransactionRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('EggFarmLedgerDB');
    this.version(1).stores({
      users: 'id, &username',
      customers: 'id, userId, name, type',
      transactions: 'id, userId, customerId, date',
      meta: 'key',
    });
  }
}

export const db = new EggFarmDatabase();
