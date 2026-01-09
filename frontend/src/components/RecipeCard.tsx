import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onViewNotes: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit, onViewNotes }) => {
  return (
    <div className="glass-card p-4 flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
      <h3 className="text-lg font-bold text-center">
        <button
          onClick={() => onViewNotes(recipe)}
          className="glass-button text-black"
        >
          {recipe.title}
        </button>
      </h3>
      <p className="text-sm">Cook Time: {recipe.cook_time_mins} mins</p>
      <p className="text-sm">Culture: {recipe.culture}</p>
      <p className="text-sm">Score: {recipe.score}</p>
      {recipe.imgUrl && (
        <img
          src={recipe.imgUrl}
          alt={`${recipe.title} recipe`}
          className="w-24 h-24 object-cover rounded-lg"
        />
      )}
      <button
        onClick={() => onEdit(recipe)}
        className="glass-button text-black"
      >
        Edit
      </button>
    </div>
  );
};
