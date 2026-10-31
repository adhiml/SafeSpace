const express = require('express');
const {
  createJournal,
  getJournals,
  updateJournal,
  deleteJournal,
  reviewJournalStress,
} = require('../controllers/journalController');

const router = express.Router();

router.patch('/:id/stress-review', reviewJournalStress);
router.post('/', createJournal);
router.get('/', getJournals);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;
