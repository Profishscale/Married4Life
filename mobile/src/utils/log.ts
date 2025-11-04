/**
 * Lightweight logging utility with prefixes
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const PREFIX = '[Married4Life]';

export const log = {
  info: (message: string, ...args: any[]) => {
    console.log(`${PREFIX} [INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${PREFIX} [WARN] ${message}`, ...args);
  },
  error: (message: string, error?: Error | unknown, ...args: any[]) => {
    if (error instanceof Error) {
      console.error(`${PREFIX} [ERROR] ${message}`, error.message, error.stack, ...args);
    } else {
      console.error(`${PREFIX} [ERROR] ${message}`, error, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`${PREFIX} [DEBUG] ${message}`, ...args);
    }
  },
};

