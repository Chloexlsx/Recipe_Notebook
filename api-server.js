import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';
import methodOverride from 'method-override';
import cors from 'cors';
import { dbConfig, serverConfig } from './config.js';


const app = express();
const PORT = serverConfig.port;

const db = new pg.Client(dbConfig);

// Connect to database with error handling
db.connect()
    .then(() => {
        console.log('✅ Connected to PostgreSQL database');
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err.message);
        console.log('\n🔧 To fix this issue:');
        console.log('1. Make sure PostgreSQL is running');
        console.log('2. Update the password in config.js');
        console.log('3. Verify your database credentials');
        console.log('\n⚠️  Server will continue to run, but database operations will fail.');
        // Don't exit - let server start so we can see the error
    });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Helper function to fetch recipe images
async function fetchRecipeImages(recipes) {
    return Promise.all(
        recipes.map(async recipe => {
            const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipe.title)}`;
            
            try {
                const apiRes = await axios.get(apiUrl);
                const meals = apiRes.data.meals;
                recipe.imgUrl = meals?.[0]?.strMealThumb ?? null;
            } catch {
                recipe.imgUrl = null;
            }
            return recipe;
        })
    );
}

// API Routes

// Get all recipes
app.get('/recipes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM recipes');
        const recipes = result.rows;
        const recipesWithImages = await fetchRecipeImages(recipes);
        res.json(recipesWithImages);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Get recipes sorted by field
app.get('/recipes/sort', async (req, res) => {
    const { by } = req.query;
    const validSortFields = ['cook_time_mins', 'culture', 'score', 'title'];
    
    if (!validSortFields.includes(by)) {
        return res.status(400).json({ error: 'Invalid sort field' });
    }
    
    try {
        // Sort score in descending order (highest first), others in ascending
        const orderDirection = by === 'score' ? 'DESC' : 'ASC';
        const result = await db.query(`SELECT * FROM recipes ORDER BY ${by} ${orderDirection}`);
        const recipes = result.rows;
        const recipesWithImages = await fetchRecipeImages(recipes);
        res.json(recipesWithImages);
    } catch (err) {
        console.error('Error fetching sorted recipes:', err);
        res.status(500).json({ error: 'Failed to fetch sorted recipes' });
    }
});

// Get single recipe
app.get('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        const recipe = result.rows[0];
        const recipesWithImages = await fetchRecipeImages([recipe]);
        res.json(recipesWithImages[0]);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

// Create new recipe
app.post('/recipes', async (req, res) => {
    const { title, cook_time_mins, culture, score, link } = req.body;
    
    if (!title || !cook_time_mins) {
        return res.status(400).json({ error: 'Title and cook time are required' });
    }
    
    try {
        const result = await db.query(
            'INSERT INTO recipes (title, cook_time_mins, culture, score, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, cook_time_mins, culture, score, link]
        );
        const recipe = result.rows[0];
        const recipesWithImages = await fetchRecipeImages([recipe]);
        res.status(201).json(recipesWithImages[0]);
    } catch (err) {
        console.error('Error creating recipe:', err);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});

// Update recipe
app.put('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, cook_time_mins, culture, score, link } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE recipes SET title=$1, cook_time_mins=$2, culture=$3, score=$4, link=$5 WHERE id=$6 RETURNING *',
            [title, cook_time_mins, culture, score, link, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        const recipe = result.rows[0];
        const recipesWithImages = await fetchRecipeImages([recipe]);
        res.json(recipesWithImages[0]);
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
});

// Get notes for a recipe
app.get('/recipes/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM notes WHERE recipe_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Create new note
app.post('/recipes/:id/notes', async (req, res) => {
    const { id } = req.params;
    const { note, feedback } = req.body;
    
    if (!note) {
        return res.status(400).json({ error: 'Note content is required' });
    }
    
    try {
        const result = await db.query(
            'INSERT INTO notes (recipe_id, note, feedback) VALUES ($1, $2, $3) RETURNING *',
            [id, note, feedback]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating note:', err);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Update note
app.put('/notes/:id', async (req, res) => {
    const { id } = req.params;
    const { note, feedback } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE notes SET note = $1, feedback = $2 WHERE id = $3 RETURNING *',
            [note, feedback, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete note
app.delete('/notes/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note deleted successfully', note: result.rows[0] });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Get ingredients list (for dropdown)
app.get('/ingredients', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name FROM ingredients ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});

// Search ingredients (case-insensitive search)
app.get('/ingredients/search', async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        return res.json([]);
    }
    
    try {
        const searchTerm = `%${q.trim()}%`;
        const result = await db.query(
            'SELECT id, name FROM ingredients WHERE name ILIKE $1 ORDER BY name LIMIT 10',
            [searchTerm]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error searching ingredients:', err);
        res.status(500).json({ error: 'Failed to search ingredients' });
    }
});

// Create new ingredient
app.post('/ingredients', async (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Ingredient name is required' });
    }
    
    try {
        // Check if ingredient already exists (case-insensitive)
        const existing = await db.query(
            'SELECT id, name FROM ingredients WHERE LOWER(name) = LOWER($1)',
            [name.trim()]
        );
        
        if (existing.rows.length > 0) {
            // Return existing ingredient instead of creating duplicate
            return res.json(existing.rows[0]);
        }
        
        // Create new ingredient
        const result = await db.query(
            'INSERT INTO ingredients (name) VALUES ($1) RETURNING id, name',
            [name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating ingredient:', err);
        res.status(500).json({ error: 'Failed to create ingredient' });
    }
});

// Get inventory items
app.get('/inventory_items', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                ii.id,
                ii.ingredient_id,
                ing.name AS ingredient_name,
                ii.location,
                ii.quantity,
                ii.unit,
                ii.purchase_date,
                ii.expiry_date,
                ii.opened,
                ii.note,
                ii.created_at,
                ii.updated_at
            FROM public.inventory_items ii
            JOIN public.ingredients ing ON ing.id = ii.ingredient_id
            ORDER BY ii.location, ing.name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory items:', err);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
});

// Create new inventory item
app.post('/inventory_items', async (req, res) => {
    const { ingredient_id, location, quantity, unit, purchase_date, expiry_date, opened, note } = req.body;
    
    if (!ingredient_id || !location || quantity === undefined || !unit) {
        return res.status(400).json({ error: 'ingredient_id, location, quantity, and unit are required' });
    }
    
    // Validate location
    if (!['fridge', 'freezer', 'pantry'].includes(location)) {
        return res.status(400).json({ error: 'location must be fridge, freezer, or pantry' });
    }
    
    try {
        const result = await db.query(
            `INSERT INTO inventory_items 
             (ingredient_id, location, quantity, unit, purchase_date, expiry_date, opened, note) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [ingredient_id, location, quantity, unit, purchase_date || null, expiry_date || null, opened || false, note || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
});

// Update inventory item
app.put('/inventory_items/:id', async (req, res) => {
    const { id } = req.params;
    const { ingredient_id, location, quantity, unit, purchase_date, expiry_date, opened, note } = req.body;
    
    if (!ingredient_id || !location || quantity === undefined || !unit) {
        return res.status(400).json({ error: 'ingredient_id, location, quantity, and unit are required' });
    }
    
    // Validate location
    if (!['fridge', 'freezer', 'pantry'].includes(location)) {
        return res.status(400).json({ error: 'location must be fridge, freezer, or pantry' });
    }
    
    try {
        const result = await db.query(
            `UPDATE inventory_items 
             SET ingredient_id = $1, location = $2, quantity = $3, unit = $4, 
                 purchase_date = $5, expiry_date = $6, opened = $7, note = $8
             WHERE id = $9 
             RETURNING *`,
            [ingredient_id, location, quantity, unit, purchase_date || null, expiry_date || null, opened || false, note || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
});

// Delete inventory item
app.delete('/inventory_items/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /inventory_items/${id} - Request received`);
    
    try {
        // First check if the item exists
        const checkResult = await db.query('SELECT id FROM inventory_items WHERE id = $1', [id]);
        console.log(`Checking if item ${id} exists:`, checkResult.rows.length > 0);
        
        if (checkResult.rows.length === 0) {
            console.log(`Item ${id} not found`);
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        
        // Delete only from inventory_items table (ingredients table is not affected)
        const result = await db.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
        console.log(`Item ${id} deleted successfully`);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        
        res.json({ message: 'Inventory item deleted successfully', deletedItem: result.rows[0] });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        console.error('Error details:', err.message);
        res.status(500).json({ 
            error: 'Failed to delete inventory item',
            details: err.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Recipe Notes API is running' });
});

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}