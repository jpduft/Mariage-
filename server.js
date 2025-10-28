// server.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const PASSWORD = "Stuchlik26";

// CORS aktivieren, falls Zugriff von anderen Geräten
app.use(cors());

// Ordner für Uploads sicherstellen
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer Setup für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Statische Dateien (HTML/CSS/JS) aus public/
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

// Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ success: true });
});

// Galerie laden
app.get("/images", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).map(name => ({
    name,
    url: `/uploads/${encodeURIComponent(name)}`
  }));
  res.json(files);
});

// Download mit Passwort
app.get("/download/:name", (req, res) => {
  const { name } = req.params;
  const { pw } = req.query;

  if (pw !== PASSWORD) return res.status(403).send("Falsches Passwort.");

  const filePath = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(filePath)) return res.status(404).send("Datei nicht gefunden.");

  res.download(filePath);
});

// Alle löschen
app.post("/clear", (req, res) => {
  fs.readdirSync(UPLOAD_DIR).forEach(file => fs.unlinkSync(path.join(UPLOAD_DIR, file)));
  res.json({ success: true });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

