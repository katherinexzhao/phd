import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { API_BASE_URL } from "../api";

export default function RecommendHomePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const navigate = useNavigate();
    
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!email) return;
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/user/profile?email=${email}`);
        const profileData = await profileRes.json();
        const interests = profileData.user?.titles || [];

        const oerRes = await fetch(`${API_BASE_URL}/api/recommend/recommend-oers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        let matchedResources = await oerRes.json();
        if (!Array.isArray(matchedResources)) matchedResources = [];

        if (matchedResources.length < 5) {
          const trendingRes = await fetch(`${API_BASE_URL}/api/oer/trending`);
          const trendingData = await trendingRes.json();
          const trending = Array.isArray(trendingData) ? trendingData : [];
          matchedResources = [...matchedResources, ...trending];
        }

        setResources(matchedResources);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to load recommendations at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [email]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 px-12">
      <h1 className="text-3xl font-bold mt-12 mb-4">✨ Recommended for You</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold">From the Community</h2>
              <button
                onClick={() => navigate('/community')}
                className="text-blue-600 text-sm hover:underline flex items-center"
              >
                Explore More 
              </button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {resources.map((res) => (
                <div key={res._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer h-80 min-w-[300px] max-w-[300px] flex flex-col justify-between"
                  onClick={() => navigate(`/resource/${res._id}`)}>
                  {res.coverUrl && (
                    <div className="relative w-full pt-[56.25%] mb-2 rounded overflow-hidden border">
                      <img src={res.coverUrl} alt="Cover" className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-1 line-clamp-2">{res.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{res.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{res.commentCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          
        </>
      )}
    </div>
  );
}