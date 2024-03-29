# booknotes

This is a Capstone project that I did as part of the bootcamp course from App Brewery: The Complete 2024 Web Development Bootcamp. The techonolies I used for this are: Express/NodeJS for the serverside, PostgreSQL for the database, and simple HTML, CSS, and JS with Bootstrap for the Frontend desing, adding EJS as templating system. I also implemented the use of the Covers API from Public Library.

On this course I created a book notes project that allows me to register books that I have read, it includes:

    Title: "",
    Author: "",
    OLID: "",
    Review: "",

    A set of genres set a booleans to be selected: novel, short story, drama, fiction, fantasy, suspense, terror, slice of life and romance.

    Rating: ["Bad", "Nothing impressive", "Good", "Loved it!", "Favorite book"]

The data base for this project contemplates two simple tables, one for the books, and one for the admin user (me).

I started by creating my user for this site, I used a script to hash my password and then manually added the credentials to the database. For this I used the BYCRIPT library.

After that I started to work on the Frontend desing of my application, I created a views folder that included my main views and added an extra "partials" folder that holds my <head> and <footer>. I used Bootstrap as my helper for CSS and JS, to easily get hold for all the components I needed, and to have a responsive web page.

Once I had all of the main views I started to configure their corresponding routes on my index.js, by this point I only had the "/login" routes set, which I tested previously when I was implementing the authentification part with bycript and express-session.

The routes created contemplate the regular CRUD functions, on this project you can find the following routes:

app.get("/", async (req, res) => {
Recover the books data from my database, and shows the user the listed books, as well as brief introduction and my contact information.
});

app.get("/indexAdmin", requireAuth, async (req, res) => {

    As you can see this route requieres authentication, this is he index view for the admin (me), from here I get access to the edit and delete options, if you try to go directly to this route you will be redirected to the
    /login route, after succefull login you can then access this view.

});

app.get("/create", requireAuth, (req, res) => {

    Same as the indexAdmin route, you need to be authenticaded to directly tap in into this route, from here you get access to the corresponding form to add a new book.

});

app.get("/search", async (req, res) => {

    The search route redirect you to a especific EJS template called search, that will show you the corresponding result, you can search by book title, author, or rating.

});

app.get("/login", (req, res) => {

This it the loging route in charge of redirecting the user to the login page in case they haven't logged in yet. There is no function to register as this is a personal book notes diary for myself, new user can only be added through the data base.

});

app.post("/login", async (req, res) => {

This route validated the credentials entered on the login form and redirects you the indexAdmin in case of a sucessfull login.

});

app.post("/create", async (req, res) => {

    The create route that manages the logic to push new info into the data base, it recovers the data from the create form and adds it to the book table in my database, after that it redirects you to the indexAdmin view, it also handles errors for you, showing them printed in the console.

});

app.get("/edit/:id", requireAuth, async (req, res) => {

    Edit view that you can access through the indexAdmin view, it takes you the edit page where you can see the same form that you get from the create view, only that the fiels are already populated with the information that was previously saved.

});

app.post("/edit", async (req, res) => {

    This is the edit route that handles the post logic to save changes in the databse.

});

// Ruta para eliminar un libro
app.post("/delete/:id", async (req, res) => {

    Delete route, this function can be accesed throght the indexAdmin page, and it simply removes entries from the database.

});

For this project I used a lot of documentation available from the Web Development Bootcamp course that I am currently taking, and also ChatGPT for troubleshooting and gidance.
