// EditResourcePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../api";

export default function EditResourcePage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    const fetchResource = async () => {
      const res = await fetch(`${API_BASE_URL}/api/oer/${resourceId}`);
      const data = await res.json();
      setResource(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        tags: data.tags?.join(', ') || ''
      });
    };
    fetchResource();
  }, [resourceId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/oer/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim())
        })
      });
      if (res.ok) {
        navigate(`/resource/${resourceId}`);
      } else {
        console.error('Failed to update resource');
      }
    } catch (err) {
      console.error('Error submitting update', err);
    }
  };

  if (!resource) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Resource</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tags (comma separated)</label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}