/**
 * OpenTelemetry Configuration and Initialization
 * This module sets up OpenTelemetry instrumentation for tracing, metrics, and logs
 */

// Import ESM-style
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import os from "os";
// Initialize OpenTelemetry SDK
let sdk;

function initializeTelemetry() {
  try {
    // Create resource with service information
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.APP_NAME || "HabitTrack",
      [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || "1.0.0",
      "service.instance.id": process.env.HOSTNAME || os.hostname(),
      "host.name": process.env.HOSTNAME || os.hostname(),
    });

    // OTLP endpoints configuration
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";
    const otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS
      ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      : {};

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: otlpHeaders,
    });

    // Configure metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: `${otlpEndpoint}/v1/metrics`,
      headers: otlpHeaders,
    });

    // Configure log exporter
    const logExporter = new OTLPLogExporter({
      url: `${otlpEndpoint}/v1/logs`,
      headers: otlpHeaders,
    });

    // Create SDK with comprehensive instrumentation
    sdk = new NodeSDK({
      resource,
      traceExporter,
      logRecordProcessor: undefined, // We'll handle logs manually through our logger
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 30000, // Export every 30 seconds
      }),
      instrumentations: [
        //iske andar hi kya kya use kar rahe likhate hai jaise ki express,pg,http means that kya instruction aata hai
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            ignoreIncomingRequestHook: (req) => {
              const url = req.url || "";
              return url.includes("/health") || url.includes("/metrics") || url.includes("/favicon.ico");
            },
            ignoreOutgoingRequestHook: (options) => {
              const hostname = typeof options === "string" ? options : options?.hostname;
              return !!(hostname?.includes("localhost") && hostname?.includes("4318"));
            },
          },
          "@opentelemetry/instrumentation-express": { enabled: true },
          "@opentelemetry/instrumentation-pg": { enabled: true },
          "@opentelemetry/instrumentation-mongoose": { enabled: true },
          "@opentelemetry/instrumentation-redis": { enabled: true },
        }),
      ],
    });

    // Start the SDK
    sdk.start();

    console.log("OpenTelemetry initialized successfully");
    console.log(`Service: ${resource.attributes[ATTR_SERVICE_NAME]}`);
    console.log(`Version: ${resource.attributes[ATTR_SERVICE_VERSION]}`);
    console.log(`Environment: ${resource.attributes["deployment.environment"]}`);
    console.log(`OTLP Endpoint: ${otlpEndpoint}`);
  } catch (error) {
    console.error("Failed to initialize OpenTelemetry:", error);
  }
}

function shutdownTelemetry() {
  if (sdk) {
    return sdk
      .shutdown()
      .then(() => console.log("OpenTelemetry terminated"))
      .catch((error) => console.error("Error terminating OpenTelemetry", error));
  }
  return Promise.resolve();
}

// Graceful shutdown handling
process.on("SIGTERM", () => shutdownTelemetry().finally(() => process.exit(0)));
process.on("SIGINT", () => shutdownTelemetry().finally(() => process.exit(0)));

export { initializeTelemetry, shutdownTelemetry };
