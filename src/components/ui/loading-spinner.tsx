export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cyan-950">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  );
}

export function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-950 text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
        <p className="text-red-300 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}