const fs = require('fs');
let code = fs.readFileSync('src/context/ProductContext.tsx', 'utf8');

code = code.replace(/export interface ProductContextType \{/, 'export interface ProductContextType {\n  isLoading: boolean;');
code = code.replace(/const \[products, setProducts\] = useState<Product\[\]>\(\[\]\);/, 'const [products, setProducts] = useState<Product[]>([]);\n  const [isLoading, setIsLoading] = useState<boolean>(true);');

code = code.replace(/const fetchProducts = async \(\) => \{/, `const fetchProducts = async () => {\n    setIsLoading(true);`);
code = code.replace(/setProducts\(normalized\);\n      \} else \{/, 'setProducts(normalized);\n      } else {');
code = code.replace(/setProducts\(\[\]\);\n    \}/, 'setProducts([]);\n    }\n    setIsLoading(false);');

// Make sure setIsLoading is in the return context
code = code.replace(/activeProducts,\n        addProduct,/, 'activeProducts,\n        isLoading,\n        addProduct,');

fs.writeFileSync('src/context/ProductContext.tsx', code);
