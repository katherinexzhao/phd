import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import {
  Search,
  Sparkles,
  Brain,
  ArrowRight,
  Users,
  Layers3,
} from "lucide-react";

const communityContent = [
  {
    id: 1,
    title: "Graph Neural Networks: A Review of Methods and Applications",
    tag: "Trending in Community",
    description:
      "A widely shared survey paper that gives a strong foundation for learners exploring graph-based research topics.",
    time: "12 min overview",
    source: "Shared in AI Research Circle",
  },
  {
    id: 2,
    title: "AI Privacy Risks in Digital Health Assistants",
    tag: "Community Pick",
    description:
      "A discussion-driven paper on privacy, trust, and governance challenges in AI health systems.",
    time: "8 min overview",
    source: "Discussed in Health AI Group",
  },
  {
    id: 3,
    title: "Explainable Machine Learning for Clinical Decision Support",
    tag: "Popular Resource",
    description:
      "A useful paper for learners interested in interpretable AI and applied health informatics research.",
    time: "10 min overview",
    source: "Recommended by 14 learners",
  },
];

const platformContent = [
  {
    id: "p1",
    type: "community",
    title: "AI Privacy Discussion Thread",
    tag: "Community Discussion",
    description:
      "Recent discussion about privacy risks, trust concerns, and governance issues in AI assistants.",
    time: "Discussion",
    source: "Health AI Group",
  },
  {
    id: "p2",
    type: "resource",
    title: "Shared Notes on Research Methods",
    tag: "Shared Resource",
    description:
      "A learner-uploaded resource summarizing qualitative and quantitative research design basics.",
    time: "Resource",
    source: "Community Resource Board",
  },
  {
    id: "p3",
    type: "group",
    title: "Graph Learning Study Circle",
    tag: "Research Group",
    description:
      "A community group where learners share papers and discuss graph neural network topics together.",
    time: "Group",
    source: "AI Research Circle",
  },
];

const PAPER_TYPE_OPTIONS = [
  "Survey",
  "Method",
  "Application",
  "Experiment",
  "Theory",
  "Other",
];

const assistantPrompts = {
  general: [
    "Help me search papers on a topic",
    "Suggest research topics to explore",
    "Turn my question into search keywords",
  ],
  results: [
    "Summarize these search results",
    "Recommend 3 papers to start with",
    "Find beginner-friendly papers",
    "What themes appear in these results?",
  ],
};

export default function ResearchHomePage({ onNavigateCommunity }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchScope, setSearchScope] = useState("paper");
  const [searchResults, setSearchResults] = useState([]);
  const [platformResults, setPlatformResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 10;
  const [inputMode, setInputMode] = useState("manual"); 
  const [assistantContext, setAssistantContext] = useState("general");
  const [continueTopic, setContinueTopic] = useState(null);
  const suggestedTopics = continueTopic?.topic ? [continueTopic.topic] : [];

  useEffect(() => {
    const fetchContinueTopic = async () => {
      const email = localStorage.getItem("email");
      if (!email) {
        setContinueTopic(null);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/research/saved-papers-by-topic`,
          {
            params: { email },
          }
        );

        const topics = Array.isArray(response.data) ? response.data : [];
        if (topics.length === 0) {
          setContinueTopic(null);
          return;
        }

        const nextTopic = [...topics].sort(
          (a, b) => (b.papers?.length || 0) - (a.papers?.length || 0)
        )[0];
        setContinueTopic(nextTopic);
      } catch (err) {
        console.error("Failed to fetch continue topic:", err);
        setContinueTopic(null);
      }
    };

    fetchContinueTopic();
  }, []);

  const handleSearch = async (
  searchTerm = query,
  nextPage = 0,
  scope = searchScope
) => {
  const trimmedQuery = searchTerm.trim();

  if (!trimmedQuery) {
    setSearchResults([]);
    setPlatformResults([]);
    setHasSearched(false);
    setError("");
    setPage(0);
    setTotalResults(0);
    setAssistantContext("general");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setHasSearched(true);
    setAssistantContext("results");

    let paperQuery = trimmedQuery;
    let platformQuery = trimmedQuery;

    // Only use AI conversion in natural language mode
    if (inputMode === "natural") {
      const interpretResponse = await axios.post(
        `${API_BASE_URL}/api/research/interpret-query`,
        {
          query: trimmedQuery,
          scope,
        }
      );

      paperQuery = interpretResponse.data.paperQuery || trimmedQuery;
      platformQuery = interpretResponse.data.platformQuery || trimmedQuery;
    }

    if (scope === "paper") {
      const response = await axios.get(
        `${API_BASE_URL}/api/research/arxiv-search`,
        {
          params: {
            q: paperQuery,
            start: nextPage * pageSize,
            max_results: pageSize,
          },
        }
      );

      setSearchResults(response.data.results || []);
      setPlatformResults([]);
      setPage(nextPage);
      setTotalResults(response.data.totalResults || 0);
    }

    if (scope === "platform") {
      const filteredPlatform = platformContent.filter(
        (item) =>
          item.title.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.tag.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.source.toLowerCase().includes(platformQuery.toLowerCase())
      );

      setPlatformResults(filteredPlatform);
      setSearchResults([]);
      setPage(0);
      setTotalResults(filteredPlatform.length);
    }

    if (scope === "both") {
      const paperResponse = await axios.get(
        `${API_BASE_URL}/api/research/arxiv-search`,
        {
          params: {
            q: paperQuery,
            start: nextPage * pageSize,
            max_results: pageSize,
          },
        }
      );

      const filteredPlatform = platformContent.filter(
        (item) =>
          item.title.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.tag.toLowerCase().includes(platformQuery.toLowerCase()) ||
          item.source.toLowerCase().includes(platformQuery.toLowerCase())
      );

      setSearchResults(paperResponse.data.results || []);
      setPlatformResults(filteredPlatform);
      setPage(nextPage);
      setTotalResults(paperResponse.data.totalResults || 0);
    }
  } catch (err) {
    console.error("search failed:", err);
    setError("Failed to fetch search results. Please try again.");
    setSearchResults([]);
    setPlatformResults([]);
  } finally {
    setLoading(false);
  }
};

  const handleTopicClick = (topic) => {
    setQuery(topic);
    handleSearch(topic, 0, searchScope);
  };

  const handleFindOutMore = () => {
    if (typeof onNavigateCommunity === "function") {
      onNavigateCommunity();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = "/community";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="px-6 pt-8 pb-2 lg:px-8">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                Research Exploration
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Explore Together
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
              Discover research topics, search open access papers, explore community-shared materials, and use AI support to understand concepts, methods, and key findings.
            </p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="w-full max-w-5xl">
              <div className="mt-4 space-y-5">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Search Scope
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "paper", label: "Open Access Database" },
                      { key: "platform", label: "Search in the Platform" },
                      { key: "both", label: "Search Both" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSearchScope(item.key)}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                          searchScope === item.key
                            ? "bg-violet-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Search Type
                    </p>
                    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                      {[
                        { key: "manual", label: "Manual" },
                        { key: "natural", label: "Natural Language" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setInputMode(item.key)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            inputMode === item.key
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 md:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch(query, 0, searchScope);
                        }
                      }}
                      placeholder={
                        inputMode === "manual"
                          ? "Use keywords or boolean search, e.g. AI privacy AND healthcare"
                          : "Describe what you want to learn, e.g. I would like to learn AI in SDG Mapping"
                      }
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearch(query, 0, searchScope)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Search className="h-4 w-4" />
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {!hasSearched
                    ? "Recommended from the Community"
                    : searchScope === "paper"
                    ? "Paper Database Results"
                    : searchScope === "platform"
                    ? "Platform Search Results"
                    : "Search Results"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {!hasSearched
                    ? "Content you may be interested in based on community activity and shared resources."
                    : searchScope === "paper"
                    ? "Relevant papers retrieved from arXiv based on your search."
                    : searchScope === "platform"
                    ? "Relevant results found across your platform content."
                    : "Results from both the paper database and the platform."}
                </p>
              </div>

              {!hasSearched ? (
                <button
                  type="button"
                  onClick={handleFindOutMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Find out more
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                  {error}
                </div>
              ) : loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  Searching...
                </div>
              ) : hasSearched ? (
                <>
                  {(searchScope === "paper" || searchScope === "both") && (
                    <div className="space-y-4">
                      {searchScope === "both" && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Layers3 className="h-4 w-4" />
                          <h3 className="text-base font-semibold">Papers from arXiv</h3>
                        </div>
                      )}

                      {searchResults.length > 0 ? (
                        <>
                          {searchResults.map((paper) => (
                            <ArxivCard key={paper.id} paper={paper} />
                          ))}

                          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-600">
                              Showing{" "}
                              <span className="font-semibold text-slate-900">
                                {page * pageSize + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-semibold text-slate-900">
                                {Math.min((page + 1) * pageSize, totalResults)}
                              </span>{" "}
                              of{" "}
                              <span className="font-semibold text-slate-900">
                                {totalResults}
                              </span>{" "}
                              results
                            </p>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleSearch(query, page - 1, searchScope)}
                                disabled={page === 0 || loading}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Previous
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSearch(query, page + 1, searchScope)}
                                disabled={(page + 1) * pageSize >= totalResults || loading}
                                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                          No papers found.
                        </div>
                      )}
                    </div>
                  )}

                  {(searchScope === "platform" || searchScope === "both") && (
                    <div className="space-y-4">
                      {searchScope === "both" && (
                        <div className="mt-6 flex items-center gap-2 text-slate-700">
                          <Users className="h-4 w-4" />
                          <h3 className="text-base font-semibold">Results from the Platform</h3>
                        </div>
                      )}

                      {platformResults.length > 0 ? (
                        platformResults.map((item) => (
                          <CommunityCard key={item.id} item={item} />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                          No platform results found.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                communityContent.map((item) => (
                  <CommunityCard key={item.id} item={item} />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            {hasSearched ? (
              <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      AI Assistant for Current Results
                    </h2>
                    <p className="text-sm text-slate-600">
                      Use AI to understand, filter, and navigate the current search results.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {assistantPrompts[assistantContext].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl border border-white bg-white/90 px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ContinueLearningCard navigate={navigate} topicGroup={continueTopic} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CommunityCard({ item }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-200 hover:bg-white hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {item.tag}
        </span>
        {item.time ? <span className="text-xs text-slate-500">{item.time}</span> : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">{item.source}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Explore
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ContinueLearningCard({ navigate, topicGroup }) {
  const topicName = topicGroup?.topic;
  const papers = Array.isArray(topicGroup?.papers) ? topicGroup.papers : [];
  const paperTypes = [...new Set(papers.map((paper) => paper.paperType).filter(Boolean))];
  const leadPaper = papers[0];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
      <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          {topicName ? "Current Topic" : "Learning Topics"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          {topicName || "Start building your first learning topic"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {topicName
            ? `Continue with ${papers.length} saved paper${papers.length === 1 ? "" : "s"} grouped in this topic${paperTypes.length ? ` across ${paperTypes.join(", ")}` : ""}.`
            : "Save papers into topics to build a focused learning workspace you can return to from here."}
        </p>
        {leadPaper ? (
          <p className="mt-3 text-xs font-medium text-slate-500">
            Next up: {leadPaper.title}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() =>
              topicName
                ? navigate("/saved-papers-by-topic", { state: { topic: topicName } })
                : navigate("/learning-topics")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {topicName ? "Resume Topic" : "Explore Topics"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/learning-topics")}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-600 bg-white px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
          >
            View All Topics
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArxivCard({ paper }) {
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiExplanation, setAiExplanation] = useState(null);
  const [paperType, setPaperType] = useState(""); 
  // New state for save functionality
  const [showSaveBox, setShowSaveBox] = useState(false);
  const [topicLabel, setTopicLabel] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(false);
  const [existingTags, setExistingTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const handleExplainPaper = async () => {
    if (showAI && aiExplanation) {
      setShowAI(false);
      return;
    }

    try {
      setShowAI(true);
      setAiLoading(true);
      setAiError("");
      setAiExplanation(null);

      const response = await axios.post(`${API_BASE_URL}/api/research/explain-paper`, {
        paperId: paper.id,
        title: paper.title,
        summary: paper.summary,
        authors: paper.authors || [],
        primaryCategory: paper.primaryCategory || "",
      });

      setAiExplanation(response.data);
      setPaperType(response.data?.paperType || "");
    } catch (error) {
      console.error("Failed to explain paper:", error);
      setAiError("Failed to generate AI explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  // Save paper handler
  const handleSavePaper = async () => {
    const email = localStorage.getItem("email");

    if (!email) {
      setSaveMessage("User email not found. Please log in again.");
      return;
    }

    if (!topicLabel.trim()) {
      setSaveMessage("Please enter a topic label.");
      return;
    }

    if (!paperType) {
      setSaveMessage("Please choose a paper type or let AI select one before saving.");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveMessage("");
      
      let resolvedPaperType = paperType;
      if (!resolvedPaperType) {
        const explainResponse = await axios.post(
          `${API_BASE_URL}/api/research/explain-paper`,
          {
            paperId: paper.id,
            title: paper.title,
            summary: paper.summary,
            primaryCategory: paper.primaryCategory || "",
            authors: paper.authors || [],
          }
        );

        resolvedPaperType = explainResponse.data?.paperType || "Other";
        setAiExplanation(explainResponse.data);
        setPaperType(resolvedPaperType);
        }

      await axios.post(`${API_BASE_URL}/api/research/save-paper`, {
        email,
        topicLabel: topicLabel.trim(),
        paper: {
          paperId: paper.id,
          title: paper.title,
          summary: paper.summary,
          authors: paper.authors || [],
          pdfUrl: paper.pdfUrl || "",
          absUrl: paper.absUrl || "",
          published: paper.published || "",
          primaryCategory: paper.primaryCategory || "",
          paperType: resolvedPaperType || "Other",
        },
      });

      setSaveMessage("Paper saved successfully.");
      setIsSaved(true);
      setTopicLabel("");
    } catch (error) {
      console.error("Failed to save paper:", error);
      setSaveMessage("Failed to save paper.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChoosePaperTypeWithAI = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setSaveMessage("");

      const response = await axios.post(`${API_BASE_URL}/api/research/explain-paper`, {
        paperId: paper.id,
        title: paper.title,
        summary: paper.summary,
        authors: paper.authors || [],
        primaryCategory: paper.primaryCategory || "",
      });

      const aiPaperType = response.data?.paperType || "Other";
      setAiExplanation(response.data);
      setPaperType(aiPaperType);
      setSaveMessage(`AI selected paper type: ${aiPaperType}`);
    } catch (error) {
      console.error("Failed to choose paper type with AI:", error);
      setSaveMessage("AI could not choose a paper type right now.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email || !paper?.id) return;

    const checkSavedStatus = async () => {
      try {
        setCheckingSaved(true);
        const response = await axios.get(`${API_BASE_URL}/api/research/paper-save-status`, {
          params: {
            email,
            paperId: paper.id,
          },
        });
        setIsSaved(Boolean(response.data?.isSaved));
      } catch (error) {
        console.error("Failed to check saved status:", error);
      } finally {
        setCheckingSaved(false);
      }
    };

    checkSavedStatus();
  }, [paper?.id]);

  useEffect(() => {
    if (!showSaveBox) return;

    const email = localStorage.getItem("email");
    if (!email) return;

    const fetchExistingTags = async () => {
      try {
        setLoadingTags(true);
        const response = await axios.get(`${API_BASE_URL}/api/research/topic-tags`, {
          params: { email },
        });
        setExistingTags(Array.isArray(response.data?.tags) ? response.data.tags : []);
      } catch (error) {
        console.error("Failed to fetch topic tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchExistingTags();
  }, [showSaveBox]);

  const filteredTagSuggestions = useMemo(() => {
    const trimmed = topicLabel.trim().toLowerCase();
    if (!trimmed) return existingTags.slice(0, 5);

    return existingTags
      .filter((tag) => tag.toLowerCase().includes(trimmed))
      .slice(0, 5);
  }, [topicLabel, existingTags]);

  return (
    <div className="relative rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-200 hover:bg-white hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {paper.primaryCategory ? (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            {paper.primaryCategory}
          </span>
        ) : null}
        {paper.published ? (
          <span className="text-xs text-slate-500">
            {new Date(paper.published).toLocaleDateString()}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{paper.title}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{paper.summary}</p>

      {paper.authors?.length ? (
        <p className="mt-3 text-xs font-medium text-slate-500">
          {paper.authors.join(", ")}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {paper.absUrl ? (
          <a
            href={paper.absUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            View Abstract
          </a>
        ) : null}

        {paper.pdfUrl ? (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open PDF
          </a>
        ) : null}
        {isSaved ? (
          <button
            type="button"
            disabled
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            Saved
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowSaveBox(!showSaveBox);
              setSaveMessage("");
            }}
            disabled={checkingSaved}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {checkingSaved ? "Checking..." : "Save"}
          </button>
        )}
      </div>

      {showSaveBox && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Topic Label
          </label>

          <input
            type="text"
            value={topicLabel}
            onChange={(e) => setTopicLabel(e.target.value)}
            placeholder="e.g. AI Privacy"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
          />

          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-500">
              {loadingTags ? "Loading saved labels..." : "Suggested existing labels"}
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredTagSuggestions.length > 0 ? (
                filteredTagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTopicLabel(tag)}
                    className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400">No matching saved labels yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">
                Paper Type
              </label>
              <button
                type="button"
                onClick={handleChoosePaperTypeWithAI}
                disabled={aiLoading}
                className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
              >
                {aiLoading ? "AI choosing..." : "Use AI to choose"}
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {PAPER_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setPaperType(option);
                    setSaveMessage("");
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    paperType === option
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Choose one of the six allowed types before saving.
            </p>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleSavePaper}
              disabled={saveLoading || !paperType}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {saveLoading ? "Saving..." : "Save to Repository"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSaveBox(false);
                setTopicLabel("");
                setPaperType("");
                setSaveMessage("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>

          {saveMessage ? (
            <p className="mt-3 text-sm text-slate-600">{saveMessage}</p>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={handleExplainPaper}
        title="AI Summary"
        className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-600 shadow-sm transition hover:bg-violet-50"
      >
        <Brain className="h-4 w-4" />
      </button>

      {showAI && (
        <div className="absolute left-[calc(100%+16px)] top-1/2 z-30 w-[340px] -translate-y-1/2 rounded-2xl border border-violet-200 bg-white/80 p-4 text-sm text-slate-700 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-semibold text-violet-700">AI Quick Explanation</p>
            <button
              type="button"
              onClick={() => setShowAI(false)}
              className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
            >
              Close
            </button>
          </div>

          {aiLoading ? (
            <p className="text-slate-600">Generating explanation...</p>
          ) : aiError ? (
            <p className="text-red-500">{aiError}</p>
          ) : aiExplanation ? (
            <div className="space-y-3">
              <div>
                <p className="font-medium text-violet-700">Simple Explanation</p>
                <p>{aiExplanation.simple_explanation}</p>
              </div>
              <div>
                <p className="font-medium text-violet-700">Why It Matters</p>
                <p>{aiExplanation.why_it_matters}</p>
              </div>
              <div>
                <p className="font-medium text-violet-700">Paper Type</p>
                <p>{aiExplanation.paper_type}</p>
              </div>
            </div>
          ) : null}

          <div className="absolute left-[-9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-violet-200 bg-white/80 backdrop-blur-md" />
        </div>
      )}
    </div>
  );
}
