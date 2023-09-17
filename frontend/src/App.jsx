import axios from 'axios';
import React, { useEffect, useState } from 'react';

const appStyle = {
  fontFamily: 'Roboto, sans-serif',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '20px',
};

const inputStyle = {
  width: '300px',
  padding: '10px',
  fontSize: '16px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  marginBottom: '10px',
};

const buttonStyle = {
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
};

const loadingStyle = {
  fontSize: '20px',
  marginTop: '20px',
  color: '#2196F3',
};

const resultStyle = {
  textAlign: 'left',
  maxWidth: '500px',
  margin: '20px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#fff',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
};

const spinnerStyle = {
  border: '4px solid rgba(0, 0, 0, 0.3)',
  borderTop: '4px solid #2196F3',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResult(null); // Clear previous results when URL changes
  }, [url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get('http://localhost:8000/vulnerability', {
        params: { url },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={appStyle}>
      <h1>URL Security Assessment</h1>
      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button style={buttonStyle} type="submit" disabled={loading}>
          Assess
        </button>
      </form>
      {loading ? (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
      ) : null}
      {result && (
        <div style={resultStyle}>
          <h2>Assessment Result for {url}</h2>
          <ul>
            {result.assessment.vulnerabilities.map((vulnerability, index) => (
              <li key={index}>{vulnerability}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
