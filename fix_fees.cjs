const fs = require('fs');

const files = ['src/components/CartDrawer.tsx', 'src/components/CartPage.tsx', 'src/components/CheckoutPage.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/`₹\$\{shippingFee\}`\}/g, '₹{shippingFee}');
  code = code.replace(/`₹\$\{shippingFee\}`/g, '₹{shippingFee}');
  fs.writeFileSync(file, code);
}
