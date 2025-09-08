'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}) {
  React.useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Something went wrong!
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            We apologize for the inconvenience. Please try again later.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
