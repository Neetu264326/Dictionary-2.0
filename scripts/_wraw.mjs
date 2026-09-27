const wikitext = (await (await fetch('https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=hello&prop=wikitext&format=json&formatversion=2')).json()).parse.wikitext;
console.log('--- HELLO (first 1800) ---');
console.log(wikitext.slice(0, 1800));
const e = (await (await fetch('https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=eloquent&prop=wikitext&format=json&formatversion=2')).json()).parse.wikitext;
console.log('--- ELOQUENT ---');
console.log(e.slice(0, 1600));
