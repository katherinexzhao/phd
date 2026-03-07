import { Content } from '@radix-ui/react-tabs';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from "../api";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/oer/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setResource(data);
      } catch (error) {
        console.error('❌ Error fetching resource:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/comment/${id}`);
        const result = await res.json();
        setComments(result.comments || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchResource();
    fetchComments();
  }, [id]);

  const handlePostComment = async () => {
    if (!commentInput) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetId: id, targetType: 'OER', text: commentInput })
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('❌ Comment post error response:', result);
        throw new Error(`Failed to post comment: ${res.status}`);
      }

      const newComment = result.comment || {};
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  if (!resource) return <p className="p-6">Loading...</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => window.location.href = '/community'} className="text-blue-600 hover:underline">
          ← Back
        </button>
        <button
          onClick={() => window.location.href = `/resource/${id}/edit`}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
        {resource.coverUrl && (
          <div className="relative w-full pt-[56.25%] mb-4 rounded border overflow-hidden">
            <img
              src={resource.coverUrl}
              alt="Cover"
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
          </div>
        )}
        <p className="mb-2 text-gray-700"><strong>Description:</strong> {resource.description}</p>
        <p className="mb-2"><strong>Author:</strong> {resource.uploader?.username || 'Anonymous'}</p>
        <p className="mb-2"><strong>Keywords:</strong> {resource.tags?.join(', ') || 'None'}</p>
        <a href={resource.resourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
          Download the Resource
        </a>
      </div>

      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold mb-4">💬 Comments</h2>
        <textarea
          className="w-full p-2 border rounded mb-2"
          rows="3"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Write a comment..."
        ></textarea>
        <button
          onClick={handlePostComment}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Post Comment
        </button>

        <div className="mt-4 space-y-2">
          {comments.length > 0 ? comments.map((comment) => (
            <div key={comment._id} className="border rounded p-2">
              <p className="text-sm font-semibold text-gray-700">
                {comment.userId?.username || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-800">{comment.text}</p>
              <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="text-gray-500">No comments yet.</p>}
        </div>
      </div>
    </>
  );
}
