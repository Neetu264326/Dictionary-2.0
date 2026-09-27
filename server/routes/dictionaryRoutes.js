import { Router } from 'express';
import { getWord } from '../controllers/dictionaryController.js';

const router = Router();

/**
 * GET /api/dictionary/:word
 * GET /api/dictionary?word=hello
 * Looks up a word and returns a normalized dictionary payload.
 */
router.get('/', getWord);
router.get('/:word', getWord);

export default router;
