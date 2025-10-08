const express = require('express');
const router = express.Router();
const {
  getAllEntries,
  getEntryById,
  getEntryBySlug,
  createEntry,
  updateEntry,
  deleteEntry,
  likeEntry,
  addComment,
  deleteComment
} = require('../controllers/entryController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', getAllEntries);
router.get('/:id', getEntryById);
router.get('/slug/:slug', getEntryBySlug);
router.post('/', authenticate, isAdmin, createEntry);
router.put('/:id', authenticate, isAdmin, updateEntry);
router.delete('/:id', authenticate, isAdmin, deleteEntry);
router.post('/:id/like', authenticate, likeEntry);
router.post('/:id/comment', authenticate, addComment);
router.delete('/:id/comment/:commentId', authenticate, deleteComment);

module.exports = router;
