import type { Recipe, Note, CreateRecipeData, CreateNoteData, UpdateRecipeData, UpdateNoteData, SortField, InventoryItem, Ingredient, CreateInventoryItemData, UpdateInventoryItemData } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  // Recipe endpoints
  async getRecipes(): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    return response.json();
  }

  async getRecipesSorted(by: SortField): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}/recipes/sort?by=${by}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sorted recipes');
    }
    return response.json();
  }

  async getRecipe(id: number): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    return response.json();
  }

  async createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
      throw new Error('Failed to create recipe');
    }
    return response.json();
  }

  async updateRecipe(id: number, recipeData: UpdateRecipeData): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
      throw new Error('Failed to update recipe');
    }
    return response.json();
  }

  // Note endpoints
  async getNotes(recipeId: number): Promise<Note[]> {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/notes`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  }

  async createNote(recipeId: number, noteData: CreateNoteData): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    return response.json();
  }

  async updateNote(id: number, noteData: UpdateNoteData): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return response.json();
  }

  async deleteNote(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  }

  // Inventory endpoints
  async getIngredients(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    if (!response.ok) {
      throw new Error('Failed to fetch ingredients');
    }
    return response.json();
  }

  async searchIngredients(query: string): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search ingredients');
    }
    return response.json();
  }

  async createIngredient(name: string): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create ingredient');
    }
    return response.json();
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/inventory_items`);
    if (!response.ok) {
      throw new Error('Failed to fetch inventory items');
    }
    return response.json();
  }

  async createInventoryItem(itemData: CreateInventoryItemData): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to create inventory item');
    }
    return response.json();
  }

  async updateInventoryItem(id: number, itemData: UpdateInventoryItemData): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to update inventory item');
    }
    return response.json();
  }

  async deleteInventoryItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/inventory_items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.details || errorData.error || 'Failed to delete inventory item';
      throw new Error(errorMessage);
    }
  }
}

export const apiService = new ApiService();
