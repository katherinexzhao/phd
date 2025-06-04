import React, { useState } from "react";

const INTERESTS = [
  "Mental Health", "Fitness", "Food & Nutrition", "Banking",
  "Healthcare", "Stock Market", "Education", "Planting",
  "IT", "Childcare", "Pets", "Legal Aid",
  "Employment", "Tax", "Cooking", "Community Service"
];

export default function InterestSelect({ onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [otherValue, setOtherValue] = useState("");

  // Toggle selection for an interest
  const toggleInterest = (interest) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Handle the Continue button click
  const handleContinue = () => {
    let interests = selected.filter(i => i !== "Others");
    if (selected.includes("Others") && otherValue.trim()) {
      // Split by comma, trim, and filter out empty
      const others = otherValue
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      interests = [...interests, ...others];
    }
    if (onSubmit) onSubmit(interests);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-blue-50 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col items-center py-14 px-14">
        {/* Title and subtitle */}
        <div className="mb-10 text-center">
          <div className="text-zinc-900 text-4xl font-extrabold tracking-tight mb-3">Tell us what you are interested in</div>
          <div className="text-zinc-500 text-xl font-light leading-7">Select one or a few topics to help us recommend the most relevant learning content for you.</div>
        </div>
        {/* Interests grid: 4 rows of 4 */}
        <div className="w-full flex flex-col gap-4 mb-8">
          {[0, 1, 2, 3].map(row => (
            <div key={row} className="flex flex-row gap-4 justify-center">
              {INTERESTS.slice(row * 4, row * 4 + 4).map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`w-48 h-14 rounded-xl border border-zinc-300 flex items-center justify-center text-lg font-semibold transition-all duration-200 shadow-sm
                    ${selected.includes(interest)
                      ? "bg-gradient-to-r from-indigo-500 to-blue-400 text-white scale-105 shadow-lg"
                      : "bg-white text-zinc-700 hover:bg-blue-50 hover:scale-105"}
                  `}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          ))}
          {/* Others row, centered */}
          <div className="flex flex-row gap-2 justify-center items-center mt-2">
            <button
              key="Others"
              type="button"
              className={`w-48 h-14 rounded-xl border border-zinc-300 flex items-center justify-center text-lg font-semibold transition-all duration-200 shadow-sm
                ${selected.includes("Others")
                  ? "bg-gradient-to-r from-indigo-500 to-blue-400 text-white scale-105 shadow-lg"
                  : "bg-white text-zinc-700 hover:bg-blue-50 hover:scale-105"}
              `}
              onClick={() => toggleInterest("Others")}
            >
              Others
            </button>
            {selected.includes("Others") && (
              <div className="flex flex-col items-start">
                <input
                  type="text"
                  className="w-56 h-12 border border-zinc-300 rounded-xl px-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Please specify..."
                  value={otherValue}
                  onChange={e => setOtherValue(e.target.value)}
                />
                <span className="text-xs text-gray-500 mt-1 ml-1">
                  Please separate multiple interests with commas (,)
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Continue button */}
        <button
          className="w-64 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-400 shadow-xl text-white text-xl font-bold tracking-wide mt-2 transition-all duration-200 hover:from-indigo-600 hover:to-blue-500 hover:scale-105 disabled:opacity-50"
          onClick={handleContinue}
          disabled={selected.length === 0 || (selected.includes("Others") && !otherValue.trim())}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 