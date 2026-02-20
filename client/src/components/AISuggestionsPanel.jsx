import React from "react";

const AISuggestionsPanel = ({ analysis, onApplyKeywords }) => {
  if (!analysis) return null;

  const scoreColor =
    analysis.score >= 80
      ? "text-green-400"
      : analysis.score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">
        📊 AI Suggestions & ATS Score
      </h2>

      {/* SCORE */}
      <div className={`text-4xl font-extrabold mb-6 ${scoreColor}`}>
        {analysis.score}%
      </div>

      {/* Missing Keywords */}
      <div className="mb-5">
        <h3 className="text-red-400 font-semibold mb-2">
          🔴 Missing Keywords
        </h3>

        {analysis.missingKeywords.length === 0 ? (
          <p className="text-green-400">
            Great! No important keywords missing.
          </p>
        ) : (
          <>
            <ul className="list-disc pl-5 text-gray-300">
              {analysis.missingKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>

            {/* ⭐ BUTTON ADDED CORRECTLY */}
            <button
              onClick={() => onApplyKeywords(analysis.missingKeywords)}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Apply Suggested Keywords
            </button>
          </>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <h3 className="text-yellow-400 font-semibold mb-2">
          💡 Improvement Tips
        </h3>

        <ul className="list-disc pl-5 text-gray-300">
          {analysis.suggestions.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AISuggestionsPanel;
