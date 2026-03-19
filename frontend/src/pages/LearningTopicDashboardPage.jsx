import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  ArrowRight,
  ArrowLeft,
  Brain,
  BookOpen,
  Layers3,
  FlaskConical,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const PAPER_TYPE_PREVIEW = [
  { key: "survey", label: "Surveys", icon: <BookOpen className="h-4 w-4" /> },
  { key: "method", label: "Methods", icon: <Layers3 className="h-4 w-4" /> },
  { key: "application", label: "Applications", icon: <Brain className="h-4 w-4" /> },
  { key: "experiment", label: "Experiments", icon: <FlaskConical className="h-4 w-4" /> },
  { key: "theory", label: "Theories", icon: <Sparkles className="h-4 w-4" /> },
  { key: "other", label: "Other", icon: <Lightbulb className="h-4 w-4" /> },
];

function normalizePreviewType(type) {
  const normalized = (type || "").trim().toLowerCase();

  if (normalized.includes("survey")) return "survey";
  if (normalized.includes("method")) return "method";
  if (normalized.includes("application")) return "application";
  if (normalized.includes("experiment")) return "experiment";
  if (normalized.includes("theory")) return "theory";
  return "other";
}

function topicStatusMeta(status) {
  switch (status) {
    case "Active":
      return {
        chip: "bg-violet-50 text-violet-700 ring-violet-200",
        icon: <Clock3 className="h-4 w-4" />,
      };
    case "Stable":
      return {
        chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    default:
      return {
        chip: "bg-sky-50 text-sky-700 ring-sky-200",
        icon: <Lightbulb className="h-4 w-4" />,
      };
  }
}

export default function LearningTopicDashboardPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [savedTopicData, setSavedTopicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicDraftName, setTopicDraftName] = useState("");
  const [deletingTopic, setDeletingTopic] = useState(null);

  useEffect(() => {
    const fetchSavedTopics = async () => {
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
        console.error("Failed to fetch learning topics:", err);
        setError("Failed to load learning topics.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedTopics();
  }, []);

  const topicCards = useMemo(() => {
    return savedTopicData.map((group) => {
      const papers = Array.isArray(group.papers) ? group.papers : [];
      const typeCounts = papers.reduce(
        (acc, paper) => {
          const key = normalizePreviewType(paper.paperType || paper.type);
          acc[key] += 1;
          return acc;
        },
        {
          survey: 0,
          method: 0,
          application: 0,
          experiment: 0,
          theory: 0,
          other: 0,
        }
      );

      let status = "Building";
      if (papers.length >= 5) {
        status = "Active";
      } else if (papers.length >= 3) {
        status = "Building";
      } else if (papers.length > 0) {
        status = "Stable";
      }

      return {
        id: group.topic,
        topic: group.topic,
        description:
          papers.length > 0
            ? `Track saved papers, revisit important ideas, and keep building this learning topic over time.`
            : "No saved papers in this topic yet.",
        totalPapers: papers.length,
        typeCounts,
        visibleTypeCounts: PAPER_TYPE_PREVIEW.filter((item) => typeCounts[item.key] > 0),
        status,
      };
    });
  }, [savedTopicData]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topicCards;

    return topicCards.filter(
      (topic) =>
        topic.topic.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q)
    );
  }, [query, topicCards]);

  const totalTopics = topicCards.length;
  const totalPapers = topicCards.reduce((sum, topic) => sum + topic.totalPapers, 0);
  const activeTopics = topicCards.filter((topic) => topic.status === "Active").length;

  const openEditTopic = (topicName) => {
    setEditingTopic(topicName);
    setTopicDraftName(topicName);
  };

  const closeEditTopic = () => {
    setEditingTopic(null);
    setTopicDraftName("");
  };

  const handleEditTopic = () => {
    const nextTopic = topicDraftName.trim();

    if (!editingTopic || !nextTopic) {
      return;
    }

    setSavedTopicData((prev) =>
      prev.map((group) =>
        group.topic === editingTopic
          ? {
              ...group,
              topic: nextTopic,
            }
          : group
      )
    );
    closeEditTopic();
  };

  const handleDeleteTopic = () => {
    if (!deletingTopic) {
      return;
    }

    setSavedTopicData((prev) => prev.filter((group) => group.topic !== deletingTopic));
    setDeletingTopic(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <button
                type="button"
                onClick={() => navigate("/research")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home 
              </button>

              <div className="mt-5 flex items-center gap-2 text-slate-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Learning Topic Dashboard
                </span>
              </div>

              <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Topic Dashboard
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Organize saved papers into learning topics, review paper types, and continue building understanding topic by topic.
              </p>

              <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search learning topics"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Learning Snapshot</h2>
                  <p className="text-sm text-slate-600">A high-level view of your ongoing research journey.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricCard label="Topics" value={String(totalTopics)} />
                <MetricCard label="Saved papers" value={String(totalPapers)} />
                <MetricCard label="Active topics" value={String(activeTopics)} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
                Loading learning topics...
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">
                {error}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
                No learning topics found.
              </div>
            ) : (
              filteredTopics.map((topic) => {
              const meta = topicStatusMeta(topic.status);

              return (
                <div
                  key={topic.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${meta.chip}`}>
                            {meta.icon}
                            {topic.status}
                          </span>
                          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {topic.totalPapers} papers
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTopic(topic.topic)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit Topic
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTopic(topic.topic)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Topic
                          </button>
                        </div>
                      </div>

                      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                        {topic.topic}
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {topic.description}
                      </p>

                      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {topic.visibleTypeCounts.map((item) => (
                          <InfoPill
                            key={item.key}
                            icon={item.icon}
                            text={`${topic.typeCounts[item.key]} ${item.label}`}
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/saved-papers-by-topic", {
                          state: { topic: topic.topic },
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      Open Topic Workspace
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900">Recommended structure</h2>
              </div>
              <div className="mt-4 space-y-3">
                <RightNote title="Foundations first" text="Survey papers help users understand the landscape before method-level reading." />
                <RightNote title="Keep topic memory" text="Notes and insights make it easier to revisit a topic after weeks or months." />
              </div>
            </div>
          </div>
        </section>

        {editingTopic ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Edit Topic
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">Rename learning topic</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditTopic}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Topic name
                </label>
                <input
                  value={topicDraftName}
                  onChange={(e) => setTopicDraftName(e.target.value)}
                  placeholder="Enter a topic name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditTopic}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditTopic}
                  className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Save Topic
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {deletingTopic ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-red-100 bg-white p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
                Delete Topic
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Remove this topic from the dashboard?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This frontend-only version removes <span className="font-semibold text-slate-900">{deletingTopic}</span> from the current page view. Backend deletion can be wired next.
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingTopic(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTopic}
                  className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete Topic
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white/90 px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoPill({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
      <div className="text-slate-500">{icon}</div>
      <span>{text}</span>
    </div>
  );
}

function RightNote({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
