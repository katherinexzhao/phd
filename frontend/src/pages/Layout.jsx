import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';
  const isActive = (path) => location.pathname.startsWith(path);
  return (
    <div className="w-full min-h-screen relative bg-white">
      <div className="w-60 h-screen left-0 top-0 fixed bg-zinc-700 flex flex-col items-center pb-6 justify-between z-10">
        <div>
          <img src="/LEAP logo.png" alt="LEAP Logo" className="h-60 w-auto" />
        </div>
        <div className="flex flex-col items-center w-full mt-[-200px]">
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl font-bold ${isActive('/home') ? 'bg-neutral-100 text-zinc-800' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/home')}>Home</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/chatbot') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/chatbot')}>Chatbot</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/groups') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/groups')}>Groups</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/forum') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/forum')}>Forum</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/profile') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/profile')}>My Page</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/upload') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/upload')}>Upload Resource</button>
          <button className={`w-48 h-12 mb-2 rounded-md transition text-xl ${isActive('/personalized') ? 'bg-neutral-100 text-zinc-800 font-bold' : 'bg-neutral-100/0 text-white hover:bg-neutral-200'}`} onClick={() => navigate('/personalized')}>Personalized Plan</button>
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-48 h-12 bg-neutral-100/0 rounded-md text-white text-xl flex items-center justify-center">Account Settings</div>
          <div className="w-48 h-12 mt-2 bg-neutral-100/0 rounded-md text-white text-xl flex items-center justify-center">Privacy</div>
        </div>
      </div>
      <div className="ml-60 pl-12 min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
