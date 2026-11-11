const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const { ADMIN_USER, verifyCredentials, requireAuth } = require("./auth");
const { seedAll } = require("./seed");
const collectionsRouter = require("./routes/collections");

seedAll();

const app = express();
app.set("trust proxy", 1); // Railway sits behind a proxy/load balancer

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

let SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  // Fail-safe for local/dev use only: a real deploy must set SESSION_SECRET.
  console.warn(
    "[pensado] SESSION_SECRET no está configurado; generando uno temporal para esta instancia. Configura SESSION_SECRET en el entorno para producción."
  );
  SESSION_SECRET = crypto.randomBytes(32).toString("hex");
}

app.use(express.json({ limit: "3mb" }));

app.use(
  session({
    name: "pensado.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    },
  })
);

// ---------- Auth endpoints ----------
app.post("/api/login", (req, res) => {
  const { user, password } = req.body || {};
  if (verifyCredentials(user, password)) {
    req.session.loggedIn = true;
    req.session.user = ADMIN_USER;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false });
});

// ---------- Data API (session-protected) ----------
app.use("/api/collections", requireAuth, collectionsRouter);

// ---------- Static assets (CSS/JS/fonts) are public ----------
app.use("/assets", express.static(path.join(__dirname, "..", "public", "assets")));
app.use("/css", express.static(path.join(__dirname, "..", "public", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "public", "js")));

// ---------- Pages ----------
app.get("/login", (req, res) => {
  if (req.session && req.session.loggedIn) return res.redirect("/");
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).send("No encontrado"));

app.listen(PORT, () => {
  console.log(`[pensado] Dashboard escuchando en el puerto ${PORT} (${NODE_ENV})`);
});
