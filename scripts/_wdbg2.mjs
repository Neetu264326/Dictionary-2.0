import { lookupWiktionary } from '../server/services/wiktionaryProvider.js';
try { await lookupWiktionary('xyzzyplugh'); } catch (e) { console.log('code=', e.code, 'status=', e.status); console.log(e.stack); }
try { await lookupWiktionary('qqqzzzwww'); } catch (e) { console.log('code2=', e.code, e.message); }
