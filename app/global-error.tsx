'use client' // Error boundaries must be Client Components

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
         <div className="text-center py-16">
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button onClick={retry} className="btn btn-primary">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
};