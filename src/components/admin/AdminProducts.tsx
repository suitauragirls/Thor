import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useRouter } from '../../context/RouterContext';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Tag, 
  Layers, 
  Eye, 
  AlertCircle,
  ArrowUpDown,
  Star
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';

const ALL_CATEGORIES: string[] = [
  'All',
  'Suits',
  'Kurtis',
  'Dresses',
  'Anarkali',
  'Dupatta Sets',
  'Co-ord Sets',
  'Festive Wear',
  'Party Wear'
];

export const AdminProducts: React.FC = () => {
  const { 
    products = [], 
    deleteProduct, 
    duplicateProduct, 
    toggleProductStatus,
    updateProduct 
  } = useAdmin();
  const { showToast, navigateToProduct } = useShop();
  const { navigate, openAdminProductNew, openAdminProductEdit } = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStock, setFilterStock] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Duplicate handler
  const handleDuplicate = (id: string, name: string) => {
    duplicateProduct(id);
    showToast(`Duplicated "${name}" to draft copy.`, 'success');
  };

  // Delete handler
  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast(`Removed "${name}" from store catalog.`, 'info');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.fabric && product.fabric.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    let matchesStock = true;
    if (filterStock === 'inStock') {
      matchesStock = product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0);
    } else if (filterStock === 'outOfStock') {
      matchesStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity === 0);
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div id="admin-products-page" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-\[#FAF7F2\] p-5 rounded-2xl border border-rose-100 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B2635]">
            Inventory & Catalog
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Product Management ({products.length})
          </h2>
        </div>

        {/* Prominent + Add Product Button */}
        <button
          id="admin-add-product-btn"
          onClick={openAdminProductNew}
          className="px-5 py-2.5 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-\[#FAF7F2\] p-4 rounded-2xl border border-rose-100 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            placeholder="Search by product name, SKU, category, or fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#241D1B] text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-\[#FAF7F2\] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
          >
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-\[#FAF7F2\] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
          >
            <option value="all">Stock: All Inventory</option>
            <option value="inStock">Stock: In Stock Only</option>
            <option value="outOfStock">Stock: Out of Stock / Low</option>
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-\[#FAF7F2\] rounded-2xl border border-rose-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF9FA] border-b border-rose-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockQty = product.stockQuantity ?? (product.inStock ? 25 : 0);
                  const isOutOfStock = !product.inStock || stockQty === 0;

                  return (
                    <tr key={product.id} className="hover:bg-[#D8C8B8]/20 transition">
                      
                      {/* 1. Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-14 rounded-lg overflow-hidden border border-rose-100 bg-gray-50 shrink-0">
                          {product.images[0] && product.images[0].trim() !== "" ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-black" />
                          )}
                        </div>
                      </td>

                      {/* 2. Product Name & SKU */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 max-w-xs truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          SKU: {product.sku || product.id}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const newStatus = !product.isBestSeller;
                              await updateProduct(product.id, { isBestSeller: newStatus });
                              showToast(`"${product.name}" marked as ${newStatus ? 'Bestseller' : 'regular'}.`, 'success');
                            }}
                            className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition ${
                              product.isBestSeller 
                                ? 'bg-amber-100 text-black border border-amber-300 font-extrabold shadow-2xs' 
                                : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-black'
                            }`}
                            title="Click to toggle Bestseller status"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-black" />
                            <span>{product.isBestSeller ? <><Star className="inline-block w-3 h-3 fill-[#DFBE65] text-[#B8935A] mr-0.5" aria-hidden="true" /> Bestseller</> : '+ Mark Bestseller'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              const newStatus = !product.isNewArrival;
                              await updateProduct(product.id, { isNewArrival: newStatus });
                              showToast(`"${product.name}" new arrival ${newStatus ? 'enabled' : 'disabled'}.`, 'success');
                            }}
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition ${
                              product.isNewArrival
                                ? 'bg-[#D8C8B8]/40 text-[#211C1A] border border-rose-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-[#D8C8B8]/20 hover:text-[#211C1A]'
                            }`}
                            title="Click to toggle New Arrival status"
                          >
                            {product.isNewArrival ? 'New Arrival' : '+ New Arrival'}
                          </button>
                        </div>
                      </td>

                      {/* 3. Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium text-[11px]">
                          {product.category}
                        </span>
                      </td>

                      {/* 4. Price */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#211C1A] text-sm">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </p>
                      </td>

                      {/* 5. Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProduct(product.id, { stockQuantity: stockQty - 1 })}
                            className="p-1 hover:bg-[#D8C8B8]/40 rounded-md text-gray-500"
                          >
                            -
                          </button>
                          <span className={`font-semibold ${
                            isOutOfStock 
                              ? 'text-[#800020] font-bold' 
                              : stockQty < 10 
                              ? 'text-black font-bold' 
                              : 'text-gray-700'
                          }`}>
                            {stockQty}
                          </span>
                          <button
                            onClick={() => updateProduct(product.id, { stockQuantity: stockQty + 1 })}
                            className="p-1 hover:bg-[#D8C8B8]/40 rounded-md text-gray-500"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            const newStatus = !product.isBestSeller;
                            updateProduct(product.id, { isBestSeller: newStatus });
                            showToast(`"${product.name}" ${newStatus ? 'tagged as bestseller' : 'untagged'}.`, 'success');
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            product.isBestSeller
                              ? 'bg-amber-100 text-black'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.isBestSeller ? 'Bestseller' : 'Tag Bestseller'}
                        </button>
                      </td>

                      {/* 7. Actions: Edit, Delete, Duplicate */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View on Store */}
                          <button
                            id={`view-store-${product.id}`}
                            onClick={() => {
                              navigateToProduct(product.id);
                              navigate(`/product/${product.id}`);
                            }}
                            className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="View in Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            id={`edit-prod-${product.id}`}
                            onClick={() => openAdminProductEdit(product.id)}
                            className="p-1.5 text-gray-600 hover:text-[#211C1A] hover:bg-[#D8C8B8]/20 rounded-lg transition cursor-pointer"
                            title="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Duplicate */}
                          <button
                            id={`dup-prod-${product.id}`}
                            onClick={() => handleDuplicate(product.id, product.name)}
                            className="p-1.5 text-gray-600 hover:text-[#211C1A] hover:bg-[#D8C8B8]/20 rounded-lg transition cursor-pointer"
                            title="Duplicate product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`del-prod-${product.id}`}
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 text-gray-600 hover:text-rose-700 hover:bg-[#D8C8B8]/20 rounded-lg transition cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-\[#FAF7F2\] rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#D8C8B8]/40 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-serif text-lg font-bold text-gray-900">Delete Product?</h4>
              <p className="text-xs text-gray-500">
                This will permanently remove the item from catalog and customer storefront.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = products.find((p) => p.id === deleteConfirmId);
                  if (target) handleDelete(target.id, target.name);
                }}
                className="flex-1 py-2 rounded-xl bg-\[#800020\] text-white text-xs font-bold hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
