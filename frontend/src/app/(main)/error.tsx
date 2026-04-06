'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="material-symbols-outlined text-[64px] text-error/30 mb-4">
        error_outline
      </span>
      <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">
        Something went wrong
      </h2>
      <p className="text-on-surface-variant font-medium mb-6 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="custom-gradient text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
