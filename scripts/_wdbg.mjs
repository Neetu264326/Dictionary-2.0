const url = 'https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=xyzzyplugh&prop=wikitext&format=json&formatversion=2';
const res = await fetch(url, { headers: { 'User-Agent': 'Dictionary-2.0/1.0' } });
console.log('status', res.status, res.headers.get('content-type'));
const text = await res.text();
console.log('body:', text.slice(0, 400));

const u2 = 'https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=ubiquitous&prop=wikitext&format=json&formatversion=2';
const r2 = await (await fetch(u2, { headers: { 'User-Agent': 'Dictionary-2.0/1.0' } })).json();
const wt = r2.parse.wikitext;
const i = wt.indexOf('====Synonyms====');
console.log('--- ubiquitous synonyms ---');
console.log(wt.slice(i, i + 500));
