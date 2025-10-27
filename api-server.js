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
        process.exit(1);
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
        const result = await db.query(`SELECT * FROM recipes ORDER BY ${by} ASC`);
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Recipe Notes API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
