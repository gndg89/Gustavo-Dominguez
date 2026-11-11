const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { randomUUID } = require("crypto");

// Where the SQLite file lives. On Railway this should point at a mounted
// volume (e.g. /data/pensado.db) so data survives restarts and deploys.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "pensado.db");

// Make sure the parent directory exists (works for both a local ./data
// folder and a Railway volume mounted at e.g. /data).
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS rows (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    data TEXT NOT NULL,
    sample INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_rows_collection ON rows(collection);
`);

// Collections this app knows about. Any collection name outside this list
// is rejected by the API layer (server/routes/collections.js).
const COLLECTIONS = [
  "pedidos",
  "clientes",
  "catalogo",
  "reservas",
  "eventos",
  "contabilidad",
  "pendientes",
  "ingredients",
  "recipes",
  "huerto",
];

function rowToObj(row) {
  return Object.assign({ id: row.id, sample: !!row.sample }, JSON.parse(row.data));
}

function listCollection(name) {
  const rows = db
    .prepare("SELECT * FROM rows WHERE collection = ? ORDER BY created_at ASC")
    .all(name);
  return rows.map(rowToObj);
}

function addToCollection(name, fields, { sample = false } = {}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const data = Object.assign({}, fields);
  delete data.id;
  delete data.sample;
  db.prepare(
    "INSERT INTO rows (id, collection, data, sample, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, name, JSON.stringify(data), sample ? 1 : 0, now, now);
  return rowToObj(db.prepare("SELECT * FROM rows WHERE id = ?").get(id));
}

function updateInCollection(name, id, patch) {
  const existing = db
    .prepare("SELECT * FROM rows WHERE collection = ? AND id = ?")
    .get(name, id);
  if (!existing) return null;
  const current = JSON.parse(existing.data);
  const merged = Object.assign({}, current, patch);
  // Any edit a human makes clears the "sample" flag, same as the original
  // artifact: once a person touches a seeded row, it's theirs.
  let sample = existing.sample;
  delete merged.id;
  if (Object.prototype.hasOwnProperty.call(patch, "sample")) {
    sample = patch.sample ? 1 : 0;
    delete merged.sample;
  } else {
    sample = 0;
  }
  const now = new Date().toISOString();
  db.prepare("UPDATE rows SET data = ?, sample = ?, updated_at = ? WHERE id = ?").run(
    JSON.stringify(merged),
    sample,
    now,
    id
  );
  return rowToObj(db.prepare("SELECT * FROM rows WHERE id = ?").get(id));
}

function deleteFromCollection(name, id) {
  const info = db.prepare("DELETE FROM rows WHERE collection = ? AND id = ?").run(name, id);
  return info.changes > 0;
}

function countCollection(name) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM rows WHERE collection = ?").get(name);
  return row.c;
}

function seedIfEmpty(name, seedRows) {
  if (countCollection(name) > 0) return;
  seedRows.forEach((fields) => addToCollection(name, fields, { sample: true }));
}

module.exports = {
  db,
  COLLECTIONS,
  listCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
  countCollection,
  seedIfEmpty,
};
