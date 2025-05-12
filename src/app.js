
// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const cors = require('cors');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
    origin: [ "http://127.0.0.1:5500", `${process.env.DATABASE_SERVICE_URL}`, `${process.env.FRONT_END_URL}` ],
    credentials : true
}));

// Routes
app.use('/ping', (req, res) => {
  res.json({ message: `pingeuuu!` });
});

app.use('/auth', require('./routes/basicAuth/user.routes'));


// Lancement serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
