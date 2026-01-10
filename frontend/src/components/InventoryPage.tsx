import { useState, useEffect, useRef } from 'react';
import type { InventoryItem, Ingredient, CreateInventoryItemData, UpdateInventoryItemData } from '../types';
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

  // Search related states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // Edit related states
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editFormData, setEditFormData] = useState<CreateInventoryItemData>({
    ingredient_id: 0,
    location: 'fridge',
    quantity: 0,
    unit: '',
    purchase_date: null,
    expiry_date: null,
    opened: false,
    note: null,
  });
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [editSearchResults, setEditSearchResults] = useState<Ingredient[]>([]);
  const [editIsSearching, setEditIsSearching] = useState(false);
  const [editShowSearchResults, setEditShowSearchResults] = useState(false);
  const [editSelectedIngredient, setEditSelectedIngredient] = useState<Ingredient | null>(null);
  const editSearchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await apiService.searchIngredients(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Error searching ingredients:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounce edit search
  useEffect(() => {
    if (editSearchQuery.trim() === '') {
      setEditSearchResults([]);
      setEditShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setEditIsSearching(true);
        const results = await apiService.searchIngredients(editSearchQuery);
        setEditSearchResults(results);
        setEditShowSearchResults(true);
      } catch (err) {
        console.error('Error searching ingredients:', err);
        setEditSearchResults([]);
      } finally {
        setEditIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [editSearchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (editSearchInputRef.current && !editSearchInputRef.current.contains(event.target as Node)) {
        setEditShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData(prev => ({ ...prev, ingredient_id: ingredient.id }));
    setSearchQuery(ingredient.name);
    setShowSearchResults(false);
  };

  const handleCreateNewIngredient = async () => {
    if (searchQuery.trim() === '') return;
    
    try {
      setIsSearching(true);
      const newIngredient = await apiService.createIngredient(searchQuery.trim());
      handleIngredientSelect(newIngredient);
    } catch (err) {
      setError('Failed to create ingredient');
      console.error('Error creating ingredient:', err);
    } finally {
      setIsSearching(false);
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
    
    // Validate ingredient is selected
    if (!selectedIngredient || formData.ingredient_id === 0) {
      setError('Please select or create an ingredient');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.createInventoryItem(formData);
      await loadInventoryItems();
      setSuccessMessage('Inventory item added successfully!');
      setShowAddForm(false);
      // Reset form
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
      setSearchQuery('');
      setSelectedIngredient(null);
      setShowSearchResults(false);
      // Clear success message after 3 seconds
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

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    // Find the ingredient name for the search query
    const ingredient = ingredients.find(ing => ing.id === item.ingredient_id);
    setEditSearchQuery(item.ingredient_name || '');
    setEditSelectedIngredient(ingredient || null);
    
    // Convert dates to YYYY-MM-DD format for HTML date input
    const formatDateForInput = (dateString: string | null): string => {
      if (!dateString) return '';
      // Extract YYYY-MM-DD from date string (handles both ISO format and YYYY-MM-DD)
      return dateString.substring(0, 10);
    };
    
    setEditFormData({
      ingredient_id: item.ingredient_id,
      location: item.location,
      quantity: item.quantity,
      unit: item.unit,
      purchase_date: formatDateForInput(item.purchase_date),
      expiry_date: formatDateForInput(item.expiry_date),
      opened: item.opened,
      note: item.note,
    });
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    // Validate ingredient is selected
    if (!editSelectedIngredient || editFormData.ingredient_id === 0) {
      setError('Please select or create an ingredient');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.updateInventoryItem(editingItem.id, editFormData);
      await loadInventoryItems();
      setSuccessMessage('Inventory item updated successfully!');
      setEditingItem(null);
      // Reset edit form
      setEditFormData({
        ingredient_id: 0,
        location: 'fridge',
        quantity: 0,
        unit: '',
        purchase_date: null,
        expiry_date: null,
        opened: false,
        note: null,
      });
      setEditSearchQuery('');
      setEditSelectedIngredient(null);
      setEditShowSearchResults(false);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update inventory item');
      console.error('Error updating inventory item:', err);
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

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'quantity') {
      setEditFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'ingredient_id') {
      setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value || null }));
    }
  };

  const handleEditIngredientSelect = (ingredient: Ingredient) => {
    setEditSelectedIngredient(ingredient);
    setEditFormData(prev => ({ ...prev, ingredient_id: ingredient.id }));
    setEditSearchQuery(ingredient.name);
    setEditShowSearchResults(false);
  };

  const handleEditCreateNewIngredient = async () => {
    if (editSearchQuery.trim() === '') return;
    
    try {
      setEditIsSearching(true);
      const newIngredient = await apiService.createIngredient(editSearchQuery.trim());
      handleEditIngredientSelect(newIngredient);
    } catch (err) {
      setError('Failed to create ingredient');
      console.error('Error creating ingredient:', err);
    } finally {
      setEditIsSearching(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    const confirmMessage = `Are you sure you want to delete "${item.ingredient_name || `Item ID: ${item.id}`}"?\n\nNote: This will only delete the inventory item. The ingredient will remain in the database.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.deleteInventoryItem(item.id);
      await loadInventoryItems();
      setSuccessMessage('Inventory item deleted successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory item';
      setError(`Failed to delete inventory item: ${errorMessage}`);
      console.error('Error deleting inventory item:', err);
    } finally {
      setLoading(false);
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
              <div className="flex flex-col relative">
                <label className="font-bold mb-1">Ingredient:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIngredient(null);
                    setFormData(prev => ({ ...prev, ingredient_id: 0 }));
                  }}
                  onFocus={() => {
                    if (searchQuery.trim() !== '') {
                      setShowSearchResults(true);
                    }
                  }}
                  placeholder="Search ingredient..."
                  required
                  className="p-2 rounded border border-gray-300 bg-white/40"
                />
                
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-2 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((ing) => (
                          <div
                            key={ing.id}
                            onClick={() => handleIngredientSelect(ing)}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                          >
                            {ing.name}
                          </div>
                        ))}
                      </>
                    ) : searchQuery.trim() !== '' ? (
                      <div className="p-2">
                        <div className="text-gray-500 mb-2">No results found</div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleCreateNewIngredient}
                            className="w-auto rounded-lg px-3 py-2 font-bold text-black text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg border-2"
                            disabled={isSearching}
                            style={{ 
                              backgroundColor: '#e9c46a',
                              borderColor: '#e9c46a',
                            }}
                          >
                            Create "{searchQuery.trim()}"
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {selectedIngredient && (
                  <input
                    type="hidden"
                    name="ingredient_id"
                    value={selectedIngredient.id}
                  />
                )}
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
                    setSearchQuery('');
                    setSelectedIngredient(null);
                    setShowSearchResults(false);
                  }}
                  className="glass-button text-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {editingItem && (
          <div className="glass-card p-6 mb-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Edit Inventory Item</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="flex flex-col relative" ref={editSearchInputRef}>
                <label className="font-bold mb-1">Ingredient:</label>
                <input
                  type="text"
                  value={editSearchQuery}
                  onChange={(e) => {
                    setEditSearchQuery(e.target.value);
                    setEditSelectedIngredient(null);
                    setEditFormData(prev => ({ ...prev, ingredient_id: 0 }));
                  }}
                  onFocus={() => {
                    if (editSearchQuery.trim() !== '') {
                      setEditShowSearchResults(true);
                    }
                  }}
                  placeholder="Search ingredient..."
                  required
                  className="p-2 rounded border border-gray-300 bg-white/40"
                />
                
                {editShowSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                    {editIsSearching ? (
                      <div className="p-2 text-center text-gray-500">Searching...</div>
                    ) : editSearchResults.length > 0 ? (
                      <>
                        {editSearchResults.map((ing) => (
                          <div
                            key={ing.id}
                            onClick={() => handleEditIngredientSelect(ing)}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                          >
                            {ing.name}
                          </div>
                        ))}
                      </>
                    ) : editSearchQuery.trim() !== '' ? (
                      <div className="p-2">
                        <div className="text-gray-500 mb-2">No results found</div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleEditCreateNewIngredient}
                            className="w-auto rounded-lg px-3 py-2 font-bold text-black text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg border-2"
                            disabled={editIsSearching}
                            style={{
                              backgroundColor: '#e9c46a',
                              borderColor: '#e9c46a',
                            }}
                          >
                            Create "{editSearchQuery.trim()}"
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="font-bold mb-1">Location:</label>
                <select
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditFormChange}
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
                    value={editFormData.quantity}
                    onChange={handleEditFormChange}
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
                    value={editFormData.unit}
                    onChange={handleEditFormChange}
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
                    value={editFormData.purchase_date || ''}
                    onChange={handleEditFormChange}
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={editFormData.expiry_date || ''}
                    onChange={handleEditFormChange}
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="opened"
                  checked={editFormData.opened}
                  onChange={handleEditFormChange}
                  className="mr-2"
                />
                <label className="font-bold">Opened</label>
              </div>

              <div className="flex flex-col">
                <label className="font-bold mb-1">Note:</label>
                <textarea
                  name="note"
                  value={editFormData.note || ''}
                  onChange={handleEditFormChange}
                  placeholder="Optional notes..."
                  className="p-2 rounded border border-gray-300 bg-white/40 min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="submit"
                  className="glass-button text-black"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setEditFormData({
                      ingredient_id: 0,
                      location: 'fridge',
                      quantity: 0,
                      unit: '',
                      purchase_date: null,
                      expiry_date: null,
                      opened: false,
                      note: null,
                    });
                    setEditSearchQuery('');
                    setEditSelectedIngredient(null);
                    setEditShowSearchResults(false);
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
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="glass-button text-black"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="glass-button text-black bg-red-100/40"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
