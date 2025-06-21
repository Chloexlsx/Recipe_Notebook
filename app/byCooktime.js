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

//Sort by Cook Time
app.get('/by_cooktime', async(req, res)=> {
    try 
    {const result = await db.query('SELECT * FROM recipes ORDER BY cook_time_mins ASC')
    res.render('byCooktime', {recipes: result.rows})
    }catch(err){
        console.error('err');
        res.status(500).send('Server Error.');
}});