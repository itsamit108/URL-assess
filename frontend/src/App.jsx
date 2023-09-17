import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResult(null);
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
    <div className="appStyle">
      <h1>URL Security Assessment</h1>
      <form className="formStyle" onSubmit={handleSubmit}>
        <input
          className="inputStyle"
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="buttonStyle" type="submit" disabled={loading}>
          Assess
        </button>
      </form>
      {loading ? (
        <div className="loadingStyle">
          <div className="spinnerStyle"></div>
        </div>
      ) : null}
      {result && (
        <div className="resultStyle">
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
