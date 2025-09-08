'use client';

import Link from 'next/link';
import React from 'react';

export default function Error({
  error,
  reset,
}) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            Try again
          </button>
          <Link href="/">
            <button className="border border-border px-4 py-2 rounded hover:bg-muted transition">
              Return to home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
