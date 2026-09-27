for (const p of ['sonder','xyzzyplugh']) {
  const res = await fetch(`https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=${p}&prop=wikitext&format=json&formatversion=2`, { headers: { 'User-Agent': 'Dictionary-2.0/1.0' } });
  const t = await res.text();
  console.log(p, '->', res.status, res.headers.get('content-type'), '| body:', t.slice(0, 220));
}
