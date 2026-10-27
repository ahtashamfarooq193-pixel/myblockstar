import fs from 'node:fs';
import path from 'node:path';

const reference = fs.readFileSync('../homepage-reference.html', 'utf8');
const sections = [...reference.matchAll(/<section\b[\s\S]*?<\/section>/g)];
const assets = new Map();
const sectionNames = [];

function localize(markup) {
  return markup
    .replace(/\s(?:srcset|sizes)="[^"]*"/g, '')
    .replace(/src="(https:\/\/myblockstar\.com\/[^\"]+)"/g, (_, url) => {
      const filename = path.basename(new URL(url).pathname);
      assets.set(filename, url);
      return `src="/assets/${filename}"`;
    })
    .replace(/href="https:\/\/myblockstar\.com\/(?:#)?assets\/?"/g, 'href="#portfolio"')
    .replace(/href="https:\/\/myblockstar\.com\/#(token|invest)"/g, 'href="#$1"')
    .replace(/\sfetchpriority="high"/g, '')
    .replace(/<input type="hidden"[^>]*>/g, '')
    .replace(/\saction="[^"]*"/g, '')
    .replace(/\sname="bs_nonce"/g, '')
    .replace(/>\s*</g, '>\n<');
}

for (const [index, match] of sections.entries()) {
  const id = match[0].match(/id="([^"]+)"/)?.[1] ?? 'closing';
  sectionNames.push(id);
  fs.writeFileSync(`src/sections/${id}.html`, localize(match[0]));
}

const footer = reference.match(/<footer\b[\s\S]*?<\/footer>/)[0];
fs.writeFileSync('src/sections/footer.html', localize(footer));

let css = fs.readFileSync('../brand-reference.css', 'utf8');
css = css.slice(0, css.indexOf('.bs-0871fec'));
css = css.replace(/\{/g, ' {\n  ').replace(/;/g, ';\n  ').replace(/\}/g, '\n}\n\n');
fs.writeFileSync('src/reference-layout.css', css);

assets.set('favicon.png', 'https://myblockstar.com/wp-content/uploads/2026/10/cropped-blockstar_signet_RGB-p-800-192x192.png');
fs.writeFileSync('reference-assets.json', JSON.stringify(Object.fromEntries(assets), null, 2));
fs.copyFileSync('../blockstar-logo.png', 'public/assets/blockstar-logo.png');
console.log('Preserved sections:', sectionNames.join(', '));
console.log('Original image assets:', assets.size);
