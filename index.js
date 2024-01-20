import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();


const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "mantequilla",
  port: 5432,
});

db.connect();

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar archivos estáticos
app.use(express.static("public"));

app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: false,
}));

// Middleware para verificar la autenticación del usuario
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    // Si no hay un usuario autenticado, redirige a la página de login
    res.redirect("/login");
  } else {
    // Si el usuario está autenticado, continúa con la siguiente ruta
    next();
  }
};

// Rutas y lógica de tu aplicación
app.get("/", async (req, res) => {
    try {
        // Lógica para obtener la lista de libros desde la base de datos
        const result = await db.query('SELECT * FROM book');
        const books = result.rows; // Accede a la propiedad 'rows' del resultado
        console.log(books); // Verifica que books sea un array
        res.render("index", { books });
    } catch (error) {
        console.error('Error al obtener libros desde la base de datos:', error);
        res.render("index", { books: [] }); // Puedes manejar el error de alguna manera
    }
});

app.get("/docs", async (req, res) => {

    res.render("docs");
});

app.get("/indexAdmin", requireAuth, async (req, res) => {
    try {
        // Lógica para obtener la lista de libros desde la base de datos
        const result = await db.query('SELECT * FROM book');
        const books = result.rows; // Accede a la propiedad 'rows' del resultado
        console.log(books); // Verifica que books sea un array
        res.render("indexAdmin", { books });
    } catch (error) {
        console.error('Error al obtener libros desde la base de datos:', error);
        res.render("indexAdmin", { books: [] }); // Puedes manejar el error de alguna manera
    }
});



app.get("/create", requireAuth, (req, res) => {
 
    const bookData = req.body;
    
     res.render("create");

});

// Ruta para manejar la búsqueda
app.get("/search", async (req, res) => {
    const query = req.query.query;

    try {
        // Lógica para buscar libros en la base de datos por nombre, autor y rating
        const result = await db.query('SELECT * FROM book WHERE title ILIKE $1 OR author ILIKE $1 OR rating ILIKE $1 ', [`%${query}%`]);
        const books = result.rows;

        res.render("search", { books, query });
    } catch (error) {
        console.error('Error al realizar la búsqueda en la base de datos:', error);
        res.status(500).send("Error al realizar la búsqueda en la base de datos");
    }
});

app.get("/login", (req, res) => {
  // Verifica si hay un mensaje de error en la sesión y pásalo al renderizar la vista
  const error = req.session.error;
  req.session.error = null; // Limpia el mensaje de error de la sesión

  res.render("login", { error });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Consultar la base de datos para obtener el hash de la contraseña del usuario
  const result = await db.query('SELECT * FROM usuario WHERE username = $1', [username]);

  if (result.rows.length > 0) {
    const hash = result.rows[0].password;

    // Comparar la contraseña proporcionada con el hash almacenado
    const match = await bcrypt.compare(password, hash);

    if (match) {
      // Autenticación exitosa, guardar información del usuario en la sesión
      req.session.user = result.rows[0];
      res.redirect("/indexAdmin");
    } else {
      // Autenticación fallida, guardar mensaje de error en la sesión
      req.session.error = "Credenciales incorrectas";
      res.redirect("/login");
    }
  } else {
    // Usuario no encontrado, guardar mensaje de error en la sesión
    req.session.error = "Usuario no encontrado";
    res.redirect("/login");
  }
});

app.post("/create", async (req, res) => {
    const bookData = req.body;

    // Mapea los valores de género a booleanos
    const genreValues = {
        novel: bookData.novel === 'true',
        short_story: bookData.short_story === 'true',
        drama: bookData.drama === 'true',
        suspense: bookData.suspense === 'true',
        fiction: bookData.fiction === 'true',
        slice_of_life: bookData.slice_of_life === 'true',
        terror: bookData.terror === 'true',
        fantasy: bookData.fantasy === 'true',
    };

    try {
        await db.query(
            'INSERT INTO book(title, review, olid, novel, short_story, drama, fiction, fantasy, suspense, slice_of_life, horror, rating, author) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
            [
                bookData.title,
                bookData.review,
                bookData.olid,
                genreValues.novel,
                genreValues.short_story,
                genreValues.drama,
                genreValues.fiction,
                genreValues.fantasy,
                genreValues.suspense,
                genreValues.slice_of_life,
                bookData.horror,
                bookData.rating,
                bookData.author,
            ]
        );

        // Redirige después de insertar el libro
        res.redirect("/");
    } catch (error) {
        console.error('Error al insertar libro en la base de datos:', error);
        // Puedes manejar el error de alguna manera (por ejemplo, mostrar un mensaje de error)
        res.render("create", { error: "Error al insertar libro en la base de datos" });
    }
});


// ...

// Ruta para mostrar el formulario de edición
app.get("/edit/:id", requireAuth, async (req, res) => {
    const bookId = req.params.id;

    try {
        // Obtener el libro con el ID proporcionado desde la base de datos
        const result = await db.query('SELECT * FROM book WHERE id = $1', [bookId]);

        if (result.rows.length > 0) {
            const book = result.rows[0];
            res.render("edit", { book });
        } else {
            res.status(404).send("Libro no encontrado");
        }
    } catch (error) {
        console.error('Error al obtener libro desde la base de datos:', error);
        res.status(500).send("Error al obtener libro desde la base de datos");
    }
});


// Ruta para procesar la edición del libro
// Ruta para procesar la edición del libro
app.post("/edit", async (req, res) => {
    const bookData = req.body;

    // Mapea los valores de género a booleanos
    const genreValues = {
        novel: bookData.novel === 'true',
        short_story: bookData.short_story === 'true',
        drama: bookData.drama === 'true',
        suspense: bookData.suspense === 'true',
        fiction: bookData.fiction === 'true',
        slice_of_life: bookData.slice_of_life === 'true',
        terror: bookData.terror === 'true',
        fantasy: bookData.fantasy === 'true',
    };

    try {
        await db.query(
            'UPDATE book SET title = $1, review = $2, olid = $3, novel = $4, short_story = $5, drama = $6, fiction = $7, fantasy = $8, suspense = $9, slice_of_life = $10, horror = $11, rating = $12, author = $13 WHERE id = $14',
            [
                bookData.title,
                bookData.review,
                bookData.olid,
                genreValues.novel,
                genreValues.short_story,
                genreValues.drama,
                genreValues.fiction,
                genreValues.fantasy,
                genreValues.suspense,
                genreValues.slice_of_life,
                bookData.horror,
                bookData.rating,
                bookData.author,
                bookData.id,
            ]
        );

        res.redirect("/indexAdmin");
    } catch (error) {
        console.error('Error al editar libro en la base de datos:', error);
        res.status(500).send("Error al editar libro en la base de datos");
    }
});


// Ruta para eliminar un libro
app.post("/delete/:id", async (req, res) => {
     const bookId = req.params.id;

    try {
        await db.query('DELETE FROM book WHERE id = $1', [bookId]);
        res.redirect("/indexAdmin");
    } catch (error) {
        console.error('Error al eliminar libro en la base de datos:', error);
        res.status(500).send("Error al eliminar libro en la base de datos");
    }
});

// ...




// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
