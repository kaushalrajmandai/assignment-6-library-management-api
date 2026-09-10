const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebaseConfig');

const usersRef = db.collection('users');

const generateToken = (user) => {
  return jwt.sign(
    { uid: user.uid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register (Student)
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await usersRef.where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserRef = await usersRef.add({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      createdAt: new Date().toISOString()
    });

    const token = generateToken({ uid: newUserRef.id, email, role: 'student' });

    res.status(201).json({ success: true, message: 'Student registered successfully', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/register-librarian
exports.registerLibrarian = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.LIBRARIAN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid librarian secret key' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await usersRef.where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserRef = await usersRef.add({
      name,
      email,
      password: hashedPassword,
      role: 'librarian',
      createdAt: new Date().toISOString()
    });

    const token = generateToken({ uid: newUserRef.id, email, role: 'librarian' });

    res.status(201).json({ success: true, message: 'Librarian registered successfully', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ uid: userDoc.id, email: user.email, role: user.role });

    res.json({ success: true, message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const userDoc = await usersRef.doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...userData } = userDoc.data();
    res.json({ success: true, user: { uid: userDoc.id, ...userData } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};