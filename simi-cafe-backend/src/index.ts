import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT || 9092;

// Middleware
app.set('trust proxy', 1); // Trust reverse proxy

app.use(helmet()); // Secure HTTP headers & HSTS
app.use(morgan('combined')); // HTTP request logging

// Prevent browser caching of API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT EXCEEDED] Global IP: ${req.ip} | URL: ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
  handler: (req, res, next, options) => {
    console.warn(`[ABUSE DETECTED] Excessive login attempts from IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 signups per hour
  message: { error: "Too many accounts created from this IP. Please try again later." },
  handler: (req, res, next, options) => {
    console.warn(`[ABUSE DETECTED] Excessive signup attempts from IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Apply specific limiters BEFORE the generic API limiter
app.use("/api/client/auth/login", loginLimiter);
app.use("/api/admin/auth/login", loginLimiter);
app.use("/api/client/auth/signup", signupLimiter);

app.use("/api/", apiLimiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(url => url.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:8349"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Setup Routers
import clientAuthRouter from "./routes/client/auth";
import clientMenuRouter from "./routes/client/menu";
import clientOrdersRouter from "./routes/client/orders";
import clientReservationsRouter from "./routes/client/reservations";
import clientUserRouter from "./routes/client/user";
import clientProfileRouter from "./routes/client/profile";

app.use("/api/client/auth", clientAuthRouter);
app.use("/api/client/menu", clientMenuRouter);
app.use("/api/client/orders", clientOrdersRouter);
app.use("/api/client/reservations", clientReservationsRouter);
app.use("/api/client/user", clientUserRouter);
app.use("/api/client/profile", clientProfileRouter);

import adminAuthRouter from "./routes/admin/auth";
import adminCategoriesRouter from "./routes/admin/categories";
import adminDashboardRouter from "./routes/admin/dashboard";
import adminDietTypesRouter from "./routes/admin/diet-types";
import adminMenuRouter from "./routes/admin/menu";
import adminOrdersRouter from "./routes/admin/orders";
import adminReservationsRouter from "./routes/admin/reservations";
import adminTagsRouter from "./routes/admin/tags";
import adminUploadRouter from "./routes/admin/upload";
import adminUsersRouter from "./routes/admin/users";

app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/categories", adminCategoriesRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/admin/diet-types", adminDietTypesRouter);
app.use("/api/admin/menu", adminMenuRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/reservations", adminReservationsRouter);
app.use("/api/admin/tags", adminTagsRouter);
app.use("/api/admin/upload", adminUploadRouter);
app.use("/api/admin/users", adminUsersRouter);

// Serve static files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[API ERROR] ${req.method} ${req.url} - ${err.message}`, err.stack);
  res.status(err.status || 500).json({ error: "Internal server error." });
});

import { initDb } from "./db";

app.listen(port, async () => {
  await initDb();
  console.log(`Backend server running on http://localhost:${port}`);
});
