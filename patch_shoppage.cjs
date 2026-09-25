const fs = require('fs');
let code = fs.readFileSync('src/components/ShopPage.tsx', 'utf8');

code = code.replace(/const \{ products = \[\], selectedCategory/, 'const { products = [], isLoading, selectedCategory');
code = code.replace(/\{filteredProducts\.length === 0 \? \(/, `{isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-4 border-rose-200 border-t-[#58152D] rounded-full animate-spin mb-4"></div>
                  <h3 className="font-serif text-xl text-[#2C1820]">Loading Collection...</h3>
                </div>
              ) : filteredProducts.length === 0 ? (`);

fs.writeFileSync('src/components/ShopPage.tsx', code);
