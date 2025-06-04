import React, { useState } from 'react';

function extractLink(r) {
  // Priority: fullTextLinks[0].url > openAccessPdf.url > url > downloadUrl > doi
  if (Array.isArray(r.fullTextLinks) && r.fullTextLinks.length > 0 && r.fullTextLinks[0].url) return r.fullTextLinks[0].url;
  if (r.openAccessPdf && r.openAccessPdf.url) return r.openAccessPdf.url;
  if (r.url) return r.url;
  if (r.downloadUrl) return r.downloadUrl;
  if (r.doi) return `https://doi.org/${r.doi}`;
  return null;
}

function getPagination(current, total) {
  // Return pagination button array: includes first, previous two, current, next two, last page, with ... in between
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
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setTotalHits(data.totalHits || 0);
        setLimit(data.limit || 50);
        setPage(data.page || 1);
      } else {
        setError('No results found.');
        setResults([]);
        setTotalHits(0);
      }
    } catch (err) {
      setError('Failed to fetch resources.');
    }
    setLoading(false);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalHits / limit);
  const pagination = getPagination(page, totalPages);

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSearch} className="mb-8 flex w-full max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Open Education Resources..."
          className="flex-1 border border-gray-300 rounded-l-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-r-2xl text-lg font-semibold transition-all">Search</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="w-full max-w-2xl">
        <ul>
          {results.map((r, idx) => {
            const link = extractLink(r);
            return (
              <li key={r.id || r.doi || idx} className="mb-4 p-4 border-b bg-white rounded-xl shadow-sm">
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline font-semibold text-lg"
                  >
                    {r.title || r.titleFull || 'Untitled'}
                  </a>
                ) : (
                  <span className="text-gray-400 font-semibold text-lg">
                    {r.title || r.titleFull || 'Untitled'}
                  </span>
                )}
                <div className="text-gray-600 text-sm mt-1 line-clamp-3">{r.description || r.abstract || ''}</div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Pagination button optimization */}
      {totalPages > 1 && (
        <>
          <div className="flex flex-wrap gap-2 mt-6 items-center">
            <button
              className="px-3 py-2 rounded-lg border font-semibold bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
              onClick={() => handleSearch(null, Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            {pagination.map((p, i) =>
              p === '...'
                ? <span key={i} className="px-2 text-gray-400">...</span>
                : <button
                    key={p}
                    className={`px-4 py-2 rounded-lg border font-semibold ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                    onClick={() => handleSearch(null, p)}
                    disabled={page === p}
                  >
                    {p}
                  </button>
            )}
            <button
              className="px-3 py-2 rounded-lg border font-semibold bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
              onClick={() => handleSearch(null, Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
          <div className="h-16" />
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';
  return (
    <div className="w-full flex flex-col items-center pt-16 min-h-screen bg-white">
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <span className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 tracking-tight drop-shadow">{username ? `Welcome, ${username}!` : 'Welcome!'}</span>
      </div>
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">Search Open Education Resources</h2>
        <CoreSearch />
      </div>
    </div>
  );
}