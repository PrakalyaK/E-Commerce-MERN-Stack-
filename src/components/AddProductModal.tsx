import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('living');
  const [price, setPrice] = useState('450');
  const [stock, setStock] = useState('10');
  const [badge, setBadge] = useState('New Release');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('White American Oak, Matte Brass');
  const [dimensions, setDimensions] = useState('W 60cm × D 45cm × H 42cm');
  const [origin, setOrigin] = useState('Kyoto Studio, Japan');
  const [image, setImage] = useState('/src/assets/images/prod_sculptural_chair_1794469627632.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          categoryLabel:
            category === 'living'
              ? 'Living & Furniture'
              : category === 'lighting'
              ? 'Lighting & Ambience'
              : category === 'fragrance'
              ? 'Home Fragrance'
              : 'Textiles & Wear',
          price: Number(price),
          stock: Number(stock),
          badge,
          description,
          materials: materials.split(',').map((m) => m.trim()),
          dimensions,
          origin,
          image,
          leadTime: 'Dispatches in 2–3 business days',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to insert document');

      onProductAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error writing to MongoDB collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-stone-50 rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/60">
          <div>
            <h2 className="text-base font-serif text-stone-900">Add New Catalog Product</h2>
            <p className="text-xs text-stone-500 mt-0.5">Inserts a new document directly into MongoDB <code className="font-mono text-[11px]">products</code> collection</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-800 text-xs border-b border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sculptural Travertine Pedestal"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
              >
                <option value="living">Living & Furniture</option>
                <option value="lighting">Lighting & Ambience</option>
                <option value="fragrance">Home Fragrance</option>
                <option value="textiles">Textiles & Wear</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Price (USD)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Stock Units</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Limited Edition"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Craftsmanship, aesthetic intent, and materials..."
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Materials (comma separated)</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Image Asset Choice</label>
            <select
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-500 text-xs"
            >
              <option value="/src/assets/images/prod_sculptural_chair_1794469627632.jpg">Atelier Sculptural Chair</option>
              <option value="/src/assets/images/prod_brass_lamp_1794469627718.jpg">Komorebi Brass Lamp</option>
              <option value="/src/assets/images/prod_amber_diffuser_1794469628960.jpg">Aethel Amber Diffuser</option>
              <option value="/src/assets/images/prod_linen_throw_1794469628016.jpg">Nordic Linen Throw</option>
              <option value="/src/assets/images/hero_lifestyle_lounge_1794469627385.jpg">Fluted Travertine Table</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-stone-900 text-stone-50 font-medium rounded hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Writing to MongoDB...' : 'Insert into Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
