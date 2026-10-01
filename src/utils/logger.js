/**
 * Tiny leveled logger. Verbose (debug and up) in development, warnings and
 * errors only in production builds. This is the only module that may use the console.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const minimumLevel = import.meta.env.DEV ? LEVELS.debug : LEVELS.warn;

function write(level, scope, message, details) {
  if (LEVELS[level] < minimumLevel) return;

  const time = new Date().toISOString().slice(11, 23);
  const prefix = `${time} ${level.toUpperCase()} [${scope}]`;
  const args = details === undefined ? [prefix, message] : [prefix, message, details];
  console[level](...args);
}

export function createLogger(scope) {
  return {
    debug: (message, details) => write('debug', scope, message, details),
    info: (message, details) => write('info', scope, message, details),
    warn: (message, details) => write('warn', scope, message, details),
    error: (message, details) => write('error', scope, message, details),
  };
}
