// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);
  const [hovered, setHovered] = React.useState(null);

  return (
    <div className="w-full h-screen flex bg-white">
      {/* —— 侧边栏 —— */}
      <aside className="w-60 h-full fixed bg-zinc-700 flex flex-col items-center pb-6 justify-between z-10">
        <div className="mt-6">
          <img src="/LEAP logo.png" alt="LEAP Logo" className="h-35 w-auto" />
        </div>
        <nav className="flex-1 w-full flex flex-col items-center mt-4">
          {[
            ['Home', '/home'],
            ['Learning Dashboard', '/my-learning'],
            ['Community', '/community'],
            ['Groups', '/groups'],
            ['Chatbot', '/chatbot'],

          ].map(([label, path]) => (
            <button
              key={path}
              className={`w-48 h-12 mb-2 rounded-md transition text-xl ${ 
                isActive(path)
                  ? 'bg-neutral-100 text-zinc-800 font-bold'
                  : 'text-white bg-transparent hover:bg-neutral-200'
              }`}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </nav>
        

        <div className="w-full flex flex-col items-center">
          <button
            className="w-48 h-12 bg-transparent rounded-md text-white text-base hover:bg-neutral-200 transition"
            onClick={() => navigate('/profile')}
          >
            Account Settings
          </button>
          <button className="w-48 h-12 mt-2 bg-transparent rounded-md text-white text-base hover:bg-neutral-200 transition">
            Privacy
          </button>
        </div>
      </aside>

      {/* —— 顶栏 —— */}
      <header className="fixed top-0 left-60 right-0 h-16 bg-white shadow flex items-center justify-end px-6 z-20">
        <button
          onClick={() => navigate('/upload')}
          className="mr-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          Share Something
        </button>
        <Link
          to="/my-learning"
          className="px-4 py-2 text-black hover:underline"
        >
          My Learning Dashboard
        </Link>
      </header>

      <Link to="/my-learning">📚 My Learning</Link>

      {/* —— 主内容区 —— */}
      <main className="ml-60 pt-16 pl-12 pr-6 h-full flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}