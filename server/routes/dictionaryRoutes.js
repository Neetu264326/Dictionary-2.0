import { Router } from 'express';
import { getWord } from '../controllers/dictionaryController.js';

const router = Router();

/**
 * GET /api/dictionary/:word
 * Looks up a word and returns a normalized dictionary payload.
 */
router.get('/:word', getWord);

export default router;
