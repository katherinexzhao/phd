import React from 'react';
import { useLocation } from 'react-router-dom';
import PaperCard from './PaperCard';

// ---------- helpers ----------
function extractCoverUrl(paper) {
  if (!Array.isArray(paper.links)) return null;

  // Prefer large / medium thumbnails first
  const preferred = paper.links.find(l =>
    l.type && (l.type.includes('thumbnail_l') || l.type.includes('thumbnail_m'))
  );

  if (preferred?.url) return preferred.url;

  // Fallback: any link with “thumbnail”
  const fallback = paper.links.find(l => l.type?.toLowerCase().includes('thumbnail'));
  return fallback?.url || 'https://via.placeholder.com/400x200?text=No+Image';
}

// ---------- main component ----------
const SearchResults = () => {
  const { state } = useLocation();
  const papers = state?.results ?? [];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Results</h1>

      {papers.length === 0 ? (
        <p className="text-gray-600">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((p, idx) => (
            <PaperCard
              key={p.id || p.doi || idx}
              id={p.id || p.doi || idx}
              title={p.title || p.titleFull || 'Untitled'}
              summary={(p.description || p.abstract || '').slice(0, 200)}
              fullSummary={p.description || p.abstract || ''}
              url={
                p.fullTextLinks?.[0]?.url ||
                p.openAccessPdf?.url ||
                p.url ||
                p.downloadUrl ||
                (p.doi ? `https://doi.org/${p.doi}` : '')
              }
              coverUrl={extractCoverUrl(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;