import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Pencil,
  Trash2,
  ArrowLeft,
  CheckSquare,
  Square,
  Layers3,
} from "lucide-react";

function normalizePaperType(type) {
  const value = (type || "Other").trim();
  return value || "Other";
}

function paperTypeOrder(type) {
  const normalized = type.toLowerCase();

  if (normalized.includes("survey")) return 0;
  if (normalized.includes("method")) return 1;
  if (normalized.includes("application")) return 2;
  if (normalized.includes("theory")) return 3;
  if (normalized.includes("experiment")) return 4;
  return 5;
}

export default function SavedPapersByTopicPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTopic = location.state?.topic || "";

  const [search, setSearch] = useState("");
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [savedTopicData, setSavedTopicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPaper, setEditingPaper] = useState(null);
  const [newTag, setNewTag] = useState("");

  const fetchSavedPapers = async () => {
    const email = localStorage.getItem("email");

    if (!email) {
      setError("User email not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/research/saved-papers-by-topic`,
        {
          params: { email },
        }
      );

      setSavedTopicData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch saved papers:", err);
      setError("Failed to load saved papers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPapers();
  }, []);

  const activeTopicGroup = useMemo(() => {
    if (savedTopicData.length === 0) {
      return null;
    }

    if (selectedTopic) {
      return savedTopicData.find((group) => group.topic === selectedTopic) || null;
    }

    return savedTopicData[0];
  }, [savedTopicData, selectedTopic]);

  const filteredPapers = useMemo(() => {
    if (!activeTopicGroup) {
      return [];
    }

    const q = search.trim().toLowerCase();
    if (!q) {
      return activeTopicGroup.papers || [];
    }

    return (activeTopicGroup.papers || []).filter((paper) => {
      const authors = Array.isArray(paper.authors)
        ? paper.authors.join(", ")
        : paper.authors || "";

      return (
        activeTopicGroup.topic.toLowerCase().includes(q) ||
        paper.title.toLowerCase().includes(q) ||
        authors.toLowerCase().includes(q) ||
        (paper.paperType || "").toLowerCase().includes(q) ||
        (paper.type || "").toLowerCase().includes(q)
      );
    });
  }, [activeTopicGroup, search]);

  const groupedPapers = useMemo(() => {
    const groups = filteredPapers.reduce((acc, paper) => {
      const type = normalizePaperType(paper.paperType);
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(paper);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => {
        const orderDiff = paperTypeOrder(a) - paperTypeOrder(b);
        return orderDiff !== 0 ? orderDiff : a.localeCompare(b);
      })
      .map(([type, papers]) => ({
        type,
        papers,
      }));
  }, [filteredPapers]);

  const handleRemovePaper = async (paperId) => {
    const email = localStorage.getItem("email");
    if (!email) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/research/remove-saved-paper`, {
        params: { email, paperId },
      });

      setSelectedPapers((prev) => prev.filter((id) => id !== paperId));
      fetchSavedPapers();
    } catch (err) {
      console.error("Failed to remove paper:", err);
    }
  };

  const handleUpdateTag = async (paperId, oldTag) => {
    const email = localStorage.getItem("email");
    if (!email || !newTag.trim()) return;

    try {
      await axios.put(`${API_BASE_URL}/api/research/update-paper-tag`, {
        email,
        paperId,
        oldTag,
        newTag: newTag.trim(),
      });

      setEditingPaper(null);
      setNewTag("");
      setSelectedPapers((prev) => prev.filter((id) => id !== paperId));
      fetchSavedPapers();
    } catch (err) {
      console.error("Failed to update tag:", err);
    }
  };

  const togglePaper = (paperId) => {
    setSelectedPapers((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId]
    );
  };

  const topicSelectionCount = filteredPapers.filter((paper) =>
    selectedPapers.includes(paper.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-8 lg:px-8">
            <button
              type="button"
              onClick={() => navigate("/learning-topics")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Topics
            </button>

            <div className="mt-5 flex items-center gap-2 text-slate-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                Topic Workspace
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  {activeTopicGroup?.topic || selectedTopic || "Topic Workspace"}
                </h1>
                <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                  Review one learning topic at a time and keep the same paper actions while browsing papers grouped by type.
                </p>

                {activeTopicGroup ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                      <Layers3 className="h-4 w-4" />
                      {activeTopicGroup.papers.length} paper
                      {activeTopicGroup.papers.length === 1 ? "" : "s"}
                    </span>
                    {topicSelectionCount > 0 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                        {topicSelectionCount} selected
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="w-full max-w-md">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search papers in this topic"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
              Loading topic papers...
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          ) : !activeTopicGroup ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
              Topic not found.
            </div>
          ) : groupedPapers.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
              No papers found in this topic.
            </div>
          ) : (
            groupedPapers.map((group) => (
              <div
                key={group.type}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                      {group.type}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {group.papers.length} paper
                      {group.papers.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {group.papers.map((paper) => {
                    const selected = selectedPapers.includes(paper.id);
                    const authors = Array.isArray(paper.authors)
                      ? paper.authors.join(", ")
                      : paper.authors || "";

                    return (
                      <div
                        key={paper.id}
                        className={`rounded-2xl border p-4 shadow-sm transition ${
                          selected
                            ? "border-violet-300 bg-violet-50/60"
                            : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => togglePaper(paper.id)}
                            className="mt-0.5 text-slate-500 transition hover:text-violet-600"
                            aria-label={selected ? "Deselect paper" : "Select paper"}
                          >
                            {selected ? (
                              <CheckSquare className="h-5 w-5 text-violet-600" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900">
                          {paper.title}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {paper.primaryCategory || "Uncategorized"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {paper.year}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                          {authors}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaper(paper.id);
                              setNewTag(activeTopicGroup.topic);
                            }}
                            title="Edit tag"
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemovePaper(paper.id)}
                            title="Remove paper"
                            className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate("/explain-paper", { state: { paper } })}
                          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Start Learning
                        </button>

                        {editingPaper === paper.id ? (
                          <div className="mt-3 space-y-2">
                            <input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              placeholder="Enter new topic tag"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateTag(paper.id, activeTopicGroup.topic)}
                                className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
                              >
                                Save Tag
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPaper(null);
                                  setNewTag("");
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
