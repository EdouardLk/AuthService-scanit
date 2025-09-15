const app = require("./app")


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});