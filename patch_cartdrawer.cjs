const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
code = code.replace(/<strong className="text-emerald-700 font-bold">FREE<\/strong>\s*\) : \(\s*`₹\$\{shippingFee\}`\s*\)/, '`₹${shippingFee}`');
fs.writeFileSync('src/components/CartDrawer.tsx', code);
