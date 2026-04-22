// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Environment loaded:", {
  DB_HOST: !!process.env.DB_HOST,
  DB_USER: !!process.env.DB_USER,
});

// Now import and run the app
import('./index.js').catch(console.error);
app.get('/', (req, res) => {
  res.send('PG-Pal Backend is Live 🚀');
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is working 🚀'
  });
});