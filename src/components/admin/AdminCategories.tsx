import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  Save,
  ArrowRight
} from 'lucide-react';
import { CategoryItem, ProductCategory } from '../../types';

export const AdminCategories: React.FC = () => {
  const { categories = [], addCategory, updateCategory, deleteCategory, products = [] } = useAdmin();
  const { showToast, navigateToCategory } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<CategoryItem, 'id'>>({
    name: 'Suits',
    title: 'Suits',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    itemCount: '24 Designs',
    tagline: 'Pure cotton & silk drapes',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingCatId(null);
    setFormData({
      name: 'Suits',
      title: 'New Ethnic Silhouette',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      itemCount: '15 Designs',
      tagline: 'Artisanal weaves & drapes',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setFormData({
      name: cat.name,
      title: cat.title,
      image: cat.image,
      itemCount: cat.itemCount,
      tagline: cat.tagline,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Category title is required.', 'error');
      return;
    }

    if (editingCatId) {
      updateCategory(editingCatId, formData);
      showToast(`Category "${formData.title}" updated.`, 'success');
    } else {
      addCategory(formData);
      showToast(`Category "${formData.title}" created.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (cat: CategoryItem) => {
    if (categories.length <= 1) {
      showToast('Storefront requires at least 1 category.', 'error');
      return;
    }
    deleteCategory(cat.id);
    showToast(`Category "${cat.title}" removed.`, 'info');
  };

  const getActualProductCount = (catName: ProductCategory) => {
    return products.filter((p) => p.category === catName).length;
  };

  return (
    <div id="admin-categories-page" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-\[#FAF7F2\] p-5 rounded-2xl border border-rose-100 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B2635]">
            Taxonomy & Navigation
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Category Management ({categories.length})
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const liveCount = getActualProductCount(cat.name);
          return (
            <div
              key={cat.id}
              className="bg-\[#FAF7F2\] rounded-2xl border border-rose-100 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
            >
              {/* Category Image Banner */}
              <div className="relative h-44 overflow-hidden bg-[#D8C8B8]/20">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!cat.image ? 'hidden' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  cat.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-serif text-lg font-bold leading-snug">
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-rose-100 truncate">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Body stats & controls */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Assigned Catalog:</span>
                  <span className="font-bold text-[#211C1A]">
                    {liveCount} Products live
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      updateCategory(cat.id, { isActive: !cat.isActive });
                      showToast(`Category "${cat.title}" ${!cat.isActive ? 'enabled' : 'hidden'}.`, 'info');
                    }}
                    className={`text-[11px] font-bold px-2 py-1 rounded-md transition ${
                      cat.isActive ? 'text-black hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {cat.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#211C1A]"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 hover:bg-[#D8C8B8]/20 rounded-lg text-gray-400 hover:text-\[#800020\]"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-\[#FAF7F2\] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                {editingCatId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Festive Wear"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Category Slug / Enum Name *</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as ProductCategory })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-\[#FAF7F2\]"
                >
                  <option value="Suits">Suits</option>
                  <option value="Kurtis">Kurtis</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Anarkali">Anarkali</option>
                  <option value="Dupatta Sets">Dupatta Sets</option>
                  <option value="Co-ord Sets">Co-ord Sets</option>
                  <option value="Festive Wear">Festive Wear</option>
                  <option value="Party Wear">Party Wear</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Category Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Tagline / Short Summary</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Royal zari, banarasi weaves & lehengas"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#211C1A] focus:ring-[#241D1B]"
                  />
                  <span>Category Visible in Store Navigation</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Category
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
