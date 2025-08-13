require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://eee-vt46.onrender.com']
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://deepak7550080013:apK0ilZbRaLdmHJW@cluster0.qdhpq6f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error', err);
});

app.use('/', routes);

app.get('/health', (req, res) => res.send({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
