import * as SQLite from 'expo-sqlite';
import schema from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync('wordy.db');

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(schema);

  return db;
}

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }

  return dbPromise;
}