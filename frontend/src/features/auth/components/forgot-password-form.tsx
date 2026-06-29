"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/common/utils";
import { Button, Input, SkeletonForm, SkeletonText } from "@/components/ui";
import { useForgotPasswordMutation } from "../services";

function ForgotPasswordFormContent() {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notify.error("Please enter your email address.");
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      notify.success("Reset link sent! Check your email.");
      setTimeout(() => router.push("/login?alert=email_sent"), 800);
    } catch (err: any) {
      const msg = err?.data?.error?.message || "Something went wrong. Please try again.";
      notify.error(msg);
    }
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground tracking-wider uppercase">
        Forgot Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted mb-4 text-center">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <Button type="submit" loading={isLoading} className="w-full mt-6">
          Send Reset Link
        </Button>

        <p className="text-muted mt-6 text-center">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  return (
    <Suspense fallback={
      <div className="guest-form-container w-full space-y-4">
        <SkeletonText className="mx-auto w-48 h-8 mb-6" />
        <SkeletonForm fields={1} />
      </div>
    }>
      <ForgotPasswordFormContent />
    </Suspense>
  );
}
