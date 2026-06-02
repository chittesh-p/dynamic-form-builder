import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f8f7f4",
        moss: "#4f6f52",
        coral: "#d96c58",
        ocean: "#256f87",
        lemon: "#f3c969"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

