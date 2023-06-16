const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const path = require('path');
const QRCode = require('qrcode'); // QR code generation library

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
  expiresAt: { type: Date },
});

const Url = mongoose.model('Url', urlSchema);

// Middleware to parse JSON
app.use(express.json());

// Serve the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API endpoint to create a shortened URL
app.post('/api/url', async (req, res) => {
  const { fullUrl, expiresIn } = req.body;

  // Generate a short URL
  const shortUrl = shortid.generate();

  // Calculate the expiration date
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

  // Create a new URL document in MongoDB
  const url = new Url({
    fullUrl,
    shortUrl,
    expiresAt,
  });

  await url.save();

  // Generate QR code for the shortened URL
  const qrCode = await generateQRCode(shortUrl);

  res.json({ shortUrl, qrCode });
});

// Redirect shortened URL to full address
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  // Find the full URL in MongoDB based on the short URL
  const url = await Url.findOne({ shortUrl });

  if (url) {
    if (url.expiresAt && url.expiresAt <= new Date()) {
      // URL has expired, handle accordingly (e.g., redirect to an expired page)
      res.status(404).send('URL has expired');
    } else {
      // Redirect to the full URL
      res.redirect(url.fullUrl);
    }
  } else {
    // Short URL not found, handle the error accordingly
    res.status(404).send('URL not found');
  }
});

// Serve QR codes
app.get('/api/qrcode/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  // Generate QR code for the shortened URL
  const qrCode = await generateQRCode(shortUrl);

  // Serve the QR code image or SVG
  res.type('svg').send(qrCode);
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

// Helper function to generate QR code for a given URL
async function generateQRCode(url) {
  try {
    return await QRCode.toString(url, { type: 'svg' });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return ''; // Return empty string or handle the error as needed
  }
}