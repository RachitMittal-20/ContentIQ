import React from 'react';

export default function Insight() {
  return (
    <section id="insight">
      <div>
        <div className="sec-pill sr">The Insight</div>
        <div className="sec-conn" id="conn-insight">
          <div className="sc-fill" />
          <div className="sc-dash" />
          <div className="sc-dot" />
          <div className="sc-end" />
        </div>
        <p className="insight-text" id="insightText">
          You can't grow what you can't <span className="hi">measure</span>.<br />
          Content's hidden performance signals need to be<br />
          visible, comparable, and actionable.
        </p>
      </div>
    </section>
  );
}

