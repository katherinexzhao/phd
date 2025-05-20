import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 text-gray-800">
      <header className="bg-white shadow p-6">
        <h1 className="text-4xl font-bold text-center text-indigo-700">Community Learning Hub</h1>
        <p className="text-center text-gray-600 mt-2">Empowering shared knowledge for all</p>
      </header>

      <nav className="flex flex-wrap justify-center gap-4 bg-white shadow-md p-4 mt-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl shadow-md">Login</button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl shadow-md">Register</button>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl shadow-md" onClick={() => navigate('/upload')}>Upload</button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl shadow-md">My Page</button>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl shadow-md">Feed</button>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl shadow-md">Chatbot</button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl shadow-md">Forum</button>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-12">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2 text-indigo-700">Welcome!</h2>
          <p className="text-gray-600">This is a placeholder for personalized content.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2 text-indigo-700">Latest Uploads</h2>
          <p className="text-gray-600">Content will appear here soon.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2 text-indigo-700">Discussion Highlights</h2>
          <p className="text-gray-600">Forum topics will be shown here.</p>
        </div>
      </main>
    </div>
  );
}