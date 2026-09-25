const fs = require('fs');
let code = fs.readFileSync('src/components/CartPage.tsx', 'utf8');

const enhancedSummary = `
          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-b from-white to-rose-50/30 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#2C1820] border-b border-rose-100 pb-4 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-sm font-sans font-medium text-gray-500">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
              </h3>`;
code = code.replace(/\{\/\* Right Column: Order Summary \*\/\}[\s\S]*?Order Summary\s*<\/h3>/, enhancedSummary);

const checkoutButton = `
                <button
                  id="cart-page-checkout-btn"
                  onClick={() => setActivePage('checkout')}
                  className="w-full py-4 bg-[#58152D] hover:bg-[#7E1D3B] text-white rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-[#2C1820]">100% Secure Payment</p>
                  <p className="text-xs text-gray-500">256-bit SSL encrypted checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-[#2C1820]">Express Shipping</p>
                  <p className="text-xs text-gray-500">Fast delivery across India</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-[#2C1820]">Premium Quality</p>
                  <p className="text-xs text-gray-500">Handcrafted ethnic wear</p>
                </div>
              </div>
            </div>`;
code = code.replace(/<button\s*id="cart-page-checkout-btn"[\s\S]*?Proceed to Checkout\s*<\/button>\s*<\/div>\s*<\/div>/, checkoutButton);

fs.writeFileSync('src/components/CartPage.tsx', code);
