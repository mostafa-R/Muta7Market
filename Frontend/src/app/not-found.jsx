'use client';

import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
            Return to home
          </button>
        </Link>
      </div>
    </div>
  );
}
