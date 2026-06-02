import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import formRoutes from "./routes/forms.js";
import publicFormRoutes from "./routes/publicForms.js";
import responseRoutes from "./routes/responses.js";
import submissionRoutes from "./routes/submissions.js";

const app = express();
const allowedOrigins = new Set([
  env.clientUrl,
  ...env.corsOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("This origin is not allowed by CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "dynamic-form-builder-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/public", publicFormRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start API", error);
    process.exit(1);
  });
