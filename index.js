import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs'; 
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

const db = new pg.Client(
    {
        user: 'postgres',
        host: 'localhost',
        database: 'Recipe',
        password: '0421',
        port: 5432,
    }
)
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Where to find the views = template files
app.set('views', path.join(__dirname, 'views'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Main page
app.get('/', async (req, res, next) => {
    try{
        // Fetch recipes
        const result = await db.query('SELECT * FROM recipes');
        const recipes = result.rows;
        // Fetch image from public API
        const recipesWithImages = await Promise.all(
            recipes.map(async recipe => {
                // build the URL dynamically
                const apiUrl = 
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipe.title)}`;
                
                try{
                    const apiRes = await axios.get(apiUrl);
                    const meals = apiRes.data.meals;
                    
                    // add imgUrl to recipe object
                    recipe.imgUrl = meals?.[0]?.strMealThumb ?? null;
                }catch{
                    recipe.imgUrl = null;
                }
                // Extremly important to return the new array of recipes with images
                return recipe;
            })
        );
        console.log(recipesWithImages);
        // Render the index page with recipes and images
        res.render('index', {Recipes: recipesWithImages});

    }catch(err){
            console.error('Error fetching recipes:', err);
        }
    });
// Sort by sorter
app.get('/sorter', async(req, res)=> {
    const { by } = req.query;
    // SAFETY: only allow known, safe column names
    const validSortFields = ['cook_time_mins', 'culture', 'score', 'title'];
    if (!validSortFields.includes(by)) {
    return res.status(400).send('Invalid sorter field');}
    
    try{
        const result = await db.query(`SELECT * FROM recipes ORDER BY ${by} ASC`);
        const recipes = result.rows;
        // Fetch image from public API
        const recipesWithImages = await Promise.all(
            recipes.map(async recipe => {
                // build the URL dynamically
                const apiUrl = 
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipe.title)}`;
                
                try{
                    const apiRes = await axios.get(apiUrl);
                    const meals = apiRes.data.meals;
                    
                    //add imgUrl to recipe object
                    recipe.imgUrl = meals?.[0]?.strMealThumb ?? null;
                }catch{
                    recipe.imgUrl = null;
                }
                //Extremly important to return the new array of recipes with images
                return recipe;
            })
        );
        // Render the index page with recipes and images
        res.render('bySorter', {Recipes: recipesWithImages});
    }catch(err){
        console.error('err');
        res.status(500).send('Server Error.');
}});

// Add recipe page
//show the form to add a new recipe
app.get('/recipes/add', (req, res) => {
    res.render('addRecipe');
})

//Handle the form submission to add a new recipe
app.post('recipes/', async (req, res) => {
    const {title, cook_time_mins, culture, score, link} = req.body;
    try{
        await db.query(
            'INSERT INTO recipes (title, cook_time_mins, culture, score, link) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, cook_time_mins, culture, score, link]);
        res.redirect('/');
    }catch(err) {
        console.error('Error inserting recipe:', err);
        res.status(500).send('Server error while adding recipe');
    }
})
//Note page
//This Get will get notes and feedbacks from the database by recipe id
//Frontend sends the recipe id in the URL, then use id to look for corresponding item
//The result variables shown in backend will have first letter in Capital, and the one goes to frontend uses lower case, just to distinguish.
//The result obtained from the database is usually a list containing many dictionaries. So, in order to access the value, we need to select the dictionary using [0].
app.get('/recipes/:id/notes', async (req, res)=> {
    try{
    const { id } =req.params;
    const Recipe = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    const Note = await db.query('SELECT * FROM notes WHERE recipe_id = $1', [id]);
    res.render('note', {recipes: Recipe.rows[0], notes: Note.rows});
    console.log(Note.rows);
    }catch(err){
        console.error('Error fetching notes:', err);
        res.status(500).send('Server Error555.');
    }
})

//ADD: This post will add notes and feedbacks to the database by recipe id
app.post('/recipes/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { note, feedback } = req.body;

  await db.query(
    'INSERT INTO notes (recipe_id, note, feedback) VALUES ($1, $2, $3)',
    [id, note, feedback]
  );

  res.redirect(`/recipes/${id}/notes`);
});

//UPDATE: This post will update the notes and feedbacks by recipe id
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { note, feedback } = req.body;
  await db.query(
    'UPDATE notes SET note = $1, feedback = $2 WHERE id = $3',
    [note, feedback, id]
  );
  res.redirect('back'); // or `/recipes/:recipe_id/notes` if you want
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);}
);
