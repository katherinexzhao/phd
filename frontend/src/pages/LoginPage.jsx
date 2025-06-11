import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('email', email);
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        navigate('/home');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[687px] h-[863px] relative bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col items-center">
        <h2 className="w-36 h-20 mt-[80px] mb-[40px] text-center text-stone-500 text-4xl font-bold font-mukta leading-10">Welcome</h2>
        <form className="flex flex-col items-center w-full" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            className="w-[464px] h-14 mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-[464px] h-14 mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="w-[464px] flex justify-end mb-6">
            <button
              type="button"
              className="text-blue-800 font-semibold text-base font-poppins underline"
              onClick={() => navigate('/forgot-password')}
              tabIndex={-1}
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="w-[464px] h-16 bg-black text-white rounded-[5px] text-2xl font-semibold font-poppins mb-8"
          >
            Continue
          </button>
          {error && (
            <div className="w-[464px] text-red-500 text-base text-center mb-4">{error}</div>
          )}
          <div className="w-[464px] flex justify-between items-center">
            <span className="text-base font-semibold font-poppins">Don't have an account yet?</span>
            <button
              type="button"
              className="text-blue-800 font-semibold text-base font-poppins underline"
              onClick={() => navigate('/signup')}
              tabIndex={-1}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
