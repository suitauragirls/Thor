const fs = require('fs');
let code = fs.readFileSync('src/components/CartPage.tsx', 'utf8');
code = code.replace(/\{shippingFee === 0 \? \([\s\S]*?\) : \([\s\S]*?\)\}/, '`₹${shippingFee}`');
fs.writeFileSync('src/components/CartPage.tsx', code);
