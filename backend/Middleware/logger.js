import express from "express";
import { v4 as uuidv4 } from "uuid";
import { trace, context, SpanStatusCode, SpanKind } from "@opentelemetry/api";

/**
 * Log levels
 */
export const LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

/**
 * Helper to get request context
 */
const getRequestContext = (req) => {
  if (!req) return {};

  return {
    requestId: req.requestId,
    userId: req.headers["authorization"],
    method: req.method,
    url: req.originalUrl,
  };
};

/**
 * Helper to format error
 */
const formatError = (error) => ({
  error: error.message,
  stack: error.stack,
});

/**
 * Create log entry
 */
const createLogEntry = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  Object.keys(metadata).forEach((key) => {
    if (key !== "error" && metadata[key] !== undefined) {
      logEntry[key] = metadata[key];
    }
  });

  if (metadata.error) {
    const errorDetails = formatError(metadata.error);
    logEntry.error = errorDetails.error;
    logEntry.stack = errorDetails.stack;
  }

  return logEntry;
};

/**
 * Logger class
 */
class Logger {
  static instance;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || LogLevel.INFO;
    this.tracer = trace.getTracer(
      "habittrack-logger",
    );
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  shouldLog(level) {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    const currentLevel =
      process.env.LOG_LEVEL || LogLevel.INFO;

    return (
      levels.indexOf(level) <= levels.indexOf(currentLevel)
    );
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = createLogEntry(level, message, metadata);

    const activeSpan = trace.getActiveSpan(); //jo naya http request aaya usko ye get kar raha hai
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();
      logEntry.traceId = spanContext.traceId;
      logEntry.spanId = spanContext.spanId;
      logEntry.traceFlags = spanContext.traceFlags;

      const attributes = {
        "log.severity": level,
        "log.message": message,
        "log.logger": "habittrack-logger",
      };

      Object.entries(metadata).forEach(([key, value]) => {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          attributes[key] = value;
        } else if (value && typeof value === "object") {
          attributes[key] = JSON.stringify(value);
        }
      });

      activeSpan.addEvent("log", attributes);
    }

    if (level === LogLevel.ERROR) {
      console.error(JSON.stringify(logEntry));
      if (activeSpan && metadata.error) {
        activeSpan.recordException(metadata.error);
        activeSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: metadata.error.message,
        });
      }
    } else if (level === LogLevel.WARN) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message, error, metadata = {}) {
    if (error) metadata.error = error;
    this.log(LogLevel.ERROR, message, metadata);
  }

  warn(message, metadata = {}) {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message, metadata = {}) {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message, metadata = {}) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  errorWithContext(message, error, req, additionalMetadata = {}) {
    const ctx = getRequestContext(req);
    this.error(message, error, { ...ctx, ...additionalMetadata });
  }

  infoWithContext(message, req, additionalMetadata = {}) {
    const ctx = getRequestContext(req);
    this.info(message, { ...ctx, ...additionalMetadata });
  }

  warnWithContext(message, req, additionalMetadata = {}) {
    const ctx = getRequestContext(req);
    this.warn(message, { ...ctx, ...additionalMetadata });
  }

  createSpan(name, attributes = {}) {
    //Har incoming HTTP request ke liye:

        // Ek new span banata hai

        // Request kab start hui

        // Kitna time laga

        // Response status kya tha

        // Error aaya ya nahi
    return this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      attributes,
    });
  }

  async executeWithSpan(spanName, operation, attributes = {}) {
    const span = this.createSpan(spanName, attributes); 

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        async () => operation()
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      });
      throw err;
    } finally {
      span.end();
    }
  }

  measureDuration(operationName) {
    const startTime = Date.now();
    const span = this.createSpan(`duration_${operationName}`);

    return {
      end: (metadata = {}) => {
        const duration = Date.now() - startTime;

        span.setAttributes({
          "operation.name": operationName,
          "operation.duration_ms": duration,
        });
        span.end();

        this.info(`Operation completed: ${operationName}`, {
          ...metadata,
          operationName,
          durationMs: duration,
        });

        return duration;
      },
      span,
    };
  }
}

/**
 * Singleton logger
 */
 const logger = Logger.getInstance();
export  default logger;
/**
 * Express request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const startHrTime = process.hrtime();
  const requestId = uuidv4();
  req.requestId = requestId;

  const tracer = trace.getTracer(
    "habittrack-http",
  );

  const span = tracer.startSpan(
    `HTTP ${req.method} ${req.path}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        "http.method": req.method,
        "http.url": req.originalUrl,
        "http.route": req.path,
        "http.request_id": requestId,
      },
    }
  );

  res.on("finish", () => {
    const diff = process.hrtime(startHrTime);
    const elapsedMs = diff[0] * 1000 + diff[1] / 1e6;

    span.setAttributes({
      "http.status_code": res.statusCode,
      "http.duration_ms": elapsedMs,
    });

    if (res.statusCode >= 400) {
      span.setStatus({
        code:
          res.statusCode >= 500
            ? SpanStatusCode.ERROR
            : SpanStatusCode.OK,
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    span.end();

    console.log(
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        elapsedTimeMs: elapsedMs,
      })
    );
  });

  next();
};
