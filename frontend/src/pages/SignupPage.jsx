import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import axios from "axios";

const TITLES = ["Mental health", "First aid", "Other"];

function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    bio: "",
    titles: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file.");
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }
    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleTitleChange = (title) => {
    setForm((prev) => ({
      ...prev,
      titles: prev.titles.includes(title)
        ? prev.titles.filter((t) => t !== title)
        : [...prev.titles, title],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Avatar is optional. If not uploaded, use default logo
    let avatarToUpload = avatarFile;
    if (!avatarFile) {
      // Fetch the logo image as a blob and use it as the avatar
      const response = await fetch('/Logo_1.pic.jpg');
      const blob = await response.blob();
      avatarToUpload = new File([blob], 'avatar.jpg', { type: blob.type });
    }
    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    form.titles.forEach((t) => formData.append("titles", t));
    formData.append("avatar", avatarToUpload);
    try {
      const res = await axios.post("/api/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        localStorage.setItem('email', form.email);
        localStorage.setItem('username', form.username);
        if (res.data.userId) {
          localStorage.setItem('userId', res.data.userId);
        }
        setSuccess("Sign up successful! Please select your interests...");
        setTimeout(() => navigate("/interest"), 1200);
      } else {
        if (res.data.error && res.data.error.includes('duplicate key error') && res.data.error.includes('email')) {
          setError('Email already exists');
        } else {
          setError(res.data.error || 'Sign up failed');
        }
      }
    } catch (err) {
      // If the error is from the backend and contains duplicate key error
      if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.includes('duplicate key error') &&
        err.response.data.error.includes('email')
      ) {
        setError('Email already exists');
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm"
            required
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Short bio"
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
            rows={2}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="mb-2"
          />
          {avatarError && <p className="text-red-500 text-sm mb-2">{avatarError}</p>}
          {avatarPreview && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img
                src={avatarPreview}
                alt="avatar preview"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '1rem',
                  border: '2px solid #e0e7ff'
                }}
              />
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account? <a href="/" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;