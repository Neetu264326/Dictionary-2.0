async function wt(p){ const r=await fetch(`https://en.wiktionary.org/w/api.php?action=parse&redirects=1&page=${p}&prop=wikitext&format=json&formatversion=2`); return (await r.json()).parse.wikitext; }
const h = await wt('hello');
console.log('--- hello headings ---');
console.log(h.split('\n').filter(l=>/^(={2,4})/.test(l)).join('\n'));
console.log('--- hello Interjection block ---');
const hi = h.indexOf('===Interjection===');
console.log(h.slice(hi, hi+600));
const r = await wt('resilient');
console.log('--- resilient etymology ---');
const ri = r.indexOf('===Etymology===');
console.log(r.slice(ri, ri+400));
const s = await wt('serendipity');
console.log('--- serendipity Noun syn ---');
const si = s.indexOf('===Noun===');
console.log(s.slice(si, si+1400));
