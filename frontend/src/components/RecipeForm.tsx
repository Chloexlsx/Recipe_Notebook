import { useState } from 'react';
import type { Recipe, CreateRecipeData, UpdateRecipeData } from '../types';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: CreateRecipeData | UpdateRecipeData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ 
  recipe, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: recipe?.title || '',
    cook_time_mins: recipe?.cook_time_mins || 0,
    culture: recipe?.culture || '',
    score: recipe?.score || 0,
    link: recipe?.link || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cook_time_mins' || name === 'score' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="glass-card p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEditing ? 'Update Recipe' : 'Add New Recipe'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="font-bold mb-1">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Chicken Curry"
            required
            className="p-2 rounded border border-gray-300 bg-white/40"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold mb-1">Cook Time (mins):</label>
          <input
            type="number"
            name="cook_time_mins"
            value={formData.cook_time_mins}
            onChange={handleChange}
            placeholder="required"
            required
            className="p-2 rounded border border-gray-300 bg-white/40"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold mb-1">Culture:</label>
          <input
            type="text"
            name="culture"
            value={formData.culture}
            onChange={handleChange}
            className="p-2 rounded border border-gray-300 bg-white/40"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold mb-1">Score:</label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={handleChange}
            placeholder="max: 5"
            min="0"
            max="5"
            className="p-2 rounded border border-gray-300 bg-white/40"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold mb-1">Source URL (Instructions):</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="p-2 rounded border border-gray-300 bg-white/40"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            type="submit"
            className="glass-button text-black"
          >
            {isEditing ? 'Save Changes' : 'Add Recipe'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="glass-button text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
