"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/common/utils";
import { Button, Input, SkeletonForm, SkeletonText } from "@/components/ui";
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

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      notify.error("Invalid or missing reset token. Please request a new link.");
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

    try {
      await resetPassword({ token, password }).unwrap();
      notify.success("Password has been reset successfully. Please login.");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      const msg = err?.data?.error?.message || "Failed to reset password. Please try again.";
      notify.error(msg);
    }
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground tracking-wider uppercase">
        Reset Password
      </h2>

      {!token ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-danger-muted border border-danger/20 p-4">
            <p className="text-sm text-danger font-medium">Missing or invalid token. Please check your email link or send a new request.</p>
          </div>
          <p className="text-muted mt-6 text-center">
            <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
              Go to Forgot Password
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted mb-4 text-center">
            Please choose a new secure password.
          </p>

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

          <p className="text-muted mt-6 text-center">
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

export function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <div className="guest-form-container w-full space-y-4">
        <SkeletonText className="mx-auto w-48 h-8 mb-6" />
        <SkeletonForm fields={2} />
      </div>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
