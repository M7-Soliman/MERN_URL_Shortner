import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [expiration, setExpiration] = useState({
    duration: '',
    unit: 'minutes',
  });
  const [qrCode, setQRCode] = useState('');

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleDurationChange = (e) => {
    setExpiration({ ...expiration, duration: e.target.value });
  };

  const handleUnitChange = (e) => {
    setExpiration({ ...expiration, unit: e.target.value });
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
      body: JSON.stringify({
        fullUrl: url,
        expiresIn: convertToSeconds(expiration.duration, expiration.unit),
      }),
    });

    const data = await response.json();

    setShortenedUrl(data.shortUrl);
    setQRCode(data.qrCode);
  };

  const convertToSeconds = (duration, unit) => {
    let seconds = parseInt(duration);

    switch (unit) {
      case 'minutes':
        seconds *= 60;
        break;
      case 'hours':
        seconds *= 60 * 60;
        break;
      case 'days':
        seconds *= 60 * 60 * 24;
        break;
      case 'weeks':
        seconds *= 60 * 60 * 24 * 7;
        break;
      default:
        break;
    }

    return seconds;
  };

  const containerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  };

  const formGroupStyle = {
    marginBottom: '10px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    marginTop: '5px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  };

  const resultStyle = {
    marginTop: '20px',
  };

  const qrCodeStyle = {
    display: 'block',
    maxWidth: '200px',
    margin: '10px auto',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label htmlFor="url">Enter a URL:</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={handleUrlChange}
            style={inputStyle}
            placeholder="https://example.com"
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="duration">Expiration Duration:</label>
          <input
            type="number"
            id="duration"
            value={expiration.duration}
            onChange={handleDurationChange}
            style={inputStyle}
          />
          <select
            id="unit"
            value={expiration.unit}
            onChange={handleUnitChange}
            style={selectStyle}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>
          Shorten
        </button>
      </form>
      {shortenedUrl && (
        <div style={resultStyle}>
          <p>Shortened URL:</p>
          <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
            {shortenedUrl}
          </a>
          {qrCode && (
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`} alt="QR Code" style={qrCodeStyle} />
            )}
        </div>
      )}
    </div>
  );
}

export default App;
