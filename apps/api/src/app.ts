import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/errors.js";
import { swaggerDocument } from "./docs/swagger.js";

const app: Express = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body Parsing
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Rate Limiting (Relaxed for dev/test, strict for prod)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  }
});
app.use("/api", limiter);

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use("/api", routes);

// Catch-all 404 for unmapped API endpoints
app.use("/api/*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`API endpoint '${req.originalUrl}' does not exist`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
