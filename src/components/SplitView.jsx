/** Invoice on the left (sticky on desktop), extracted data on the right; stacked on mobile. */
export default function SplitView({ viewer, children }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="min-w-0 lg:sticky lg:top-24">{viewer}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
