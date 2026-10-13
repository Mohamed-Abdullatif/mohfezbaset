require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Mohafez Baseet API',
  customCss: '.swagger-ui .topbar { background: #1a7a4a; } .swagger-ui .topbar-wrapper img { content: none; } .swagger-ui .topbar-wrapper::after { content: "📖 Mohafez Baseet API"; color: white; font-size: 1.2rem; font-weight: bold; }',
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/prefs', require('./routes/prefs'));
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'muhfez-baset' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Mohafez Baseet API running on port ${PORT}`));
