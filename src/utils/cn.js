/** Joins truthy class names: cn('a', isActive && 'b') -> 'a b'. */
export function cn(...classNames) {
  return classNames.filter(Boolean).join(' ');
}
