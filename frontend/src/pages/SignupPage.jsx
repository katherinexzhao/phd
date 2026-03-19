import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Sparkles, UserPlus, Image as ImageIcon } from "lucide-react";
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
        setSuccess("Sign up successful! Redirecting...");
        setTimeout(() => navigate("/select-mode"), 1200);
      } else {
        setError(res.data.error || "Sign up failed");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="px-6 py-8 md:px-8 lg:px-10">
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Create Account
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Join LEAP
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Create your account to save papers, organize them with topic labels,
                and build your personalized lifelong learning path.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Short bio
                  </label>
                  <textarea
                    name="bio"
                    placeholder="Tell us a little about your learning interests"
                    className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ImageIcon className="h-4 w-4" />
                    <p className="text-sm font-medium">Profile picture</p>
                  </div>

                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-3">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="avatar preview"
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-violet-100"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                          <UserPlus className="h-5 w-5" />
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        PNG or JPG recommended
                      </p>
                    </div>
                  </div>

                  {avatarError ? (
                    <p className="mt-3 text-sm text-red-500">{avatarError}</p>
                  ) : null}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Sign Up
                  </button>

                  <div className="flex justify-center">
                    <GoogleLogin
                      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                      text="signup_with"
                      onSuccess={async (credentialResponse) => {
                        setError("");
                        setSuccess("");

                        try {
                          const res = await fetch(
                            `${API_BASE_URL}/api/auth/google-login`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                token: credentialResponse?.credential,
                              }),
                            }
                          );

                          const data = await res.json();

                          if (data.success) {
                            localStorage.setItem("email", data.email);
                            if (data.username) {
                              localStorage.setItem("username", data.username);
                            }
                            if (data.userId) {
                              localStorage.setItem("userId", data.userId);
                            }
                            setSuccess("Google sign up successful! Redirecting...");
                            setTimeout(() => navigate("/select-mode"), 1200);
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
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                  <span className="text-sm text-slate-600">
                    Already have an account?
                  </span>
                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-700 transition hover:text-violet-800"
                    onClick={() => navigate("/")}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>

            <div className="border-t border-slate-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-6 py-8 md:px-8 lg:border-l lg:border-t-0 lg:px-10">
              <div className="rounded-[24px] border border-violet-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
                  What happens next
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Start your learning journey
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  After signing up, you will choose your learning mode and begin
                  exploring papers, organizing topics, and building a personalized
                  research learning workflow.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Select your learning mode",
                    "Search and save research papers",
                    "Create topic labels",
                    "Generate lifelong learning plans",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;