export interface Recipe {
  id: number;
  title: string;
  cook_time_mins: number;
  culture: string;
  score: number;
  link: string;
  imgUrl?: string;
}

export interface Note {
  id: number;
  recipe_id: number;
  note: string;
  feedback: string;
}

export interface CreateRecipeData {
  title: string;
  cook_time_mins: number;
  culture: string;
  score: number;
  link: string;
}

export interface CreateNoteData {
  note: string;
  feedback: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

export type SortField = 'cook_time_mins' | 'culture' | 'score' | 'title';

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  ingredient_name: string | null;
  location: 'fridge' | 'freezer' | 'pantry';
  quantity: number;
  unit: string;
  purchase_date: string | null;
  expiry_date: string | null;
  opened: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface CreateInventoryItemData {
  ingredient_id: number;
  location: 'fridge' | 'freezer' | 'pantry';
  quantity: number;
  unit: string;
  purchase_date?: string | null;
  expiry_date?: string | null;
  opened?: boolean;
  note?: string | null;
}
