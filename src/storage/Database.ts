import * as SQLite from 'expo-sqlite';
import schema from './Schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('wordy.db');

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(schema);

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initializeDatabase().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

export async function PrintDB(): Promise<void> {
  const db = await getDatabase();

  const tables = [
    'User_Settings',
    'Words',
    'Definitions',
    'Examples',
    'Stem_Words',
  ];

  for (const table of tables) {
    const rows = await db.getAllAsync(`SELECT * FROM ${table}`);

    console.log(`\n--- ${table} (${rows.length} rows) ---`);

    for (const row of rows) {
      console.log(JSON.stringify(row, null, 2));
    }
  }
}