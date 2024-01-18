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

// Rutas y lógica de tu aplicación
app.get("/", (req, res) => {
  // Lógica para obtener y mostrar la lista de libros
  res.render("index"); // Puedes crear esta vista en EJS
});

app.get("/create", (req, res) => {
 
    const bookData = req.body;
    
     res.render("create");

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
      res.redirect("/create");
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


app.post("/create", (req, res) => {
  // Utilizar req.body para acceder a los datos enviados en el cuerpo de la solicitud POST
    const bookData = req.body;
    
     res.render("create");
  // Lógica para agregar un nuevo libro a la base de datos
  //res.redirect("/");
});

// Más rutas según las necesidades de tu aplicación

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
