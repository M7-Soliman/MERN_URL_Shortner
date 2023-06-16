const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const path = require('path');

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
app.use(express.static(path.join(__dirname, 'client/build')));

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

// Redirect shortened URL to full address
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  // Find the full URL in MongoDB based on the short URL
  const url = await Url.findOne({ shortUrl });

  if (url) {
    // Redirect to the full URL
    res.redirect(url.fullUrl);
  } else {
    // Short URL not found, handle the error accordingly
    res.status(404).send('URL not found');
  }
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
