"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { notify } from "@/common/utils";
import { useAuth } from "../hooks";
import { loginSchema } from "@/common/utils";
import { Button, Input, AuthAlert, SkeletonForm, SkeletonText } from "@/components/ui";

interface FormErrors { email?: string; password?: string }

function LoginFormContent() {
  const { login, loginLoading } = useAuth();
  const searchParams = useSearchParams();
  const alertParam = searchParams ? searchParams.get("alert") : null;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err?.data?.error?.message || "Invalid email or password";
      notify.error(msg);
    }
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground tracking-wider uppercase">
        Login
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {alertParam === "email_sent" && (
          <AuthAlert
            type="success"
            message="We have sent an email. Please check the spam folder of your email account."
          />
        )}


        <Input 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          error={errors.email} 
          placeholder="you@example.com" 
        />
        
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          error={errors.password} 
          placeholder="Enter your password" 
        />

        <div className="flex items-center text-sm mt-5 mb-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary-ring cursor-pointer accent-primary"
            />
            <span className="text-muted font-medium">Keep me signed in</span>
          </label>
        </div>

        <Button type="submit" loading={loginLoading} className="w-full mt-2">
          Login
        </Button>
      </form>

      <p className="text-muted mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={
      <div className="guest-form-container w-full space-y-4">
        <SkeletonText className="mx-auto w-24 h-8 mb-6" />
        <SkeletonForm fields={2} />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
