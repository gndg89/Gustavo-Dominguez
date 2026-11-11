const bcrypt = require("bcryptjs");

// Real server-side credential check: the admin password is hashed once at
// startup (from the ADMIN_PASSWORD env var) and compared with bcrypt. The
// session cookie is the only thing the browser holds; no credential or
// "logged in" flag ever lives in client-side JS or localStorage.
const ADMIN_USER = process.env.ADMIN_USER || "mafe";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pensado2026";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function verifyCredentials(user, password) {
  if (typeof user !== "string" || typeof password !== "string") return false;
  if (user.trim() !== ADMIN_USER) return false;
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  return res.redirect("/login");
}

module.exports = { ADMIN_USER, verifyCredentials, requireAuth };
