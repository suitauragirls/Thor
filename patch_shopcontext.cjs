const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf8');

code = code.replace(/allProducts: Product\[\];/, 'allProducts: Product[];\n  isLoading: boolean;');
code = code.replace(/const \{ products, allProducts, getProductById \} = useProducts\(\);/, 'const { products, allProducts, getProductById, isLoading } = useProducts();');
code = code.replace(/allProducts,/, 'allProducts,\n        isLoading,');
code = code.replace(/const found = products\.find\(p => String\(p\.id\) === pId\) \|\| PRODUCTS_DATA\.find\(p => String\(p\.id\) === pId\);/, 'const found = products.find(p => String(p.id) === pId) || allProducts.find(p => String(p.id) === pId);');

fs.writeFileSync('src/context/ShopContext.tsx', code);
