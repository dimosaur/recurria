import * as SQLite from "expo-sqlite";

export type Cadence = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export type RecurringExpense = {
  id?: number;
  name: string;
  amount: number;
  cadence: Cadence;
  startsOn: string; // ISO date
  category?: string | null;
  paused?: boolean;
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
        category TEXT,
        paused INTEGER NOT NULL DEFAULT 0
      );`
  );
  const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(expenses)");
  const hasPaused = cols?.some((c) => c.name === "paused");
  if (!hasPaused) {
    await db.execAsync("ALTER TABLE expenses ADD COLUMN paused INTEGER NOT NULL DEFAULT 0");
  }
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
      "INSERT INTO expenses (name, amount, cadence, starts_on, category, paused) VALUES (?, ?, ?, ?, ?, 0)"
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
    paused: number;
  }>("SELECT id, name, amount, cadence, starts_on, category, paused FROM expenses");

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: r.amount,
    cadence: r.cadence,
    startsOn: r.starts_on,
    category: r.category,
    paused: !!r.paused,
  }));
}

export async function addExpense(expense: RecurringExpense): Promise<number> {
  const db = getDb();
  const res = await db.runAsync(
    "INSERT INTO expenses (name, amount, cadence, starts_on, category, paused) VALUES (?, ?, ?, ?, ?, ?)",
    expense.name,
    expense.amount,
    expense.cadence,
    expense.startsOn,
    expense.category ?? null,
    expense.paused ? 1 : 0
  );
  return res.lastInsertRowId ?? 0;
}

export async function updateExpense(id: number, update: Partial<RecurringExpense>): Promise<void> {
  const db = getDb();
  const fields: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];
  if (update.name !== undefined) { fields.push("name = ?"); values.push(update.name); }
  if (update.amount !== undefined) { fields.push("amount = ?"); values.push(update.amount); }
  if (update.cadence !== undefined) { fields.push("cadence = ?"); values.push(update.cadence); }
  if (update.startsOn !== undefined) { fields.push("starts_on = ?"); values.push(update.startsOn); }
  if (update.category !== undefined) { fields.push("category = ?"); values.push(update.category ?? null); }
  if (update.paused !== undefined) { fields.push("paused = ?"); values.push(update.paused ? 1 : 0); }
  if (fields.length === 0) return;
  values.push(id);
  const sql = `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`;
  await db.runAsync(sql, ...values);
}

export async function deleteExpense(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync("DELETE FROM expenses WHERE id = ?", id);
}

export async function clearAll(): Promise<void> {
  const db = getDb();
  await db.execAsync("DELETE FROM expenses");
}


