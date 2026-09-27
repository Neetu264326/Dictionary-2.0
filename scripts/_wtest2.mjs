import { lookupWiktionary } from '../server/services/wiktionaryProvider.js';
const words = ['sonder','break','set','go','selfie'];
for (const w of words) {
  try { const r = await lookupWiktionary(w); console.log('OK  ', w, '|', r.meanings.map(m=>`${m.partOfSpeech}:${m.definitions.length}`).join(','), '|', r.meanings[0]?.definitions[0]?.definition.slice(0,70)); }
  catch (e) { console.log('ERR ', w, e.code); }
  await new Promise(r => setTimeout(r, 2000));
}
