"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../hooks";
import { loginSchema } from "@/common/utils";
import { Button, Input, AuthAlert } from "@/components/ui";

interface FormErrors { email?: string; password?: string }

function LoginFormContent() {
  const { login, loginLoading } = useAuth();
  const searchParams = useSearchParams();
  const successParam = searchParams ? searchParams.get("success") : null;
  const alertParam = searchParams ? searchParams.get("alert") : null;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
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
    setErrors({});
    login(email, password)
      .catch(() => { setApiError("Invalid email or password"); });
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#0f172a] tracking-wider uppercase">
        Login
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {alertParam === "email_sent" && (
          <AuthAlert
            type="success"
            message="We have sent an email. Please check the spam folder of your email account."
          />
        )}

        {successParam && (
          <AuthAlert
            type="success"
            message={successParam}
          />
        )}
        
        {apiError && (
          <AuthAlert
            type="error"
            message={apiError}
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

        <div className="flex items-center justify-between text-sm mt-5 mb-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary-ring cursor-pointer accent-green-600"
            />
            <span className="text-slate-600 font-medium">Keep me signed in</span>
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" loading={loginLoading} className="w-full mt-2">
          Login
        </Button>
      </form>

      <p className="text-muted mt-6 text-center text-[#475569]">
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
    <Suspense fallback={<div className="text-center text-slate-500">Loading form...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
