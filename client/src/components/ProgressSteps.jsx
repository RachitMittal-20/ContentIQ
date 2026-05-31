import React from 'react';

const stateToIcon = (state) => {
  switch (state) {
    case 'done':
      return <span className="text-iq-success font-bold">✓</span>;
    case 'active':
      return <span className="text-iq-purple font-bold">●</span>;
    default:
      return <span className="text-iq-secondaryText">○</span>;
  }
};

export default function ProgressSteps({ steps, stepStates }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="w-1 bg-iq-border rounded-full" />
        <div className="flex-1">
          <ol className="space-y-3">
            {steps.map((label, idx) => {
              const state = stepStates?.[idx] || 'pending';
              return (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">{stateToIcon(state)}</div>
                  <div
                    className={
                      state === 'done'
                        ? 'text-iq-text'
                        : state === 'active'
                          ? 'text-iq-text'
                          : 'text-iq-secondaryText'
                    }
                  >
                    <span className="text-sm">{label}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

