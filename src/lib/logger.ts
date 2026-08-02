import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'
const isBrowser = typeof window !== 'undefined'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  formatters: {
    level: (label) => ({ level: label }),
  },

  serializers: {
    error: pino.stdSerializers.err,
  },

  browser: isBrowser
    ? {
        asObject: true,
      }
    : undefined,

  transport:
    isDev && !isBrowser
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})
