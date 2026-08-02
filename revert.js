const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');
s = s.replace(/provider\s*=\s*"mongodb"/, 'provider = "sqlite"');
s = s.replace(/@db\.ObjectId/g, '');
s = s.replace(/@map\("_id"\)/g, '');
fs.writeFileSync('prisma/schema.prisma', s);
