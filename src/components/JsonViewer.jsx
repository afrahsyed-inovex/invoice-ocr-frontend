import { toPrettyJson } from '../utils/json';

// Matches JSON strings (and an optional trailing colon for keys), literals, and numbers.
const TOKEN_PATTERN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function getTokenClass(token) {
  if (token.startsWith('"')) {
    return token.trimEnd().endsWith(':') ? 'text-brand-700 dark:text-brand-300' : 'text-emerald-700 dark:text-emerald-400';
  }
  if (token === 'null') return 'text-slate-400 dark:text-slate-500';
  if (token === 'true' || token === 'false') return 'text-rose-600 dark:text-rose-400';
  return 'text-amber-700 dark:text-amber-400';
}

/** Splits pretty JSON into coloured spans; built from React elements, never raw HTML. */
function highlight(json) {
  const parts = [];
  let lastIndex = 0;

  for (const match of json.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) parts.push(json.slice(lastIndex, match.index));
    parts.push(
      <span key={match.index} className={getTokenClass(match[0])}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  parts.push(json.slice(lastIndex));
  return parts;
}

export default function JsonViewer({ value, label }) {
  return (
    <pre
      aria-label={label}
      tabIndex={0}
      className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200/80 bg-white p-5 font-mono text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    >
      {highlight(toPrettyJson(value))}
    </pre>
  );
}
