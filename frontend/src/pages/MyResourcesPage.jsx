import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';



export default function MyResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId'); // 确保这个值和你上传时一致
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/oer/user/${userId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('🎯 My resources:', data); // 调试输出
        setResources(data);
      } catch (err) {
        console.error('Failed to fetch resources', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchResources();
  }, [userId]);

  if (!userId) {
    return <div className="p-8 text-center text-red-600">Please log in to view your resources.</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-stone-100">
      <h1 className="text-3xl font-bold mb-6">My Uploaded Resources</h1>
      {loading ? (
        <p>Loading...</p>
      ) : resources.length === 0 ? (
        <p>You have not uploaded any resources yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div key={res._id} 
            onClick={() => navigate(`/resource/${res._id}`)}
            className="relative cursor-pointer bg-white shadow rounded-xl p-4 hover:shadow-lg transition"
          >
              {res.coverUrl && (
                <div className="relative w-full pt-[56.25%] mb-2 rounded-md overflow-hidden">
                  <img
                    src={res.coverUrl}
                    alt="Cover"
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold mb-1">{res.title}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {res.description?.slice(0, 100)}...
              </p>
              <div className="flex justify-end items-center mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this resource?')) {
                      fetch(`http://localhost:5001/api/oer/${res._id}`, {
                        method: 'DELETE',
                      })
                        .then(() => {
                          setResources((prev) => prev.filter((r) => r._id !== res._id));
                        })
                        .catch((err) => console.error('Delete failed', err));
                    }
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}