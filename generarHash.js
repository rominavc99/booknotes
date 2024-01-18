const bcrypt = require("bcrypt");
const saltRounds = 10; // Número de rondas de sal (ajustable según tus necesidades)

const plainPassword = "mantequilla";

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error al generar hash:", err);
  } else {
    console.log("Hash de la contraseña:", hash);
    // Puedes utilizar este hash para insertarlo manualmente en la base de datos
  }
});
