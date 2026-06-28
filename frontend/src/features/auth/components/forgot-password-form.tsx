"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, AuthAlert } from "@/components/ui";
import { useForgotPasswordMutation } from "../services";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");

    forgotPassword({ email }).unwrap()
      .then(() => {
        router.push("/login?alert=email_sent");
      })
      .catch((err: any) => {
        const msg = err?.data?.error?.message || err?.data?.message || "Something went wrong. Please try again.";
        setError(msg);
      });
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#0f172a] tracking-wider uppercase">
        Forgot Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 mb-4 text-center">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>

        {error && <AuthAlert type="error" message={error} />}

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

        <p className="text-muted mt-6 text-center text-[#475569]">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
