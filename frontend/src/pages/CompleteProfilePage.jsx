import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_AVATAR = '/Logo_1.pic.jpg';

export default function CompleteProfilePage() {
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : '';
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', titles: [], avatarFile: null, avatarPreview: '' });
  const [avatarError, setAvatarError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await axios.get('/api/user/profile', { params: { email } });
        if (res.data.success) {
          setUser(res.data.user);
          setForm({
            username: res.data.user.username || '',
            bio: res.data.user.bio || '',
            titles: res.data.user.titles || [],
            avatarFile: null,
            avatarPreview: res.data.user.avatarUrl || ''
          });
        }
      } catch (err) {
        setError('Failed to load profile');
      }
      setLoading(false);
    }
    if (email) fetchUser();
  }, [email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setAvatarError('Please upload an image file.');
      setForm(f => ({ ...f, avatarFile: null, avatarPreview: '' }));
      return;
    }
    setAvatarError('');
    setForm(f => ({ ...f, avatarFile: file, avatarPreview: file ? URL.createObjectURL(file) : '' }));
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      username: user.username || '',
      bio: user.bio || '',
      titles: user.titles || [],
      avatarFile: null,
      avatarPreview: user.avatarUrl || ''
    });
    setAvatarError('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', form.username);
    formData.append('bio', form.bio);
    form.titles.forEach(t => formData.append('titles', t));
    if (form.avatarFile) formData.append('avatar', form.avatarFile);
    try {
      const res = await axios.post('/api/user/complete-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setUser(res.data.user);
        setEditMode(false);
      } else {
        setError(res.data.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (!user) return <div className="flex justify-center items-center h-full">Profile not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">My Profile</h2>
        <div className="mb-4 flex flex-col items-center">
          <img
            src={form.avatarPreview || user.avatarUrl || DEFAULT_AVATAR}
            alt="avatar"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e7ff' }}
            onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
          />
          {editMode && (
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2" />
          )}
          {avatarError && <p className="text-red-500 text-sm mb-2">{avatarError}</p>}
        </div>
        <form onSubmit={handleSave} className="w-full flex flex-col items-center">
          <div className="w-full mb-2">
            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl"
              disabled={!editMode}
              required
            />
          </div>
          <div className="w-full mb-2">
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              className="w-full px-3 py-2 border rounded-xl bg-gray-100"
              disabled
            />
          </div>
          <div className="w-full mb-2">
            <label className="block font-semibold mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl"
              rows={2}
              disabled={!editMode}
            />
          </div>
          <div className="w-full mb-4">
            <label className="block font-semibold mb-1">Interests</label>
            <div className="flex flex-wrap gap-2">
              {form.titles.length === 0 && <span className="text-gray-400">No interests</span>}
              {form.titles.map((title, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl border bg-gray-100 text-gray-700 text-sm">{title}</span>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
          <div className="flex w-full justify-between mt-2">
            {!editMode ? (
              <button type="button" className="bg-black hover:bg-gray-600 text-white py-2 px-6 rounded-xl font-semibold w-full" onClick={handleEdit}>Edit</button>
            ) : (
              <>
                <button type="submit" className="bg-gray -500 hover:bg-gray-600 text-white py-2 px-6 rounded-xl font-semibold mr-2">Save</button>
                <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-xl font-semibold" onClick={handleCancel}>Cancel</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 