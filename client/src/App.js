import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) {
      return;
    }

    const response = await fetch('/api/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullUrl: url }),
    });

    const data = await response.json();

    setShortenedUrl(data.shortUrl);
  };

  return (
    <div className="container">
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">Enter a URL:</label>
          <input type="text" id="url" value={url} onChange={handleUrlChange} placeholder="https://example.com" />
        </div>
        <button type="submit">Shorten</button>
      </form>
      {shortenedUrl && (
        <div className="result">
          <p>Shortened URL:</p>
          <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">{shortenedUrl}</a>
        </div>
      )}
    </div>
  );
}

export default App;
