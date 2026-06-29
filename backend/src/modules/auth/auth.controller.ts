import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { environment } from "../../config/environment";
import { createUser, findUserByEmail, findUserById, validatePassword, updateUserPassword, updateUserProfile } from "./auth.model";
import { AuthenticationError, NotFoundError } from "../../shared/errors";
import type { AuthenticatedRequest } from "../../middleware/authenticate";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "Email already registered" },
      });
      return;
    }
    const user = await createUser(email, password, name);
    const token = jwt.sign({ userId: user.id }, environment.jwtSecret, {
      expiresIn: "7d",
    });
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }
    await validatePassword(password, user.password);
    const token = jwt.sign({ userId: user.id }, environment.jwtSecret, {
      expiresIn: "7d",
    });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, token } });
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await findUserById(req.userId!);
    if (!user) throw new NotFoundError("User");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  avatar_url: z.string().nullable().optional(),
});

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.userId!, updates);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "No file uploaded" } });
      return;
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await updateUserProfile(req.userId!, { avatar_url: avatarUrl });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function removeAvatar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await updateUserProfile(req.userId!, { avatar_url: null });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (!user) {
      res.json({ success: true, message: "If the email is registered, we have sent instructions." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, environment.jwtSecret, {
      expiresIn: "1h",
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Volunteer Yatra <onboarding@resend.dev>",
          to: [email],
          subject: "Reset your password - Volunteer Yatra",
          html: `<p>You requested a password reset. Click this link to reset your password:</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>
                 <p>This link is valid for 1 hour.</p>`
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend API error:", errText);
      }
    } else {
      console.warn("RESEND_API_KEY is not defined. Password reset link:", resetLink);
    }

    res.json({ success: true, message: "Password reset link generated and sent." });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    let payload: any;
    try {
      payload = jwt.verify(token, environment.jwtSecret);
    } catch {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Invalid or expired reset token" }
      });
      return;
    }

    await updateUserPassword(payload.userId, password);
    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
}
