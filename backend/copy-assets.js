const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = path.join(__dirname, '..', 'frontend', 'src');
const pub = path.join(__dirname, '..', 'frontend', 'public');

fs.mkdirSync(pub, { recursive: true });
fs.copyFileSync(path.join(root, 'style.css'), path.join(src, 'style.css'));
fs.copyFileSync(path.join(root, 'pages.css'), path.join(src, 'pages.css'));
fs.copyFileSync(path.join(root, 'favicon.svg'), path.join(pub, 'favicon.svg'));
console.log('Assets copied successfully!');
