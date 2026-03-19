import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Sparkles, LogIn } from "lucide-react";
import { API_BASE_URL } from "../api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("email", email);
        if (data.username) {
          localStorage.setItem("username", data.username);
        }
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        navigate("/research");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-8 md:px-8 lg:px-10">
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Welcome Back
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Sign in to LEAP
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Continue exploring papers, organizing saved topics, and building your lifelong learning path.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm font-medium text-violet-700 transition hover:text-violet-800"
                      onClick={() => navigate("/forgot-password")}
                      tabIndex={-1}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Continue
                  </button>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
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
                            navigate("/research");
                          } else {
                            setError(data.error || "Google login failed");
                          }
                        } catch (err) {
                          setError("Google login network error");
                        }
                      }}
                      onError={() => {
                        setError("Google login failed");
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                  <span className="text-sm text-slate-600">
                    Don&apos;t have an account yet?
                  </span>
                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-700 transition hover:text-violet-800"
                    onClick={() => navigate("/signup")}
                    tabIndex={-1}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>

            <div className="border-t border-slate-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-6 py-8 md:px-8 lg:border-l lg:border-t-0 lg:px-10">
              <div className="rounded-[24px] border border-violet-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                  <LogIn className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
                  Continue Your Journey
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Return to your research workspace
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Access your saved papers, topic labels, search tools, and AI-assisted learning workflow in one place.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Resume paper exploration",
                    "Review saved topic groups",
                    "Use AI-assisted paper guidance",
                    "Build lifelong learning plans",
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
};

export default LoginPage;
