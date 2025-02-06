import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as process from 'process';

// Define log level types and mappings
type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';
type WinstonLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

const LOG_LEVEL_MAP: Record<LogLevel, WinstonLevel> = {
  error: 'error',
  warn: 'warn',
  log: 'info',
  debug: 'debug',
  verbose: 'verbose',
};

export const DEFAULT_LOG_LEVELS: LogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

interface LoggerConfig {
  enabled: boolean;
  levels?: LogLevel[];
}

export const getLoggerConfig = (): LoggerConfig => {
  const enabled = process.env.LOGGING_ENABLED?.toLowerCase() === 'true';

  if (!enabled) {
    console.info('Logging is disabled');
    return { enabled: false };
  }

  const levels = process.env.LOG_LEVELS?.split(',')
    .map((level) => level.trim().toLowerCase())
    .filter((level): level is LogLevel => {
      const isValid = DEFAULT_LOG_LEVELS.includes(level as LogLevel);
      if (!isValid) {
        console.warn(`Invalid log level "${level}" provided - ignoring`);
      }
      return isValid;
    });

  const finalLevels = levels?.length ? levels : DEFAULT_LOG_LEVELS;
  // console.info(`Enabled log levels: ${finalLevels.join(', ')}`);

  return {
    enabled,
    levels: finalLevels,
  };
};

const createConsoleTransport = (levels: LogLevel[]) => {
  const winstonLevels = levels.map((level) => LOG_LEVEL_MAP[level]);

  return new winston.transports.Console({
    level: Math.max(
      ...winstonLevels.map((level) => winston.config.npm.levels[level]),
    ).toString(),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
        prettyPrint: true,
        colors: true,
        processId: true,
        appName: true,
      }),
    ),
  });
};

const createFileTransports = (levels: LogLevel[]) => {
  const winstonLevels = levels.map((level) => LOG_LEVEL_MAP[level]);
  const transports: winston.transport[] = [];

  // add error transport
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  );

  // Add general log file if any levels are enabled
  if (levels.length > 0) {
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: Math.max(
          ...winstonLevels.map((level) => winston.config.npm.levels[level]),
        ).toString(),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return transports;
};

export const loggerConfig = (() => {
  const config = getLoggerConfig();

  if (!config.enabled) {
    return {
      transports: [
        new winston.transports.Console({
          silent: true,
        }),
      ],
    };
  }

  return {
    transports: [
      createConsoleTransport(config.levels || DEFAULT_LOG_LEVELS),
      ...createFileTransports(config.levels || DEFAULT_LOG_LEVELS),
    ],
  };
})();
