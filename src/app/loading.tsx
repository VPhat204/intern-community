export default function Loading() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Loading modules...</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}