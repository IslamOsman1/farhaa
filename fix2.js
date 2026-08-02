const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const dirs = fs.readdirSync(publicDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const bad = String.fromCharCode(65533) + '?';

const dict = [
  [`اللّه${bad}مَّ`, `اللّهُمَّ`],
  [`بار${bad}كْ`, `بارِكْ`],
  [`له${bad}ما`, `لَهُما`],
  [`عليه${bad}ما`, `عَلَيْهِما`],
  [`بينه${bad}ما`, `بينَهُما`],
  [`بقلوب${bad}`, `بقلوبٍ`],
  [`م${bad}عمة${bad}`, `مفعمةٍ`],
  [`ي${bad}عدّ`, `يُعدّ`],
  [`ي${bad}نسب`, `يُنسب`],
  [`ي${bad}حسب`, `يُحسب`],
  [`ي${bad}ملأ`, `يُملأ`],
  [`ي${bad}${bad}سَّر`, `يُفَسَّر`],
  [`ت${bad}شغّل`, `تُشغّل`],
  [`ت${bad}${bad}رَض`, `تُفرَض`],
  [`ص${bad}نع`, `صُنع`],
  [`ص${bad}ر`, `صِفر`],
  [`تهان${bad}`, `تهانٍ`]
];

dirs.forEach(dir => {
  const file = path.join(publicDir, dir, 'index.html');
  if (fs.existsSync(file)) {
    let txt = fs.readFileSync(file, 'utf8');
    
    // 1. Replace specific words with diacritics
    for (const [corrupted, fixed] of dict) {
      txt = txt.split(corrupted).join(fixed);
    }
    
    // 2. Replace all remaining occurrences with 'ف'
    txt = txt.split(bad).join('ف');
    
    fs.writeFileSync(file, txt, 'utf8');
    console.log("Fixed", file);
  }
});
console.log("Done!");
