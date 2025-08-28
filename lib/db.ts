import * as SQLite from "expo-sqlite";

export type Cadence = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export type RecurringExpense = {
  id?: number;
  name: string;
  amount: number;
  cadence: Cadence;
  startsOn: string; // ISO date
  category?: string | null;
};

const DB_NAME = "recurria.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

export async function migrate(): Promise<void> {
  const db = getDb();
  await db.execAsync(
    `PRAGMA journal_mode = WAL;` +
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        cadence TEXT NOT NULL CHECK (cadence IN ('weekly','biweekly','monthly','quarterly','yearly')),
        starts_on TEXT NOT NULL,
        category TEXT
      );`
  );
}

export async function hasAnyExpenses(): Promise<boolean> {
  const db = getDb();
  const res = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM expenses"
  );
  return (res?.count ?? 0) > 0;
}

export async function seedIfEmpty(): Promise<void> {
  if (await hasAnyExpenses()) return;
  const db = getDb();
  const seed: RecurringExpense[] = [
    { name: "Spotify Premium", amount: 9.99, cadence: "monthly", startsOn: "2024-01-15", category: "music" },
    { name: "iCloud+ 200GB", amount: 2.99, cadence: "monthly", startsOn: "2023-06-03", category: "storage" },
    { name: "Netflix", amount: 15.49, cadence: "monthly", startsOn: "2022-11-22", category: "video" },
    { name: "GitHub Copilot", amount: 10, cadence: "monthly", startsOn: "2024-04-01", category: "dev" },
    { name: "Adobe Creative Cloud", amount: 54.99, cadence: "monthly", startsOn: "2021-08-12", category: "design" },
    { name: "Domain renewals", amount: 36, cadence: "yearly", startsOn: "2020-10-28", category: "web" },
    { name: "AWS Lightsail", amount: 5, cadence: "monthly", startsOn: "2023-05-10", category: "cloud" },
    { name: "Gym Membership", amount: 19.99, cadence: "weekly", startsOn: "2024-03-02", category: "health" },
    { name: "Notion Plus", amount: 8, cadence: "monthly", startsOn: "2023-02-07", category: "productivity" },
    { name: "Car Insurance", amount: 180, cadence: "quarterly", startsOn: "2024-02-15", category: "auto" },
    { name: "Xbox Game Pass", amount: 16.99, cadence: "monthly", startsOn: "2024-02-25", category: "gaming" },
    { name: "HBO Max", amount: 14.99, cadence: "monthly", startsOn: "2024-05-05", category: "video" },
    { name: "Apple Arcade", amount: 4.99, cadence: "monthly", startsOn: "2024-07-19", category: "gaming" },
  ];

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(
      "INSERT INTO expenses (name, amount, cadence, starts_on, category) VALUES (?, ?, ?, ?, ?)"
    );
    try {
      for (const e of seed) {
        await stmt.executeAsync([
          e.name,
          e.amount,
          e.cadence,
          e.startsOn,
          e.category ?? null,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

export async function listExpenses(): Promise<RecurringExpense[]> {
  const db = getDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    amount: number;
    cadence: Cadence;
    starts_on: string;
    category: string | null;
  }>("SELECT id, name, amount, cadence, starts_on, category FROM expenses");

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: r.amount,
    cadence: r.cadence,
    startsOn: r.starts_on,
    category: r.category,
  }));
}

export async function addExpense(expense: RecurringExpense): Promise<number> {
  const db = getDb();
  const res = await db.runAsync(
    "INSERT INTO expenses (name, amount, cadence, starts_on, category) VALUES (?, ?, ?, ?, ?)",
    expense.name,
    expense.amount,
    expense.cadence,
    expense.startsOn,
    expense.category ?? null
  );
  return res.lastInsertRowId ?? 0;
}

export async function clearAll(): Promise<void> {
  const db = getDb();
  await db.execAsync("DELETE FROM expenses");
}


