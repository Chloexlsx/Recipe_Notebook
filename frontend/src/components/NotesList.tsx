import { useState } from 'react';
import type { Recipe, Note, CreateNoteData, UpdateNoteData } from '../types';

interface NotesListProps {
  recipe: Recipe;
  notes: Note[];
  onAddNote: (recipeId: number, data: CreateNoteData) => void;
  onUpdateNote: (noteId: number, data: UpdateNoteData) => void;
  onDeleteNote: (noteId: number) => void;
  onBack: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  recipe,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onBack,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ note: '', feedback: '' });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.note.trim()) {
      onAddNote(recipe.id, newNote);
      setNewNote({ note: '', feedback: '' });
      setShowAddForm(false);
    }
  };

  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote && editingNote.note.trim()) {
      onUpdateNote(editingNote.id, {
        note: editingNote.note,
        feedback: editingNote.feedback,
      });
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDeleteNote(noteId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
        <p className="text-lg">Cook Time: {recipe.cook_time_mins} mins</p>
        <p className="text-lg">Culture: {recipe.culture}</p>
        <p className="text-lg">Score: {recipe.score}</p>
      </header>

      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="glass-button text-black mb-4"
        >
          {showAddForm ? 'Cancel' : 'Add New Note'}
        </button>

        {showAddForm && (
          <div className="glass-card p-4 mb-4">
            <h3 className="text-xl font-bold mb-4">Add a New Note</h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-bold mb-1">Note:</label>
                <textarea
                  value={newNote.note}
                  onChange={(e) => setNewNote(prev => ({ ...prev, note: e.target.value }))}
                  required
                  className="p-2 rounded border border-gray-300 bg-white/40 min-h-[100px]"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold mb-1">Feedback:</label>
                <input
                  type="text"
                  value={newNote.feedback}
                  onChange={(e) => setNewNote(prev => ({ ...prev, feedback: e.target.value }))}
                  className="p-2 rounded border border-gray-300 bg-white/40"
                />
              </div>
              <button type="submit" className="glass-button text-black">
                Add Note
              </button>
            </form>
          </div>
        )}
      </div>

      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="glass-card p-4">
            {editingNote?.id === note.id ? (
              <form onSubmit={handleUpdateNote} className="space-y-4">
                <div className="flex flex-col">
                  <label className="font-bold mb-1">Note:</label>
                  <textarea
                    value={editingNote.note}
                    onChange={(e) => setEditingNote(prev => 
                      prev ? { ...prev, note: e.target.value } : null
                    )}
                    required
                    className="p-2 rounded border border-gray-300 bg-white/40 min-h-[100px]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-bold mb-1">Feedback:</label>
                  <input
                    type="text"
                    value={editingNote.feedback}
                    onChange={(e) => setEditingNote(prev => 
                      prev ? { ...prev, feedback: e.target.value } : null
                    )}
                    className="p-2 rounded border border-gray-300 bg-white/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="glass-button text-black">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="glass-button text-black"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="mb-2"><strong>Note:</strong> {note.note}</p>
                <p className="mb-4">
                  <strong>Feedback:</strong> {note.feedback || 'No one tries it yet, only myself, so it is definitely YUM!!'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="glass-button text-black"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="glass-button text-black bg-red-100/40 hover:bg-red-200/60"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="text-center mt-8">
        <button onClick={onBack} className="glass-button text-black">
          ← Back to all recipes
        </button>
      </div>
    </div>
  );
};
