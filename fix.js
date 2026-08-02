const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const publicDir = path.join(__dirname, 'public');
const dirs = fs.readdirSync(publicDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

dirs.forEach(dir => {
  const file = path.join(publicDir, dir, 'index.html');
  if (fs.existsSync(file)) {
    console.log("Fixing", file);
    // Read the file as utf8 string (this is the corrupted text)
    let txt = fs.readFileSync(file, 'utf8');
    
    // Strip BOM if present (PowerShell Get-Content + Set-Content adds it)
    if (txt.charCodeAt(0) === 0xFEFF) {
      txt = txt.substring(1);
    }
    
    // Convert the string back to bytes using win1252 encoding.
    // If PowerShell read it as win1252, then each character in the string
    // corresponds to a byte in win1252.
    // This will reconstruct the original UTF-8 byte sequence!
    const buf = iconv.encode(txt, 'win1252');
    
    // Now decode those bytes as UTF-8!
    let restoredText = buf.toString('utf8');
    
    // Check if it has replacement characters which indicates data loss
    if (restoredText.includes('')) {
        console.error("WARNING: Replacement characters found in", file);
    }

    // Apply the replacements that we originally intended
    restoredText = restoredText.replace(/صُنع من خلال <a href="https:\/\/da3wa\.co" target="_blank" rel="noopener">دعوة<\/a>/g, 'صُنع من خلال <a href="/" target="_blank" rel="noopener">فرحة</a>');
    restoredText = restoredText.replace(/https:\/\/da3wa\.co\/go\/create\?ref=[a-zA-Z0-9-]*/g, '/');
    restoredText = restoredText.replace(/https:\/\/instagram\.com\/da3wa\.iq/g, 'https://instagram.com/farha');
    restoredText = restoredText.replace(/@da3wa\.iq/g, '@farha');
    restoredText = restoredText.replace(/'da3wa\.co'/g, "'FARHA'");

    // Write back as UTF-8
    fs.writeFileSync(file, restoredText, 'utf8');
  }
});
console.log("Done!");
