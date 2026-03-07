import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function CommunityPage() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/oer');
        const data = await res.json();
        setResources(data.filter(r => !r.hidden));
      } catch (err) {
        console.error('Error fetching community resources:', err);
      }
    };

    fetchAllResources();
  }, []);

  const filtered = resources.filter(res =>
    res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(res.tags) && res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50 px-12">
      <h1 className="text-3xl font-bold mt-12 mb-6">🌍 Community Resources</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search community posts..."
        className="w-full max-w-md p-2 mb-6 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <div
            key={res._id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between h-80"
            onClick={() => navigate(`/resource/${res._id}`)}
          >
            {res.coverUrl && (
              <div className="relative w-full pt-[56.25%] mb-2 rounded overflow-hidden border">
                <img
                  src={res.coverUrl}
                  alt="Cover"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="text-lg font-bold mb-1 line-clamp-2">{res.title}</h3>
            <p className="text-xs text-gray-400 mt-1">Author: {res.uploader?.username || 'Anonymous'}</p>
            {res.isForwarded && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-1 w-fit">
                Forwarded
              </span>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">{res.description}</p>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{res.commentCount || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}