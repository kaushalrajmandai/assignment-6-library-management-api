const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { borrowBook, returnBook, getMyHistory } = require('../controllers/borrowController');
const verifyToken = require('../middleware/auth');
const { verifyStudent, verifyLibrarian } = require('../middleware/checkRole');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: List/search books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of books }
 *   post:
 *     summary: Create a book (Librarian only)
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Book created }
 */
router.get('/', getBooks);
router.post('/', verifyToken, verifyLibrarian, createBook);

router.get('/my-history', verifyToken, verifyStudent, getMyHistory);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get single book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Book details }
 *   put:
 *     summary: Update book (Librarian only)
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Book updated }
 *   delete:
 *     summary: Delete book (Librarian only)
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Book deleted }
 */
router.get('/:id', getBookById);
router.put('/:id', verifyToken, verifyLibrarian, updateBook);
router.delete('/:id', verifyToken, verifyLibrarian, deleteBook);

/**
 * @swagger
 * /api/books/{id}/borrow:
 *   post:
 *     summary: Borrow a book (Student only)
 *     tags: [Borrow]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Book borrowed }
 */
router.post('/:id/borrow', verifyToken, verifyStudent, borrowBook);

/**
 * @swagger
 * /api/books/{id}/return:
 *   post:
 *     summary: Return a book (Student only)
 *     tags: [Borrow]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Book returned }
 */
router.post('/:id/return', verifyToken, verifyStudent, returnBook);

module.exports = router;