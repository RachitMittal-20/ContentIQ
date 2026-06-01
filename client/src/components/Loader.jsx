import React from 'react';

export default function Loader({ bootOut, bootProgress }) {
  return (
    <div id="loader" className={bootOut ? 'out' : ''}>
      <div className="ld-logo">
        Content<span>IQ</span>
      </div>
      <div className="ld-bar-w">
        <div className="ld-bar" id="ldBar" style={{ width: bootProgress + '%' }} />
      </div>
      <div className="ld-num" id="ldNum">
        {Math.floor(bootProgress)}%
      </div>
    </div>
  );
}

