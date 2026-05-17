const express = require('express');
const {
  createJournal,
  getJournals,
  updateJournal,
  deleteJournal,
} = require('../controllers/journalController');

const router = express.Router();

router.post('/', createJournal);
router.get('/', getJournals);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;
