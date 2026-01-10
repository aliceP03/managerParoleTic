const express = require('express');
const cors = require('cors');
const db = require('./db');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('./auth');
const app = express();
const PORT = 8080;
app.use(cors());
app.use(express.json());
const passwordsCollection = db.collection('passwords');
const usersCollection = db.collection('users');

// Middleware loggin
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await hashPassword(password);
    const docRef = await usersCollection.add({ email, password: hashed });
    res.status(201).json({ userId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const snapshot = await usersCollection.where('email', '==', email).get();

    if (snapshot.empty) return res.status(401).json({ error: "User not found" });

    const doc = snapshot.docs[0];
    const user = { id: doc.id, ...doc.data() };

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken({ id: user.id, email: user.email });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

function validateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "No token found" });

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) return res.status(403).json({ error: "Invalid or expired token" });

  req.user = decoded;
  next();
}

// GET ALL PASSWORDS (Firestore)
app.get("/passwords",validateToken, async (req, res) => {
  try {
    const snapshot = await passwordsCollection.where('userId', '==', req.user.id).get();
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
app.get("/passwords/:id",validateToken, async (req, res) => {
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
app.post("/passwords", validateToken, async (req, res) => {
  const { site, username, passwordEncrypted, category } = req.body;

  if (!site || !username || !passwordEncrypted) {
    return res
      .status(400)
      .json({ error: "site, username and encrypted password are required" });
  }

  try {
    const docRef = await passwordsCollection.add({
      userId: req.user.id,
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
app.put("/passwords/:id", validateToken, async (req, res) => {
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
    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: Aceasta nu este parola ta!" });
    }

    await docRef.update(updateData);

    res.status(200).json({ id });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// DELETE password (Firestore)
app.delete("/passwords/:id", validateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = passwordsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Password entry not found" });
    }
    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: Aceasta nu este parola ta!" });
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
