const { db } = require('../config/firebaseConfig');
const booksRef = db.collection('books');
const borrowRef = db.collection('borrow_records');

// POST /api/books/:id/borrow (Student)
exports.borrowBook = async (req, res) => {
  try {
    const bookDoc = await booksRef.doc(req.params.id).get();
    if (!bookDoc.exists) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    const book = bookDoc.data();
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    await booksRef.doc(req.params.id).update({ availableCopies: book.availableCopies - 1 });

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const record = {
      userId: req.user.uid,
      bookId: req.params.id,
      bookTitle: book.title,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'borrowed'
    };
    const ref = await borrowRef.add(record);

    res.status(201).json({ success: true, message: 'Book borrowed', record: { id: ref.id, ...record } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/books/:id/return (Student)
exports.returnBook = async (req, res) => {
  try {
    const snapshot = await borrowRef
      .where('bookId', '==', req.params.id)
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'borrowed')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'No active borrow record found' });
    }

    const recordDoc = snapshot.docs[0];
    await borrowRef.doc(recordDoc.id).update({
      status: 'returned',
      returnDate: new Date().toISOString()
    });

    const bookDoc = await booksRef.doc(req.params.id).get();
    const book = bookDoc.data();
    await booksRef.doc(req.params.id).update({ availableCopies: book.availableCopies + 1 });

    res.json({ success: true, message: 'Book returned' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/my-history (Student)
exports.getMyHistory = async (req, res) => {
  try {
    const snapshot = await borrowRef.where('userId', '==', req.user.uid).get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/librarian/borrow-records (Librarian)
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const snapshot = await borrowRef.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reports/overdue (Librarian)
exports.getOverdueBooks = async (req, res) => {
  try {
    const now = new Date().toISOString();
    const snapshot = await borrowRef.where('status', '==', 'borrowed').get();
    const overdue = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => r.dueDate < now);
    res.json({ success: true, count: overdue.length, overdue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};