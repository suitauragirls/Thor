const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');
if (!code.includes('Tag,')) {
  code = code.replace(/Clock\n\} from 'lucide-react';/, "Clock,\n  Tag\n} from 'lucide-react';");
}
fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
