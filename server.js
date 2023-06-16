const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const moment = require('moment');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the URL schema
const urlSchema = new mongoose.Schema({
  fullUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model('Url', urlSchema);

// Middleware to parse JSON
app.use(express.json());

// Serve the React app
app.use(express.static('client/build'));

// API endpoint to create a shortened URL
app.post('/api/url', async (req, res) => {
  const { fullUrl } = req.body;

  // Generate a short URL
  const shortUrl = shortid.generate();

  // Create a new URL document in MongoDB
  const url = new Url({
    fullUrl,
    shortUrl,
  });

  await url.save();

  res.json({ shortUrl });
});

// Route for handling all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
