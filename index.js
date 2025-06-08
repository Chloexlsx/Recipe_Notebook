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

//Where to find the views = template files
app.set('views', path.join(__dirname, 'views'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

//Main page
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
                    
                    //add imgUrl to recipe object
                    recipe.imgUrl = meals?.[0]?.strMealThumb ?? null;
                }catch{
                    recipe.imgUrl = null;
                }
                //Extremly important to return the new array of recipes with images
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
//Sort by Cooktime
app.get('/by_cooktime', async(req, res)=> {
    try 
    {const result = await db.query('SELECT * FROM recipes ORDER BY cook_time_mins ASC')
    res.render('byCooktime', {recipes: result.rows})
    }catch(err){
        console.error('err');
        res.status(500).send('Server Error.');
}});



app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);}
);
