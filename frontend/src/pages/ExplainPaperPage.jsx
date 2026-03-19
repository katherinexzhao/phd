import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Brain,
  Lightbulb,
  Layers3,
} from "lucide-react";

export default function ExplainPaperPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const paper = location.state?.paper;

  const [mode, setMode] = useState("guided");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState(null);
  
  const [selectedAnalysisQuestion, setSelectedAnalysisQuestion] = useState(null);
  const [analysisAnswerLoading, setAnalysisAnswerLoading] = useState(false);
  const [analysisAnswers, setAnalysisAnswers] = useState({});
  const [pdfAnnotation, setPdfAnnotation] = useState(null);
  const [paperText, setPaperText] = useState("");
  const [paperTextLoading, setPaperTextLoading] = useState(false);

  
  useEffect(() => {
    const fetchExplanation = async () => {
      if (!paper?.title || !paper?.summary) {
        setError("Paper data is missing.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.post(
          `${API_BASE_URL}/api/research/explain-paper`,
          {
            paperId: paper.id,
            title: paper.title,
            summary: paper.summary,
            primaryCategory: paper.primaryCategory || paper.type || "",
            authors: Array.isArray(paper.authors)
            ? paper.authors
            : paper.authors
            ? [paper.authors]
            : [],
          }
        );

        setExplanation(response.data);
      } catch (err) {
        console.error("Failed to explain paper:", err);
        setError("Unable to generate AI explanation.");
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [paper]);

  useEffect(() => {
    const fetchPaperText = async () => {
      if (!paper?.pdfUrl) return;

      try {
        setPaperTextLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/api/research/paper-fulltext`,
          {
            params: { pdfUrl: paper.pdfUrl },
          }
        );

        setPaperText(response.data?.text || "");
      } catch (err) {
        console.error("Failed to fetch paper text:", err);
        setPaperText("");
      } finally {
        setPaperTextLoading(false);
      }
    };

    fetchPaperText();
  }, [paper]);

  const handleAnalysisQuestionClick = async (question) => {
    setSelectedAnalysisQuestion(question.key);

    if (analysisAnswers[question.key]) {
      setPdfAnnotation(analysisAnswers[question.key].annotation || null);
      return;
    }

    try {
      setAnalysisAnswerLoading(true);
      setError("");

      const response = await axios.post(
        `${API_BASE_URL}/api/research/explain-paper-question`,
        {
          title: paper.title,
          summary: paper.summary,
          paperId: paper.id,
          paperText,
          primaryCategory: paper.primaryCategory || paper.type || "",
          authors: Array.isArray(paper.authors)
            ? paper.authors
            : paper.authors
            ? [paper.authors]
            : [],
          questionKey: question.key,
          questionText: question.title,
        }
      );

      setAnalysisAnswers((prev) => ({
        ...prev,
        [question.key]: response.data,
      }));
      setPdfAnnotation(response.data?.annotation || null);
    } catch (err) {
      console.error("Failed to answer analysis question:", err);
      setError("Unable to generate analysis answer.");
    } finally {
      setAnalysisAnswerLoading(false);
    }
  };

  const guidedCards = [
    {
      key: "problem",
      title: "What is this paper about?",
      icon: <BookOpen className="h-4 w-4" />,
      content:
        explanation?.simple_explanation ||
        "The system will summarize the main problem and focus of the paper here.",
    },
    {
      key: "importance",
      title: "Why does it matter?",
      icon: <Lightbulb className="h-4 w-4" />,
      content:
        explanation?.why_it_matters ||
        "The system will explain why this paper is important in the field.",
    },
    {
      key: "type",
      title: "Paper Type",
      icon: <Layers3 className="h-4 w-4" />,
      content:
        explanation?.paperType ||
        "The system will identify whether this is a survey, method, application, theory, or experiment paper.",
    },
  ];

  const analysisQuestions = [
    {
      key: "motivation",
      title: "(1) What do the author(s) want to know (motivation)?",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      key: "methods",
      title: "(2) What did they do (approach/methods)?",
      icon: <Layers3 className="h-4 w-4" />,
    },
    {
      key: "context",
      title: "(3) Why was it done that way (context within the field)?",
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      key: "results",
      title: "(4) What do the results show (figures and data tables)?",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      key: "interpretation",
      title: "(5) How did the author(s) interpret the results (interpretation/discussion)?",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      key: "next_steps",
      title: "(6) What should be done next?",
      icon: <ArrowLeft className="h-4 w-4 rotate-180" />,
    },
  ];

  if (!paper) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">No paper selected</h1>
          <p className="mt-3 text-sm text-slate-600">
            Please go back and choose a paper first.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-8 lg:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="mt-6 flex items-center gap-2 text-slate-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                AI Annotated Paper View
              </span>
            </div>

            <h1 className="mt-3 max-w-5xl text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              {paper.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {(paper.primaryCategory || paper.type) ? (
  <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 ring-1 ring-violet-200">
    {paper.primaryCategory || paper.type}
  </span>
) : null}

              {paper.published ? (
                <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                  {new Date(paper.published).toLocaleDateString()}
                </span>
              ) : null}
            </div>

            {paper.authors ? (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
      Abstract
    </h3>
    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
      {paper.summary}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        Full Paper PDF
      </h3>

      <div className="flex items-center gap-2">
        {paper.absUrl ? (
          <a
            href={paper.absUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View Abstract Page
          </a>
        ) : null}

        {paper.pdfUrl ? (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            Open PDF
          </a>
        ) : null}
      </div>
    </div>

    {mode === "analysis" && pdfAnnotation ? (
      <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          PDF Annotation
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-900">
          {pdfAnnotation.label || "Selected analysis focus"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {pdfAnnotation.note}
        </p>
        {pdfAnnotation.location_hint ? (
          <p className="mt-2 text-xs text-slate-500">
            Suggested location: {pdfAnnotation.location_hint}
          </p>
        ) : null}
      </div>
    ) : null}

    {paper.pdfUrl ? (
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <iframe
          src={paper.pdfUrl}
          title="Paper PDF"
          className="h-[900px] w-full"
        />
      </div>
    ) : (
      <p className="mt-4 text-sm text-slate-500">
        No PDF available for this paper.
      </p>
    )}
  </div>
</div>
    
    
          <div className="space-y-6">
            <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    AI Reading Assistant
                  </h2>
                  <p className="text-sm text-slate-600">
                    Switch between guided learning and analytical reading.
                  </p>
                </div>
              </div>

              <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { key: "guided", label: "Guided Mode" },
                  { key: "analysis", label: "Analysis Mode" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMode(item.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      mode === item.key
                        ? "bg-violet-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {mode === "guided" ? (
                  loading ? (
                    <div className="rounded-2xl border border-dashed border-violet-200 bg-white/70 px-4 py-8 text-sm text-slate-500">
                      Generating AI explanation...
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                      {error}
                    </div>
                  ) : (
                    guidedCards.map((card) => (
                      <div
                        key={card.key}
                        className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-violet-700">
                          {card.icon}
                          <h3 className="text-sm font-semibold">{card.title}</h3>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {card.content}
                        </p>
                      </div>
                    ))
                  )
                ) : (
                  <>
                    <div className="rounded-2xl border border-violet-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                      {paperTextLoading
                        ? "Preparing full paper text for deeper analysis..."
                        : paperText
                        ? "Click a question to ask AI for a focused analysis based on the paper content and generate a PDF annotation note."
                        : "Full paper text is not available yet, so analysis may rely on the abstract."}
                    </div>

                    {analysisQuestions.map((question) => {
                      const isActive = selectedAnalysisQuestion === question.key;
                      return (
                        <button
                          key={question.key}
                          type="button"
                          onClick={() => handleAnalysisQuestionClick(question)}
                          disabled={paperTextLoading}
                          className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
                            paperTextLoading
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                              : isActive
                              ? "border-violet-300 bg-violet-50"
                              : "border-white bg-white/90 hover:border-violet-200 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-violet-700">{question.icon}</div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                {question.title}
                              </h3>
                              {analysisAnswers[question.key]?.answer ? (
  <div className="mt-2 space-y-3">
    <p className="text-sm leading-6 text-slate-700">
      {analysisAnswers[question.key].answer}
    </p>

    {Array.isArray(analysisAnswers[question.key].references) &&
    analysisAnswers[question.key].references.length > 0 ? (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          References from the paper
        </p>

        {analysisAnswers[question.key].references.map((ref, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <p className="text-xs font-semibold text-violet-700">
              {ref.section || "Paper Text"}
            </p>

            {ref.quote ? (
              <p className="mt-1 text-sm italic leading-6 text-slate-700">
                “{ref.quote}”
              </p>
            ) : null}

            {ref.reason ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {ref.reason}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    ) : null}
  </div>
) : isActive && analysisAnswerLoading ? (
                                <p className="mt-2 text-sm text-slate-500">
                                  Generating focused analysis...
                                </p>
                              ) : (
                                <p className="mt-2 text-sm text-slate-500">
                                  Click to generate an AI answer.
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
