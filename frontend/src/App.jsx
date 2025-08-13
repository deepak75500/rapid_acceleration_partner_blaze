import React, { useEffect, useState } from 'react';
import client from './api';
import SearchForm from './components/SearchForm';
import Results from './components/Results';

export default function App() {
  const [stations, setStations] = useState([]);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await client.get('/stations');
        setStations(r.data || []);
      } catch (e) {
        console.error('failed to load stations', e);
      }
    })();
  }, []);

  const onSearch = async ({ source, destination, sortBy }) => {
    setLoading(true);
    setResults([]);
    setMeta(null);
    try {
      const r = await client.post('/search', { source, destination, sortBy });
      setResults(r.data.results || []);
      setMeta(r.data.meta || null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1 className="title">NeonRail — Train Search</h1>
        <p className="subtitle"> Direct & single-transfer search • Price = Rs 1.25/km</p>
      </header>

      <main className="container">
        <SearchForm stations={stations} onSearch={onSearch} />
        {loading ? <div className="loading">Searching...</div> : <Results results={results} meta={meta} />}
      </main>

      <footer className="footer">@2025 created</footer>
    </div>
  );
}
