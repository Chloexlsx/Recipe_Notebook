import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Recipe",
  password: "0421",
  port: 5432,
})
db.connect();
import express from 'express';
import axios from 'axios';
const app = express();

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

    }catch(err){
            console.error('Error fetching recipes:', err);
        }
    });