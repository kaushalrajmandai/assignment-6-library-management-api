const express = require('express');
const router = express.Router();
const { getAllBorrowRecords, getOverdueBooks } = require('../controllers/borrowController');
const verifyToken = require('../middleware/auth');
const { verifyLibrarian } = require('../middleware/checkRole');

/**
 * @swagger
 * /api/librarian/borrow-records:
 *   get:
 *     summary: View all borrow records (Librarian only)
 *     tags: [Librarian]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All borrow records }
 */
router.get('/borrow-records', verifyToken, verifyLibrarian, getAllBorrowRecords);

/**
 * @swagger
 * /api/reports/overdue:
 *   get:
 *     summary: View overdue books (Librarian only)
 *     tags: [Librarian]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Overdue books }
 */
router.get('/reports/overdue', verifyToken, verifyLibrarian, getOverdueBooks);

module.exports = router;