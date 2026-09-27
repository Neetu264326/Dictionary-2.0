import { lookupWiktionary } from '../server/services/wiktionaryProvider.js';
const words = ['love','test','run','apple','hello','ephemeral','serendipity','resilient','ubiquitous','petrichor','sonder','break','set','go','selfie'];
let fails = [];
for (const w of words) {
  try {
    const r = await lookupWiktionary(w);
    console.log('OK  ', w.padEnd(14), r.meanings.length, 'meanings |', r.meanings.map(m => `${m.partOfSpeech}:${m.definitions.length}`).join(', '), '| syn:', r.meanings[0].synonyms.slice(0,5).join(','));
  } catch (e) { fails.push(w); console.log('ERR ', w.padEnd(14), e.code, e.message); }
}
console.log(fails.length ? 'FAILS: ' + fails.join(',') : 'ALL OK');
