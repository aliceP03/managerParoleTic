const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 8080;

// Middleware loggin
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

const passwordsCollection = db.collection('passwords');


// GET ALL PASSWORDS (Firestore)
app.get("/passwords", async (req, res) => {
  try {
    const snapshot = await passwordsCollection.get();
    const passwords = [];

    snapshot.forEach(doc => {
      passwords.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(passwords);
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to get passwords" });
  }
});


// GET password by ID (Firestore)
app.get("/passwords/:id", async (req, res) => {
  const { id } = req.params; // ID-ul e string (auto-generated Firestore)

  try {
    const docRef = passwordsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Password entry not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to get password by ID" });
  }
});

// CREATE password (Firestore)
app.post("/passwords", async (req, res) => {
  const { site, username, passwordEncrypted, category } = req.body;

  if (!site || !username || !passwordEncrypted) {
    return res
      .status(400)
      .json({ error: "site, username and encrypted password are required" });
  }

  try {
    const docRef = await passwordsCollection.add({
      site,
      username,
      passwordEncrypted,
      category: category || "General",
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to add password" });
  }
});

// UPDATE password (Firestore)
app.put("/passwords/:id", async (req, res) => {
  const { id } = req.params;
  const { site, username, passwordEncrypted, category } = req.body;

  try {
    const docRef = passwordsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Password entry not found" });
    }

    const updateData = {};
    if (site !== undefined) updateData.site = site;
    if (username !== undefined) updateData.username = username;
    if (passwordEncrypted !== undefined) updateData.passwordEncrypted = passwordEncrypted;
    if (category !== undefined) updateData.category = category;

    await docRef.update(updateData);

    res.status(200).json({ id });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// DELETE password (Firestore)
app.delete("/passwords/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = passwordsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Password entry not found" });
    }

    await docRef.delete();
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to delete password" });
  }
});

app.listen(PORT, () => {
  console.log(`Password Manager API running on http://localhost:${PORT}`);
});
