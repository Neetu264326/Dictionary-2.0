for (const p of ['love','test']) {
  const url = `https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=${encodeURIComponent(p)}&prop=wikitext|sections&format=json&formatversion=2`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Dictionary-2.0/1.0 (contact: dev@example.com)' } });
  console.log(p, 'status', res.status);
  const body = await res.text();
  console.log('  body head:', body.slice(0, 260).replace(/\s+/g, ' '));
  try {
    const json = JSON.parse(body);
    if (json.error) { console.log('  api error:', json.error.code); continue; }
    const wt = json.parse?.wikitext || '';
    console.log('  wikitext len:', wt.length);
    const secs = (json.parse?.sections || []).filter(s => Number(s.toclevel) <= 2).map(s => `${s.line}${s.byteoffset}`);
    console.log('  sections:', secs.slice(0, 30).join(' | '));
    const i = wt.indexOf('{{en-');
    console.log('  head word tmpl:', wt.slice(i, i + 300).replace(/\n/g, ' / '));
  } catch (e) { console.log('  parse fail', e.message); }
}
