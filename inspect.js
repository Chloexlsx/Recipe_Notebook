import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Recipe",
  password: "0421",
  port: 5432,
})
db.connect();

(async ()=>{
  try {
    const result = await db.query('SELECT * FROM recipes');
    res.render('index', { recipes: result.rows })
    console.log(result.rows);
  }catch (error) {
  console.error("Error executing query", error.stack);
} finally {
  await db.end();
}
})();