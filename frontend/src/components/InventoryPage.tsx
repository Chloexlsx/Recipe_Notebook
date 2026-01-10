import { useState, useEffect } from 'react';
import type { InventoryItem, Ingredient, CreateInventoryItemData } from '../types';
import { apiService } from '../services/api';

export const InventoryPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateInventoryItemData>({
    ingredient_id: 0,
    location: 'fridge',
    quantity: 0,
    unit: '',
    purchase_date: null,
    expiry_date: null,
    opened: false,
    note: null,
  });

  useEffect(() => {
    loadInventoryItems();
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await apiService.getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error('Error loading ingredients:', err);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInventoryItems();
      setInventoryItems(data);
    } catch (err) {
      setError('Failed to load inventory items');
      console.error('Error loading inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.createInventoryItem(formData);
      await loadInventoryItems();
      setSuccessMessage('Inventory item added successfully!');
      setShowAddForm(false);
      // 重置表單
      setFormData({
        ingredient_id: 0,
        location: 'fridge',
        quantity: 0,
        unit: '',
        purchase_date: null,
        expiry_date: null,
        opened: false,
        note: null,
      });
      // 清除成功訊息（3秒後）
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to add inventory item');
      console.error('Error adding inventory item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'quantity') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'ingredient_id') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
  };

  return (
    <div className="min-h-screen py-8">
      <main className="max-w-6xl mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">My Fridge/Pantry</h1>
        </header>

        <div className="text-center mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="glass-button text-black"
          >
            {showAddForm ? 'Cancel' : '➕ Add Inventory Item'}
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="glass-card p-6 mb-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-bold mb-1">Ingredient:</label>
                <select
                  name="ingredient_id"
                  value={formData.ingredient_id}
                  onChange={handleFormChange}
                  required
                  className="p-2 rounded border border-gray-300 bg-white/40"
                >
                  <option value="0">Please select an ingredient</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-bold mb-1">Location:</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                  className="p-2 rounded border border-gray-300 bg-white/40"
                >
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-bold mb-1">Quantity:</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    min="0"
                    step="0.001"
                    required
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-1">Unit:</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    placeholder="e.g., g, ml, pcs"
                    required
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-bold mb-1">Purchase Date:</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date || ''}
                    onChange={handleFormChange}
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date || ''}
                    onChange={handleFormChange}
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="opened"
                  checked={formData.opened}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                <label className="font-bold">Opened</label>
              </div>

              <div className="flex flex-col">
                <label className="font-bold mb-1">Note:</label>
                <textarea
                  name="note"
                  value={formData.note || ''}
                  onChange={handleFormChange}
                  className="p-2 rounded border border-gray-300 bg-white/40 min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="submit"
                  className="glass-button text-black"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      ingredient_id: 0,
                      location: 'fridge',
                      quantity: 0,
                      unit: '',
                      purchase_date: null,
                      expiry_date: null,
                      opened: false,
                      note: null,
                    });
                  }}
                  className="glass-button text-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading inventory items...</div>
          </div>
        ) : (
          <div>
            {inventoryItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg">No inventory items found.</p>
                <p className="text-sm text-gray-600 mt-2">Your inventory is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventoryItems.map((item) => (
                  <div key={item.id} className="glass-card p-4">
                    <h3 className="text-lg font-bold mb-2">
                      {item.ingredient_name || `Ingredient ID: ${item.ingredient_id}`}
                    </h3>
                    <p className="text-sm">Location: {item.location}</p>
                    <p className="text-sm">Quantity: {item.quantity} {item.unit}</p>
                    {item.expiry_date && (
                      <p className="text-sm">Expiry: {new Date(item.expiry_date).toLocaleDateString()}</p>
                    )}
                    {item.note && (
                      <p className="text-sm mt-2">Note: {item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
