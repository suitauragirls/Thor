const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
code = code.replace(/\{shippingFee === 0 \? \([\s\S]*?\) : \([\s\S]*?\)\}/, '`₹${shippingFee}`');
fs.writeFileSync('src/components/CartDrawer.tsx', code);
