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
