const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const tabReplacement = `
            {/* Elegant Product Info Cards */}
            <div className="pt-6 space-y-4">
              
              {/* Product Details Card */}
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs transition-shadow hover:shadow-md">
                <h3 className="font-serif text-lg font-bold text-[#58152D] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Product Details
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>{product.description}</p>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-rose-50 text-xs">
                    <div className="bg-rose-50/50 p-2.5 rounded-lg">
                      <span className="font-bold text-[#58152D] block mb-0.5">Fit:</span>
                      <span className="text-gray-800">{product.fit}</span>
                    </div>
                    <div className="bg-rose-50/50 p-2.5 rounded-lg">
                      <span className="font-bold text-[#58152D] block mb-0.5">Occasion:</span>
                      <span className="text-gray-800">{product.occasion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fabric & Care Card */}
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs transition-shadow hover:shadow-md">
                <h3 className="font-serif text-lg font-bold text-[#58152D] mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Fabric & Care
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-100/60">
                    <span className="font-bold text-[#58152D] block mb-1">Fabric Composition:</span>
                    <p className="text-gray-700 leading-relaxed">{product.fabric}</p>
                  </div>
                  <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-100/60">
                    <span className="font-bold text-[#58152D] block mb-1">Wash & Care Instructions:</span>
                    <p className="text-gray-700 leading-relaxed">{product.washCare}</p>
                  </div>
                </div>
              </div>

              {/* Shipping & Returns Card */}
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs transition-shadow hover:shadow-md">
                <h3 className="font-serif text-lg font-bold text-[#58152D] mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Shipping & Returns
                </h3>
                <div className="space-y-3 text-xs text-gray-700">
                  <div className="flex items-start gap-3 p-3 bg-rose-50/30 rounded-lg">
                    <Clock className="w-5 h-5 text-[#58152D] shrink-0" />
                    <p><strong>Fast Dispatch:</strong> All orders are dispatched within 24 to 48 business hours via premium express couriers.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-rose-50/30 rounded-lg">
                    <Truck className="w-5 h-5 text-[#58152D] shrink-0" />
                    <p><strong>Express Delivery:</strong> Fast and reliable shipping across India.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-rose-50/30 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-[#58152D] shrink-0" />
                    <p><strong>Standard Returns:</strong> 7-day easy exchange/return policy for unworn items with original tags intact.</p>
                  </div>
                </div>
              </div>

              {/* Reviews Card */}
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs transition-shadow hover:shadow-md">
                <h3 className="font-serif text-lg font-bold text-[#58152D] mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Reviews ({product.reviewCount})
                </h3>
                <div className="space-y-3">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-rose-50/30 rounded-xl border border-rose-100/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2C1820] text-sm">{rev.userName}</span>
                          <div className="flex text-[#DFBE65]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <span>Size: {rev.sizePurchased}</span>
                          <span>•</span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                      Be the first to review this stunning piece!
                    </p>
                  )}
                </div>
              </div>

            </div>`;

code = code.replace(/<div className="mt-8">[\s\S]*?{activeTab === 'reviews'[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, tabReplacement);
fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
