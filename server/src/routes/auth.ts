import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .trim()
    .includes("@", { message: "Email must include @ symbol." })
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(120)
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[^A-Za-z0-9]/, "Password must include a symbol.")
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

function authResponse(user: { _id: unknown; name: string; email: string }) {
  const payload = {
    id: String(user._id),
    name: user.name,
    email: user.email
  };

  return {
    user: payload,
    token: signToken(payload)
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: body.email.toLowerCase() });

    if (existing) {
      throw new HttpError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash
    });

    res.status(201).json(authResponse(user));
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });

    if (!user) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches) {
      throw new HttpError(401, "Invalid email or password.");
    }

    res.json(authResponse(user));
  })
);

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out." });
});

export default router;
