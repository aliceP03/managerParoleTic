import express from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

// Middleware loggin
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Fake DB (temporar)
// Ulterior mutăm în Firebase
let passwords = [
  {
    id: 1,
    site: "facebook.com",
    username: "john@gmail.com",
    passwordEncrypted: "ENCRYPTED_STRING_HERE",
    category: "Social",
    createdAt: new Date().toISOString()
  }
];

let nextId = 2;

// GET ALL PASSWORDS
app.get("/passwords", (req, res) => {
  res.status(200).json(passwords);
});

// GET password by ID
app.get("/passwords/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const entry = passwords.find(p => p.id === id);

  if (!entry)
    return res.status(404).json({ error: "Password entry not found" });

  res.status(200).json(entry);
});

// CREATE
app.post("/passwords", (req, res) => {
  const { site, username, passwordEncrypted, category } = req.body;

  if (!site || !username || !passwordEncrypted) {
    return res
      .status(400)
      .json({ error: "site, username and encrypted password are required" });
  }

  const newEntry = {
    id: nextId++,
    site,
    username,
    passwordEncrypted,
    category: category || "General",
    createdAt: new Date().toISOString()
  };

  passwords.push(newEntry);

  res.status(201).json({ id: newEntry.id });
});

// UPDATE
app.put("/passwords/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const entryIndex = passwords.findIndex(p => p.id === id);

  if (entryIndex === -1)
    return res.status(404).json({ error: "Password entry not found" });

  const { site, username, passwordEncrypted, category } = req.body;

  if (site !== undefined) passwords[entryIndex].site = site;
  if (username !== undefined) passwords[entryIndex].username = username;
  if (passwordEncrypted !== undefined)
    passwords[entryIndex].passwordEncrypted = passwordEncrypted;
  if (category !== undefined) passwords[entryIndex].category = category;

  res.status(200).json(passwords[entryIndex]);
});

// DELETE
app.delete("/passwords/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = passwords.findIndex(p => p.id === id);

  if (index === -1)
    return res.status(404).json({ error: "Password entry not found" });

  passwords.splice(index, 1);

  res.status(200).json({ message: "Entry deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Password Manager API running on http://localhost:${PORT}`);
});
