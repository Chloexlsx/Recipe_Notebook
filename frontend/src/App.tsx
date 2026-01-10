import { useState, useEffect } from 'react';
import type { Recipe, Note, CreateRecipeData, CreateNoteData, UpdateRecipeData, UpdateNoteData, SortField } from './types';
import { apiService } from './services/api';
import { RecipeCard } from './components/RecipeCard';
import { RecipeForm } from './components/RecipeForm';
import { NotesList } from './components/NotesList';
import { Navbar } from './components/Navbar';
import { InventoryPage } from './components/InventoryPage';

type View = 'recipes' | 'addRecipe' | 'editRecipe' | 'notes' | 'inventory';

function App() {
  const [currentView, setCurrentView] = useState<View>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load recipes on component mount
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecipes();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSortedRecipes = async (sortBy: SortField) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecipesSorted(sortBy);
      setRecipes(data);
    } catch (err) {
      setError('Failed to load sorted recipes');
      console.error('Error loading sorted recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (recipeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getNotes(recipeId);
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (recipeData: CreateRecipeData) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.createRecipe(recipeData);
      await loadRecipes();
      setCurrentView('recipes');
    } catch (err) {
      setError('Failed to add recipe');
      console.error('Error adding recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecipe = async (recipeData: UpdateRecipeData) => {
    if (!selectedRecipe) return;
    
    try {
      setLoading(true);
      setError(null);
      await apiService.updateRecipe(selectedRecipe.id, recipeData);
      await loadRecipes();
      setCurrentView('recipes');
      setSelectedRecipe(null);
    } catch (err) {
      setError('Failed to update recipe');
      console.error('Error updating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (recipeId: number, noteData: CreateNoteData) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.createNote(recipeId, noteData);
      await loadNotes(recipeId);
    } catch (err) {
      setError('Failed to add note');
      console.error('Error adding note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: number, noteData: UpdateNoteData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.updateNote(noteId, noteData);
      if (selectedRecipe) {
        await loadNotes(selectedRecipe.id);
      }
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await apiService.deleteNote(noteId);
      if (selectedRecipe) {
        await loadNotes(selectedRecipe.id);
      }
      setSuccessMessage('Note deleted successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('editRecipe');
  };

  const handleViewNotes = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    await loadNotes(recipe.id);
    setCurrentView('notes');
  };

  const renderRecipesView = () => (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Chloe's Recipe Notes</h1>
          <h2 className="text-2xl mb-4">Recipes for my family</h2>
          <p className="text-lg mb-6">
            Click on the title of each recipe to see notes with <strong>ingredients and instruction</strong>.
            <br />This page will constantly update as I cook more.
            <br />Use the sorter to access the recipe <strong>suits your current mood and situation the most!</strong>
          </p>
        </header>

        <nav className="flex justify-center gap-4 mb-8 flex-wrap">
          <span className="font-bold">Sort by:</span>
          <button
            onClick={() => loadSortedRecipes('cook_time_mins')}
            className="glass-button text-black"
          >
            Cook Time
          </button>
          <button
            onClick={() => loadSortedRecipes('culture')}
            className="glass-button text-black"
          >
            Culture
          </button>
          <button
            onClick={() => loadSortedRecipes('score')}
            className="glass-button text-black"
          >
            Score
          </button>
          <button
            onClick={() => loadSortedRecipes('title')}
            className="glass-button text-black"
          >
            Title
          </button>
        </nav>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading recipes...</div>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={handleEditRecipe}
                  onViewNotes={handleViewNotes}
                />
              ))}
            </div>
          </section>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentView('addRecipe')}
            className="glass-button text-black"
          >
            Add new recipe
          </button>
        </div>
      </main>

      <footer className="text-center py-8">
        <p>© 2025 Chloe's Recipe Notes</p>
        <p>Made with ❤️ by Chloe</p>
      </footer>
    </div>
  );

  const renderAddRecipeView = () => (
    <div className="min-h-screen py-8">
      <RecipeForm
        onSubmit={async (data) => await handleAddRecipe(data as CreateRecipeData)}
        onCancel={() => setCurrentView('recipes')}
        isEditing={false}
      />
    </div>
  );

  const renderEditRecipeView = () => (
    <div className="min-h-screen py-8">
      <RecipeForm
        recipe={selectedRecipe || undefined}
        onSubmit={async (data) => await handleUpdateRecipe(data as UpdateRecipeData)}
        onCancel={() => {
          setCurrentView('recipes');
          setSelectedRecipe(null);
        }}
        isEditing={true}
      />
    </div>
  );

  const renderNotesView = () => {
    if (!selectedRecipe) return null;
    
    return (
      <div className="min-h-screen py-8">
        {successMessage && (
          <div className="max-w-4xl mx-auto p-4 mb-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          </div>
        )}
        <NotesList
          recipe={selectedRecipe}
          notes={notes}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onBack={() => {
            setCurrentView('recipes');
            setSelectedRecipe(null);
            setNotes([]);
          }}
        />
      </div>
    );
  };

  const handleNavigate = (view: string) => {
    if (view === 'recipes') {
      setCurrentView('recipes');
    } else if (view === 'inventory') {
      setCurrentView('inventory');
    }
  };

  return (
    <div className="App">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      {currentView === 'recipes' && renderRecipesView()}
      {currentView === 'addRecipe' && renderAddRecipeView()}
      {currentView === 'editRecipe' && renderEditRecipeView()}
      {currentView === 'notes' && renderNotesView()}
      {currentView === 'inventory' && <InventoryPage />}
    </div>
  );
}

export default App;