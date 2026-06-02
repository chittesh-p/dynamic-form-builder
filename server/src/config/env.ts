import dotenv from "dotenv";

dotenv.config();

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || "").split(",")
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dynamic_form_builder",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  corsOrigins: Array.from(new Set(configuredOrigins))
};
