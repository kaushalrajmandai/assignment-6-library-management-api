const { db } = require('../config/firebaseConfig');
const booksRef = db.collection('books');

// GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let snapshot = await booksRef.get();
    let books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = search.toLowerCase();
      books = books.filter(b => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
    }
    if (category) {
      books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }

    res.json({ success: true, count: books.length, books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const doc = await booksRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/books (Librarian)
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;
    if (!title || !author || !isbn || !category || totalCopies === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newBook = {
      title, author, isbn, category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      createdAt: new Date().toISOString()
    };

    const ref = await booksRef.add(newBook);
    res.status(201).json({ success: true, message: 'Book created', book: { id: ref.id, ...newBook } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/books/:id (Librarian)
exports.updateBook = async (req, res) => {
  try {
    const doc = await booksRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    await booksRef.doc(req.params.id).update(req.body);
    const updated = await booksRef.doc(req.params.id).get();
    res.json({ success: true, message: 'Book updated', book: { id: updated.id, ...updated.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/books/:id (Librarian)
exports.deleteBook = async (req, res) => {
  try {
    const doc = await booksRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    await booksRef.doc(req.params.id).delete();
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};