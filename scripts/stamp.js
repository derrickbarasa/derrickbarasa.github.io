// Appends a content hash to the CSS and JS URLs in index.html so browsers refetch them only when they change.
const fs = require('fs');
const crypto = require('crypto');
const hash = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8);
let html = fs.readFileSync('index.html', 'utf8');
for (const f of ['css/style.css', 'js/main.js']) {
  html = html.replace(new RegExp(f.replace(/[./]/g, '\\$&') + '\\?v=[\\w]+'), `${f}?v=${hash(f)}`);
}
fs.writeFileSync('index.html', html);
