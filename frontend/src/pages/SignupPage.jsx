import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../api";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let avatarToUpload = avatarFile;
    if (!avatarFile) {
      const response = await fetch("/Logo_1.pic.jpg");
      const blob = await response.blob();
      avatarToUpload = new File([blob], "avatar.jpg", { type: blob.type });
    }

    const formData = new FormData();
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("password", form.password);
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    formData.append("avatar", avatarToUpload);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        localStorage.setItem("email", form.email.trim().toLowerCase());
        localStorage.setItem("username", form.username);
        if (res.data.userId) {
          localStorage.setItem("userId", res.data.userId);
        }
        setSuccess("Sign up successful! Please select your interests...");
        setTimeout(() => navigate("/interest"), 1200);
      } else {
        setError(res.data.error || "Sign up failed");
      }
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.error
      ) {
        setError(err.response.data.error);
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[687px] min-h-[863px] relative bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col items-center py-12">
        <h2 className="w-48 mt-[20px] mb-[40px] text-center text-stone-500 text-4xl font-bold font-mukta leading-10">
          Welcome
        </h2>

        <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-[464px] h-14 mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-[464px] h-14 mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-[464px] h-14 mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins"
            value={form.username}
            onChange={handleChange}
            required
          />

          <textarea
            name="bio"
            placeholder="Short bio"
            className="w-[464px] min-h-[120px] mb-6 rounded-[5px] border border-black px-4 py-3 text-xl font-poppins resize-none"
            value={form.bio}
            onChange={handleChange}
            rows={4}
          />

          <div className="w-[464px] mb-6 flex flex-col items-center">

  <label className="cursor-pointer bg-gray-100 px-6 py-3 rounded-md font-poppins text-sm hover:bg-gray-300">
    Upload Your Profile Picture
    <input
      type="file"
      accept="image/*"
      onChange={handleAvatarChange}
      className="hidden"
    />
  </label>

  {avatarPreview && (
    <img
      src={avatarPreview}
      alt="avatar preview"
      className="w-20 h-20 rounded-full object-cover mt-4 border-2 border-gray-300"
    />
  )}

</div>

          {avatarError && (
            <div className="w-[464px] text-red-500 text-base text-center mb-4">
              {avatarError}
            </div>
          )}

          {avatarPreview && (
            <div className="w-[464px] flex justify-center mb-6">
              <img
                src={avatarPreview}
                alt="avatar preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-[464px] h-16 bg-black text-white rounded-[5px] text-2xl font-semibold font-poppins mb-8"
          >
            Sign Up
          </button>

          <div className="w-[464px] flex justify-center mb-6">
            <GoogleLogin
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              text="signup_with"
              onSuccess={async (credentialResponse) => {
                setError("");
                setSuccess("");

                try {
                  const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: credentialResponse?.credential }),
                  });

                  const data = await res.json();

                  if (data.success) {
                    localStorage.setItem("email", data.email);
                    if (data.username) localStorage.setItem("username", data.username);
                    if (data.userId) localStorage.setItem("userId", data.userId);
                    setSuccess("Google sign up successful! Please select your interests...");
                    setTimeout(() => navigate("/interest"), 1200);
                  } else {
                    setError(data.error || "Google sign up failed");
                  }
                } catch (err) {
                  setError("Google authentication failed");
                }
              }}
              onError={() => {
                setError("Google authentication failed");
              }}
            />
          </div>

          {error && (
            <div className="w-[464px] text-red-500 text-base text-center mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="w-[464px] text-green-600 text-base text-center mb-4">
              {success}
            </div>
          )}

          <div className="w-[464px] flex justify-between items-center mt-2">
            <span className="text-base font-semibold font-poppins">
              Already have an account?
            </span>
            <button
              type="button"
              className="text-blue-800 font-semibold text-base font-poppins underline"
              onClick={() => navigate("/")}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;