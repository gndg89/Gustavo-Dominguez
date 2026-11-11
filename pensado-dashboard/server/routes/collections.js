const express = require("express");
const {
  COLLECTIONS,
  listCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
} = require("../db");

const router = express.Router();

function isAllowed(name) {
  return COLLECTIONS.includes(name);
}

// Basic payload validation: reject absurdly large bodies (covers the
// huerto photo data-URL case; the client already resizes/compresses
// images before upload, this is just a server-side backstop) and strip
// anything that isn't a plain object.
const MAX_BODY_CHARS = 2_000_000; // ~2MB, generous for a compressed photo data-URL

router.use("/:name", (req, res, next) => {
  if (!isAllowed(req.params.name)) {
    return res.status(404).json({ error: "Colección desconocida" });
  }
  next();
});

router.get("/:name", (req, res) => {
  res.json(listCollection(req.params.name));
});

router.post("/:name", (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Cuerpo inválido" });
  }
  if (JSON.stringify(body).length > MAX_BODY_CHARS) {
    return res.status(413).json({ error: "La fila es demasiado grande" });
  }
  const created = addToCollection(req.params.name, body, { sample: false });
  res.status(201).json(created);
});

router.patch("/:name/:id", (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Cuerpo inválido" });
  }
  if (JSON.stringify(body).length > MAX_BODY_CHARS) {
    return res.status(413).json({ error: "La fila es demasiado grande" });
  }
  const updated = updateInCollection(req.params.name, req.params.id, body);
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});

router.delete("/:name/:id", (req, res) => {
  const ok = deleteFromCollection(req.params.name, req.params.id);
  if (!ok) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

module.exports = router;
