#RecipeNote

About the website
1. Home page (CRUD: Read, Add and Edit)
 - Sorting recipes is avaliable by title, cooking time and culture.
 - A page with note and feedback will be opened when clicking on\ a recipe. On that page, new notes can be created. 
2. Sorter page
- Use a query like ?by=score, ?by=culture on the Home page to recieve\ the parameter for db.query in .js to get sorted result render on a page.\ Instead of creating three sorter pages and three routes. 
3. Note page (CRUD: Read, Add and Edit)
 - Create a link using ejs: href="recipes/<%= recipe.id %>/notes/".\ It passes the corresponding id when the user click on the recipe title on Home page.\ Then, the id will be sent to the app.get('/recipes/:id/notes')\ and db will render all notes associate with that particular recipe id.\ I have created the one to many relationship for each recipe and its notes. 
 - In .js file, use const { by } = req.query; to get the column/sorter. 
 - Each note has an Edit button
  - Clicking it opens a popup form with the existing note and\ feedback filled in for user to update.


The webside setup
1. In a new dir, touch index.js
2. Initialise npm -y
3. Install express, also, insert "type": "module" in the package.json file
4. Write Server application in index.js
5. Start server
6. Plan and setup database using Postgres
7. Connect database with pg package
8. npm i ejs to enable Express to use embedded JS. The ejs files go under view folder
9. Using a pubilc API for recipe image with Axios




