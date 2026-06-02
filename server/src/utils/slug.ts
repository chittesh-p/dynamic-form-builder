import crypto from "crypto";

export function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  return `${base || "form"}-${crypto.randomBytes(3).toString("hex")}`;
}

