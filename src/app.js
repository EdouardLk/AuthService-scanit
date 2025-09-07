// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

require('dotenv').config();

const cors = require('cors');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// pour google
app.use(session({ secret: 'session_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: [ 
      "http://127.0.0.1:5500", 
      "http://localhost:5500", 
      process.env.DATABASE_SERVICE_URL, 
      process.env.FRONT_END_URL 
    ],
    credentials: true
}));

// Initialiser Passport
app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`📩 Requête reçue : ${req.method} ${req.url}`);

    // Middleware pour mesurer chaque requête
    const end = httpRequestDurationSeconds.startTimer();
    res.on('finish', () => {
      httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
      end({ method: req.method, route: req.path, status: res.statusCode });
    });

    next();
});

// Routes
app.use('/ping', (req, res) => {
  res.json({ message: `pingeuuu!` });
});

app.use('/auth', require('./routes/basicAuth/user.routes'));
app.use('/auth/google', require('./routes/googleAuth/google.routes'));
app.use('/email', require('./routes/email/email.routes'));


//----------------partie metrics------------//
const client = require('prom-client');

// Crée un registre pour stocker toutes les métriques
const register = new client.Registry();

// Ajoute des métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Exemple : compteur personnalisé
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status']
});

// Exemple : histogramme pour les temps de réponse
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Enregistre les métriques
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);


// Endpoint pour exposer les métriques
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});


module.exports = app;