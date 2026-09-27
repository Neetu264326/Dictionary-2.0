import { lookupWord, validateWord } from '../services/dictionaryService.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * GET /api/dictionary/:word  or  GET /api/dictionary?word=hello
 */
export async function getWord(req, res, next) {
  try {
    const raw = req.params.word ?? req.query.word ?? '';
    const word = validateWord(raw);

    if (!word) {
      throw new ApiError(400, 'INVALID_INPUT', 'Please provide a word to look up.');
    }

    const data = await lookupWord(word);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(data);
  } catch (error) {
    next(error);
  }
}
