import React from "react" 
import { BookOpen, Microscope, ArrowRight, Sparkles } from "lucide-react";
import structuredGif from "../assets/structured.gif";
import exploratoryGif from "../assets/exploratory.gif";

/**
 * ModeSelectionPage
 *
 * Safe to render both inside and outside react-router.
 * - If `onSelectMode` is provided, it will be called with the selected mode.
 * - Otherwise it falls back to `window.location.href` navigation.
 */
export default function ModeSelectionPage({ onSelectMode }) {
  const handleSelectMode = (mode) => {
    try {
      localStorage.setItem("learningMode", mode);
    } catch (error) {
      console.warn("Could not save learning mode to localStorage:", error);
    }

    if (typeof onSelectMode === "function") {
      onSelectMode(mode);
      return;
    }

    const targetPath = mode === "structured" ? "/structured" : "/research";

    if (typeof window !== "undefined") {
      window.location.href = targetPath;
    }
  };

  const structuredFeatures = [
    "Guided study plans",
    "Beginner-friendly learning flow",
    "OER-based structured resources",
  ];

  const researchFeatures = [
    "Explore research papers",
    "AI-powered paper understanding",
    "Advanced topic discovery",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-5 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">
                LEAP
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Choose Your Learning Mode
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600 md:text-sm">
              Select the experience that best matches your current learning goal.
              You can always switch modes later.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ModeCard
            icon={<BookOpen className="h-7 w-7" />}
            iconBg="bg-blue-600"
            iconShadow="shadow-blue-200"
            border="border-blue-100"
            overlay="from-blue-50/70 via-white to-blue-100/40"
            title="Structured Learning Mode"
            description="Best for beginners and skill-building. Follow guided study plans with step-by-step learning support."
            features={structuredFeatures}
            dotColor="bg-blue-500"
            buttonBg="bg-blue-600 hover:bg-blue-700"
            buttonLabel="Start Learning (Coming soon)"
            onClick={() => handleSelectMode("structured")}
          >
            <div className="mb-6 flex justify-center">
              <img
                src={structuredGif}
                alt="Structured learning illustration"
                className="w-36 md:w-44 rounded-xl"
              />
            </div>
          </ModeCard>

          <ModeCard
            icon={<Microscope className="h-7 w-7" />}
            iconBg="bg-violet-600"
            iconShadow="shadow-violet-200"
            border="border-violet-100"
            overlay="from-violet-50/80 via-white to-fuchsia-100/40"
            title="Research Exploration Mode"
            description="Best for advanced learners exploring research topics through papers, concepts, and AI-assisted scholarly learning."
            features={researchFeatures}
            dotColor="bg-violet-500"
            buttonBg="bg-violet-600 hover:bg-violet-700"
            buttonLabel="Explore Research"
            onClick={() => handleSelectMode("research")}
          >
            <div className="mb-6 flex justify-center">
              <img
                src={exploratoryGif}
                alt="Exploratory learning illustration"
                className="w-36 md:w-44 rounded-xl"
              />
            </div>
          </ModeCard>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  iconBg,
  iconShadow,
  border,
  overlay,
  title,
  description,
  features,
  dotColor,
  buttonBg,
  buttonLabel,
  onClick,
  children,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] border ${border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-6`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${overlay} opacity-90`} />
      <div className="relative z-10">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-white shadow-md ${iconShadow}`}
        >
          {icon}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600 md:text-sm">
            {description}
          </p>
        </div>

        {children}

        <div className="mb-4 space-y-2">
          {features.map((item) => (
            <div key={item} className="flex items-center gap-3 text-slate-700">
              <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
              <span className="text-sm md:text-sm">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClick}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition md:text-sm ${buttonBg}`}
          type="button"
        >
          {buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Basic usage examples:
 *
 * 1) Without react-router:
 *    <ModeSelectionPage />
 *
 * 2) With react-router:
 *    import { useNavigate } from "react-router-dom";
 *
 *    function ModeSelectionRoute() {
 *      const navigate = useNavigate();
 *      return (
 *        <ModeSelectionPage
 *          onSelectMode={(mode) => navigate(mode === "structured" ? "/structured" : "/research")}
 *        />
 *      );
 *    }
 */
