"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, AuthAlert } from "@/components/ui";
import { useResetPasswordMutation } from "../services";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface FormErrors { password?: string; confirmPassword?: string }

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    
    if (!token) {
      setApiError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    const result = schema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    resetPassword({ token, password }).unwrap()
      .then(() => {
        router.push("/login?success=Password+has+been+reset+successfully.");
      })
      .catch((err: any) => {
        const msg = err?.data?.error?.message || err?.data?.message || "Failed to reset password. Please try again.";
        setApiError(msg);
      });
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#0f172a] tracking-wider uppercase">
        Reset Password
      </h2>

      {!token ? (
        <div className="space-y-4">
          <AuthAlert type="error" message="Missing or invalid token. Please check your email link or send a new request." />
          <p className="text-muted mt-6 text-center text-[#475569]">
            <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
              Go to Forgot Password
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-500 mb-4 text-center">
            Please choose a new secure password.
          </p>

          {apiError && <AuthAlert type="error" message={apiError} />}

          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
          />

          <Button type="submit" loading={isLoading} className="w-full mt-6">
            Reset Password
          </Button>

          <p className="text-muted mt-6 text-center text-[#475569]">
            Back to{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
