import { formatConfidence } from '../utils/format';
import Badge from './ui/Badge';

const CONFIDENCE_LEVELS = [
  { min: 0.9, label: 'High', tone: 'success', dotClass: 'bg-emerald-500' },
  { min: 0.7, label: 'Medium', tone: 'warning', dotClass: 'bg-amber-500' },
  { min: 0, label: 'Low', tone: 'danger', dotClass: 'bg-rose-500' },
];

/** Renders nothing when the backend did not provide a score. */
export default function ConfidenceBadge({ value }) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;

  const level = CONFIDENCE_LEVELS.find(({ min }) => value >= min);
  const percentage = formatConfidence(value);

  return (
    <Badge tone={level.tone} title={`${level.label} confidence`}>
      <span className={`h-1.5 w-1.5 rounded-full ${level.dotClass}`} aria-hidden="true" />
      <span className="sr-only">{level.label} confidence: </span>
      {percentage}
    </Badge>
  );
}
