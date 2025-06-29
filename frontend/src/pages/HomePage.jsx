import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaperCard from './PaperCard';

function extractLink(r) {
  if (Array.isArray(r.fullTextLinks) && r.fullTextLinks.length > 0 && r.fullTextLinks[0].url) return r.fullTextLinks[0].url;
  if (r.openAccessPdf && r.openAccessPdf.url) return r.openAccessPdf.url;
  if (r.url) return r.url;
  if (r.downloadUrl) return r.downloadUrl;
  if (r.doi) return `https://doi.org/${r.doi}`;
  return null;
}

function getPagination(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (current > 4) pages.push('...');
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push('...');
  pages.push(total);
  return pages;
}

function CoreSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [limit, setLimit] = useState(50);

  const handleSearch = async (e, toPage = 1) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`/api/core/search?query=${encodeURIComponent(query)}&page=${toPage}`);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

pagination.map
      try {
  const res = await fetch(`/api/core/search?query=${encodeURIComponent(query)}&page=${toPage}`);
  const data = await res.json();
  
  if (data.results && data.results.length > 0) {
    setResults(data.results);
    setTotalHits(data.totalHits || 0);
    setLimit(data.limit || 50);
    setPage(data.page || 1);
    setError('');   
  } else {
    setError('No results found.');
    setResults([]);
    setTotalHits(0);
  }
} catch (err) {
  setError('Failed to fetch resources.');
}
    } catch (err) {
      setError('Failed to fetch resources.');
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalHits / limit);
  const pagination = getPagination(page, totalPages);

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSearch} className="w-full max-w-2xl flex">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask anything..."
          className="
            flex-1
            bg-white
            rounded-l-full
            px-6
            py-3
            shadow-md
            placeholder-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-gray-400
            transition"
        />
        <button type="submit" className="bg-black
            text-white
            font-semibold
            px-8
            py-3
            rounded-r-full
            shadow-lg
            hover:bg-gray-800
            transition-colors duration-200 ease-in-out">
          Search
        </button>
      </form>

      
      {loading && <div className="text-gray-500 font-medium">Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="w-full max-w-2xl">
        <ul>
          {results.map((r, idx) => {
            console.log('paper', r);
            const link = extractLink(r);
            return (
              <PaperCard
  key={r.id || r.doi || idx}
  id={r.id || r.doi || idx}
  title={r.title || r.titleFull || 'Untitled'}
  summary={(r.description || r.abstract || '').slice(0, 200)}
  fullSummary={r.description || r.abstract || ''}
  url={link}
  imageUrl={r.imageUrl || r.thumbnail || r.cover || null}
/>
            );
          })}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap gap-2 mt-6 items-center">
          <button
            className="px-3 py-2 rounded-lg border font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={() => handleSearch(null, Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          {pagination.map((p, i) =>
  p === '...'
    ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
    : <button
        key={`page-${p}`}  
        className={`px-4 py-2 rounded-lg border font-semibold ${page === p ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => handleSearch(null, p)}
        disabled={page === p}
      >
        {p}
      </button>
)}
          <button
            className="px-3 py-2 rounded-lg border font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={() => handleSearch(null, Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-16 pb-16 px-4">
      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-750 mb-2 drop-shadow">{username ? `Welcome, ${username}!` : 'Welcome!'}</h1>
        <p className="text-gray-600 text-lg">Search Open Education Resources</p>
      </div>
      <div className="w-full max-w-2xl mt-8">
        <CoreSearch />
      </div>
    </div>
  );
}