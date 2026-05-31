import React from 'react';

export default function SuggestedChips({ questions, onPick }) {
  return (
    <div className="flex flex-wrap gap-3">
      {questions.map((q) => (
        <button
          type="button"
          key={q}
          onClick={() => onPick(q)}
          className="text-xs px-3 py-2 rounded-full border border-iq-border text-iq-secondaryText hover:text-iq-text hover:border-purple-400 transition"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

