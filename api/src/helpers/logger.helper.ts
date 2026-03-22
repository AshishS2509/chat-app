import pino from "pino";
import type { Options } from "pino-http";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const loggerOptions: Options = {
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "error";
    return "info";
  },
  serializers: {
    req: () => undefined,
    res: () => undefined,
    responseTime: () => undefined,
    err: () => undefined,
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} => ${res.statusCode} `;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} => ${res.statusCode} ERROR: ${err.message}`;
  },
};
